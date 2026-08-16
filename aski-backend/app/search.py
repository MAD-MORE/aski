import re

from app.embeddings import semantic_search as vector_search


def tokenize(text):
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def lexical_search(question, documents, limit=5):
    q = tokenize(question)
    if not q:
        return []
    scored = []
    for doc in documents:
        words = tokenize(f"{doc.get('title', '')} {doc.get('content', '')}")
        overlap = len(q & words)
        score = overlap / max(len(q), 1)
        if score > 0:
            scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [{**doc, "relevance": round(score, 4)} for score, doc in scored[:limit]]


def semantic_search(question, documents=None, limit=5):
    try:
        results = vector_search(question, limit=limit)
        if results:
            return results
    except Exception:
        pass
    return lexical_search(question, documents or [], limit=limit)
