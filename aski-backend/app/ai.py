import os
import re
import requests


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


def _gemini_answer(prompt):
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    response = requests.post(url, params={"key": key}, json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2}}, timeout=60)
    if not response.ok:
        error = RuntimeError(f"Gemini returned HTTP {response.status_code}: {response.text[:500]}")
        error.status_code = response.status_code
        raise error
    data = response.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
    if not text:
        raise RuntimeError("Gemini returned no answer")
    return {"answer": _clean_answer(text), "provider": "gemini", "model": model}


def _groq_answer(prompt):
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return None
    model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}, json={"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}, timeout=60)
    if not response.ok:
        error = RuntimeError(f"Groq returned HTTP {response.status_code}: {response.text[:500]}")
        error.status_code = response.status_code
        raise error
    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not text:
        raise RuntimeError("Groq returned no answer")
    return {"answer": _clean_answer(text), "provider": "groq", "model": model}


def _openrouter_answer(prompt):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return None
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "HTTP-Referer": os.getenv("ASKI_SITE_URL", "https://aski-theta.vercel.app"), "X-Title": "ASKI"}, json={"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}, timeout=60)
    if not response.ok:
        error = RuntimeError(f"OpenRouter returned HTTP {response.status_code}: {response.text[:500]}")
        error.status_code = response.status_code
        raise error
    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not text:
        raise RuntimeError("OpenRouter returned no answer")
    return {"answer": _clean_answer(text), "provider": "openrouter", "model": data.get("model") or model}


def generate_answer(question, context, history=None, profile=None):
    prompt = _build_prompt(question, context, history, profile)

    # Ordered provider failover. Each provider gets one attempt; transient or
    # quota failures move to the next provider. This prevents one exhausted
    # free tier from taking ASKI offline.
    providers = []
    if os.getenv("GEMINI_API_KEY"):
        providers.append(_gemini_answer)
    if os.getenv("GROQ_API_KEY"):
        providers.append(_groq_answer)
    if os.getenv("OPENROUTER_API_KEY"):
        providers.append(_openrouter_answer)
    if os.getenv("OPENAI_API_KEY"):
        providers.append(_openai_answer)

    errors = []
    for provider in providers:
        try:
            result = provider(prompt)
            if result:
                return result
        except Exception as exc:
            errors.append(str(exc))

    return {
        "answer": _source_fallback(question, context),
        "provider": "ucc-knowledge-fallback",
        "model": None,
        "provider_warning": "All configured AI providers are temporarily unavailable" if errors else "No AI provider is configured",
    }


def _openai_answer(prompt):
    from openai import OpenAI
    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    response = OpenAI(api_key=os.getenv("OPENAI_API_KEY")).responses.create(model=model, input=prompt)
    return {"answer": _clean_answer(response.output_text), "provider": "openai", "model": model}
