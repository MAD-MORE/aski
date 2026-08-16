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
    return [{**doc, "relevance": round(score, 4), "retrieval": "keyword"} for score, doc in scored[:limit]]


def semantic_search(question, documents=None, limit=5):
    documents = documents or []
    semantic = []
    try:
        semantic = vector_search(question, limit=limit * 2)
    except Exception:
        semantic = []

    lexical = lexical_search(question, documents, limit=limit * 2)
    merged = {}

    # Reciprocal-rank fusion keeps semantic matches useful even when wording differs,
    # while keyword overlap protects exact terms such as dates, programme names and codes.
    for rank, item in enumerate(semantic, 1):
        key = item.get("id") or item.get("url") or item.get("title")
        merged.setdefault(key, {**item, "_rrf": 0.0})
        merged[key]["_rrf"] += 1.0 / (60 + rank)
        merged[key]["retrieval"] = "hybrid"

    for rank, item in enumerate(lexical, 1):
        key = item.get("id") or item.get("url") or item.get("title")
        merged.setdefault(key, {**item, "_rrf": 0.0})
        merged[key]["_rrf"] += 1.0 / (60 + rank)
        merged[key]["retrieval"] = "hybrid"

    results = list(merged.values())
    results.sort(key=lambda item: item["_rrf"], reverse=True)
    for item in results:
        item["relevance"] = round(item["_rrf"], 6)
        item.pop("_rrf", None)
    return results[:limit]
