import os
import re
import requests


def _build_prompt(question, context, history=None, profile=None):
    blocks = []
    warnings = []
    for item in context:
        freshness = item.get("freshness") or {}
        checked = freshness.get("last_checked") or freshness.get("updated_at") or "unknown"
        block = (
            f"[{item.get('title', 'Untitled')}]\n{item.get('content', '')}\n"
            f"SOURCE_TITLE: {item.get('title', 'Untitled')}\n"
            f"SOURCE_VERIFIED: {item.get('source_verified', False)}\n"
            f"LAST_VERIFIED: {checked}"
        )
        blocks.append(block)
        if item.get("conflict_warning"):
            warnings.append(item["conflict_warning"])
    context_text = "\n\n".join(blocks) or "No matching verified knowledge was found."
    warning_text = "\n".join(sorted(set(warnings))) or "No source conflict was detected."
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in (history or [])[-8:])
    return (
        "You are ASKI, a university information assistant. Answer using only verified context. "
        "If the context is insufficient, explicitly say you do not have enough verified information. "
        "Never invent institutional dates, fees, rules, requirements, or policies. "
        "Preserve the exact meaning of dates: reporting, registration, lecture, examination, deadline, etc. "
        "If official sources conflict, explain the conflict and identify which source states which date; never silently merge them. "
        "Do not call a fresh-student reporting date a universal reopening date unless the source explicitly says so. "
        "Do not output, rewrite, guess, or manufacture URLs. The application supplies authoritative source URLs separately.\n\n"
        f"STUDENT PROFILE: {str(profile or {})}\n\nCONVERSATION:\n{history_text}\n\n"
        f"SOURCE CONFLICT CHECK:\n{warning_text}\n\nVERIFIED CONTEXT:\n{context_text}\n\nQUESTION: {question}"
    )


def _clean_answer(text):
    return re.sub(r"https?://[^\s)\]>]+", "", text or "").strip()


def _source_fallback(question, context):
    """Keep ASKI useful when an external model quota is exhausted.

    This is deliberately extractive: it never invents facts and only exposes
    verified context already selected by the RAG layer.
    """
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


def _openrouter_answer(prompt):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return None
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "HTTP-Referer": os.getenv("ASKI_SITE_URL", "https://aski-theta.vercel.app"), "X-Title": "ASKI"},
        json={"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2},
        timeout=60,
    )
    if not response.ok:
        try:
            detail = response.json()
        except Exception:
            detail = response.text[:500]
        error = RuntimeError(f"AI provider returned HTTP {response.status_code}: {detail}")
        error.status_code = response.status_code
        raise error
    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not text:
        raise RuntimeError("Free AI provider returned no answer")
    return {"answer": _clean_answer(text), "provider": "openrouter", "model": data.get("model") or model}


def _openai_answer(prompt):
    from openai import OpenAI
    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    response = OpenAI(api_key=os.getenv("OPENAI_API_KEY")).responses.create(model=model, input=prompt)
    return {"answer": _clean_answer(response.output_text), "provider": "openai", "model": model}


def generate_answer(question, context, history=None, profile=None):
    prompt = _build_prompt(question, context, history, profile)

    # Prefer a configured paid/organization model when available. This avoids
    # consuming OpenRouter's shared free-model daily quota unnecessarily.
    if os.getenv("OPENAI_API_KEY"):
        try:
            return _openai_answer(prompt)
        except Exception:
            pass

    try:
        result = _openrouter_answer(prompt)
        if result:
            return result
    except Exception as openrouter_exc:
        # A 429 is a provider quota problem, not an ASKI knowledge failure.
        # Fall back to verified RAG content instead of displaying a raw stack/error.
        if getattr(openrouter_exc, "status_code", None) == 429:
            return {
                "answer": _source_fallback(question, context),
                "provider": "ucc-knowledge-fallback",
                "model": None,
                "provider_warning": "AI model quota temporarily exhausted",
            }
        return {
            "answer": _source_fallback(question, context),
            "provider": "ucc-knowledge-fallback",
            "model": None,
            "provider_warning": str(openrouter_exc),
        }

    return {
        "answer": _source_fallback(question, context),
        "provider": "ucc-knowledge-fallback",
        "model": None,
        "provider_warning": "No AI provider is configured",
    }
