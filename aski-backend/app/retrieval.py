import re


def _tokens(text):
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def search_knowledge(query, entries, limit=5):
    query_tokens = _tokens(query)
    if not query_tokens:
        return []

    ranked = []
    for entry in entries:
        text = f"{entry.get('title', '')} {entry.get('content', '')}"
        tokens = _tokens(text)
        score = len(query_tokens & tokens)
        if score:
            ranked.append((score, entry))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [entry for _, entry in ranked[:limit]]
