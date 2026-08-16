import hashlib
from datetime import datetime, timezone

from app.knowledge import load_knowledge, save_knowledge


def _content_hash(title, content):
    raw = f"{title}\n{content}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def upsert_source(title, content, source, url=None):
    title = str(title).strip()
    content = str(content).strip()
    source = str(source or "manual").strip() or "manual"

    if not title or not content:
        raise ValueError("title and content are required")

    entries = load_knowledge()
    content_hash = _content_hash(title, content)
    now = datetime.now(timezone.utc).isoformat()

    for entry in entries:
        if entry.get("source") == source and entry.get("title") == title:
            if entry.get("content_hash") == content_hash:
                return entry, False

            entry.update({
                "content": content,
                "url": url,
                "content_hash": content_hash,
                "updated_at": now,
            })
            save_knowledge(entries)
            return entry, True

    entry = {
        "id": max((item.get("id", 0) for item in entries), default=0) + 1,
        "title": title,
        "content": content,
        "source": source,
        "url": url,
        "content_hash": content_hash,
        "created_at": now,
        "updated_at": now,
    }
    entries.append(entry)
    save_knowledge(entries)
    return entry, True
