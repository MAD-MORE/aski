import os
import re
import time
import requests

# Short-lived circuit breakers prevent an exhausted provider from being hammered
# on every request. This is intentionally process-local; each server instance
# protects itself without storing secrets.
_PROVIDER_COOLDOWN_UNTIL = {}


def _build_prompt(question, context, history=None, profile=None):
    blocks = []
    warnings = []
    for item in context:
        freshness = item.get("freshness") or {}
        checked = freshness.get("last_checked") or freshness.get("updated_at") or "unknown"
        blocks.append(
            f"[{item.get('title', 'Untitled')}]\n{item.get('content', '')}\n"
            f"SOURCE_TITLE: {item.get('title', 'Untitled')}\n"
            f"SOURCE_VERIFIED: {item.get('source_verified', False)}\n"
            f"LAST_VERIFIED: {checked}"
        )
        if item.get("conflict_warning"):
            warnings.append(item["conflict_warning"])
    context_text = "\n\n".join(blocks) or "No matching verified knowledge was found."
    warning_text = "\n".join(sorted(set(warnings))) or "No source conflict was detected."
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in (history or [])[-8:])
    return (
        "You are ASKI, a university information assistant. Answer using only verified context. "
        "If the context is insufficient, explicitly say you do not have enough verified information. "
        "Never invent institutional dates, fees, rules, requirements, or policies. "
        "Preserve exact date meanings and explain source conflicts. Do not manufacture URLs.\n\n"
        f"STUDENT PROFILE: {str(profile or {})}\n\nCONVERSATION:\n{history_text}\n\n"
        f"SOURCE CONFLICT CHECK:\n{warning_text}\n\nVERIFIED CONTEXT:\n{context_text}\n\nQUESTION: {question}"
    )


def _clean_answer(text):
    return re.sub(r"https?://[^\s)\]>]+", "", text or "").strip()


def _source_fallback(question, context):
    if not context:
        return "I can't answer that yet because I don't have enough verified UCC information for this question."
    snippets = []
    for item in context[:3]:
        title = item.get("title") or "UCC source"
        content = re.sub(r"\s+", " ", item.get("content", "")).strip()
        if content:
            snippets.append(f"From {title}: {content[:700]}")
    if not snippets:
        return "I found relevant UCC sources, but they do not contain enough text to answer this question right now."
    return "The AI model is temporarily unavailable, so I'm giving you the verified information available in the UCC knowledge base:\n\n" + "\n\n".join(snippets)


def _cooldown(provider, response):
    retry_after = response.headers.get("Retry-After")
    try:
        seconds = max(30, min(int(float(retry_after)), 3600)) if retry_after else 300
    except (TypeError, ValueError):
        seconds = 300
    _PROVIDER_COOLDOWN_UNTIL[provider] = time.time() + seconds


def _is_available(provider):
    return time.time() >= _PROVIDER_COOLDOWN_UNTIL.get(provider, 0)


def _provider_error(provider, response):
    error = RuntimeError(f"{provider} returned HTTP {response.status_code}: {response.text[:500]}")
    error.status_code = response.status_code
    if response.status_code == 429:
        _cooldown(provider, response)
    return error


def _gemini_answer(prompt):
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        params={"key": key},
        json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2}},
        timeout=45,
    )
    if not response.ok:
        raise _provider_error("Gemini", response)
    data = response.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
    if not text:
        raise RuntimeError("Gemini returned no answer")
    return {"answer": _clean_answer(text), "provider": "gemini", "model": model}


def _grok_answer(prompt):
    # xAI's API is the Grok provider. Keep the ASKI provider name as `grok`
    # while using the documented XAI_API_KEY environment variable internally.
    key = os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY")
    if not key:
        return None
    model = os.getenv("GROK_MODEL", "grok-4.5")
    response = requests.post(
        "https://api.x.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "stream": False,
        },
        timeout=60,
    )
    if not response.ok:
        raise _provider_error("Grok", response)
    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not text:
        raise RuntimeError("Grok returned no answer")
    return {"answer": _clean_answer(text), "provider": "grok", "model": data.get("model") or model}


def _openrouter_answer(prompt):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return None
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("ASKI_SITE_URL", "https://aski-theta.vercel.app"),
            "X-Title": "ASKI",
        },
        json={"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2},
        timeout=45,
    )
    if not response.ok:
        raise _provider_error("OpenRouter", response)
    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not text:
        raise RuntimeError("OpenRouter returned no answer")
    return {"answer": _clean_answer(text), "provider": "openrouter", "model": data.get("model") or model}


def generate_answer(question, context, history=None, profile=None):
    prompt = _build_prompt(question, context, history, profile)

    # Provider names are deliberately stable inside ASKI. `grok` maps to the
    # xAI API, so the public configuration stays Gemini -> Grok -> OpenRouter.
    provider_map = {
        "gemini": _gemini_answer,
        "grok": _grok_answer,
        "openrouter": _openrouter_answer,
    }
    key_map = {
        "gemini": "GEMINI_API_KEY",
        "grok": ("XAI_API_KEY", "GROK_API_KEY"),
        "openrouter": "OPENROUTER_API_KEY",
    }
    configured_order = os.getenv("ASKI_PROVIDER_ORDER", "gemini,grok,openrouter")
    configured = [name.strip().lower() for name in configured_order.split(",") if name.strip()]

    providers = []
    for name in configured:
        if name not in provider_map or not _is_available(name):
            continue
        keys = key_map[name]
        if isinstance(keys, tuple):
            has_key = any(os.getenv(key) for key in keys)
        else:
            has_key = bool(os.getenv(keys))
        if has_key:
            providers.append((name, provider_map[name]))

    errors = []
    for name, provider in providers:
        try:
            result = provider(prompt)
            if result:
                return result
        except Exception as exc:
            errors.append(f"{name}: {exc}")

    return {
        "answer": _source_fallback(question, context),
        "provider": "ucc-knowledge-fallback",
        "model": None,
        "provider_warning": "AI providers are temporarily unavailable; verified UCC knowledge was used" if errors else "No AI provider is configured",
    }
