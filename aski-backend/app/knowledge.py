from app.database import SessionLocal, init_db
from app.models import KnowledgeDocument


def load_knowledge():
    init_db()
    session = SessionLocal()
    try:
        rows = session.query(KnowledgeDocument).order_by(KnowledgeDocument.id).all()
        return [
            {
                "id": row.id,
                "title": row.title,
                "content": row.content,
                "source": row.source,
                "url": row.url,
                "content_hash": row.content_hash,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            }
            for row in rows
        ]
    finally:
        session.close()


def save_knowledge(entries):
    init_db()
    session = SessionLocal()
    try:
        for item in entries:
            existing = session.get(KnowledgeDocument, item.get("id"))
            if existing:
                existing.title = item.get("title", existing.title)
                existing.content = item.get("content", existing.content)
                existing.source = item.get("source", existing.source)
                existing.url = item.get("url")
                existing.content_hash = item.get("content_hash")
            else:
                session.add(KnowledgeDocument(
                    id=item.get("id"),
                    title=item.get("title", "Untitled"),
                    content=item.get("content", ""),
                    source=item.get("source", "manual"),
                    url=item.get("url"),
                    content_hash=item.get("content_hash"),
                ))
        session.commit()
    finally:
        session.close()
