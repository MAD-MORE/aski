import os

from openai import OpenAI


def generate_answer(question, context):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "answer": "AI provider is not configured yet. Add OPENAI_API_KEY to enable generated answers.",
            "provider": "not_configured",
        }

    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    client = OpenAI(api_key=api_key)

    context_text = "\n\n".join(
        f"[{item.get('title', 'Untitled')}]\n{item.get('content', '')}"
        for item in context
    )
    if not context_text:
        context_text = "No matching ASKI knowledge was found."

    prompt = (
        "You are ASKI, an AI learning assistant. Answer the user's question clearly "
        "and accurately. Use the supplied ASKI knowledge when relevant. If the knowledge "
        "does not contain the answer, say that it is not in the current knowledge base "
        "instead of inventing institutional facts.\n\n"
        f"ASKI knowledge:\n{context_text}\n\n"
        f"User question: {question}"
    )

    response = client.responses.create(model=model, input=prompt)
    return {
        "answer": response.output_text,
        "provider": "openai",
        "model": model,
    }
