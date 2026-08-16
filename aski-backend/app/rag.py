from app.search import semantic_search


def build_context(question, documents, limit=5):
    matches = semantic_search(question, documents, limit=limit)
    context = "\n\n".join(
        f"SOURCE: {item.get('title')}\nCONTENT: {item.get('content')}\nURL: {item.get('url') or 'N/A'}"
        for item in matches
    )
    return context, matches


def grounded_prompt(question, context):
    return f"""You are ASKI, a university information assistant.\nAnswer only from the supplied verified context. If the context is insufficient, say you do not have enough verified information. Never invent dates, fees, rules, or requirements.\n\nCONTEXT:\n{context}\n\nQUESTION:\n{question}\n"""
