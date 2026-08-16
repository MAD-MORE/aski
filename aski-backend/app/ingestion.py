import hashlib
from datetime import datetime, timezone

from app.database import SessionLocal, init_db
from app.embeddings import upsert_embedding
from app.models import KnowledgeDocument


def _content_hash(title, content):
    raw = f"{title}\n{content}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def upsert_source(title, content, source, url=None):
    title = str(title).strip()
    content = str(content).strip()
    source = str(source or "manual").strip() or "manual"
    if not title or not content:
        raise ValueError("title and content are required")

    init_db()
    session = SessionLocal()
    content_hash = _content_hash(title, content)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    try:
        entry = session.query(KnowledgeDocument).filter_by(source=source, title=title).first()
        if entry and entry.content_hash == content_hash:
            return _serialize(entry), False
        if entry:
            entry.content = content
            entry.url = url
            entry.content_hash = content_hash
            entry.updated_at = now
            session.commit()
            result = _serialize(entry)
        else:
            entry = KnowledgeDocument(title=title, content=content, source=source, url=url, content_hash=content_hash)
            session.add(entry)
            session.commit()
            session.refresh(entry)
            result = _serialize(entry)
    finally:
        session.close()

    try:
        upsert_embedding(result["id"], result["title"], result["content"])
    except Exception:
        # Knowledge ingestion must remain usable if embeddings are unavailable.
        pass
    return result, True


def _serialize(row):
    return {
        "id": row.id, "title": row.title, "content": row.content,
        "source": row.source, "url": row.url, "content_hash": row.content_hash,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }
