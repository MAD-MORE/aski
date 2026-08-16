import os

from openai import OpenAI


def generate_answer(question, context, history=None, profile=None):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"answer": "AI provider is not configured yet.", "provider": "not_configured"}

    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    client = OpenAI(api_key=api_key)
    context_text = "\n\n".join(
        f"[{item.get('title', 'Untitled')}]\n{item.get('content', '')}\nURL: {item.get('url') or 'N/A'}"
        for item in context
    ) or "No matching verified knowledge was found."
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in (history or [])[-8:])
    profile_text = str(profile or {})
    prompt = (
        "You are ASKI, a university information assistant. Answer using only verified context. "
        "If the context is insufficient, explicitly say you do not have enough verified information. "
        "Never invent institutional dates, fees, rules, requirements, or policies. Cite source URLs inline when useful.\n\n"
        f"STUDENT PROFILE: {profile_text}\n\nCONVERSATION:\n{history_text}\n\n"
        f"VERIFIED CONTEXT:\n{context_text}\n\nQUESTION: {question}"
    )
    response = client.responses.create(model=model, input=prompt)
    return {"answer": response.output_text, "provider": "openai", "model": model}
