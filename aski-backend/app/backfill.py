from app.database import SessionLocal, init_db
from app.models import KnowledgeDocument
from app.embeddings import embed_all_documents


def backfill_embeddings():
    init_db()
    session = SessionLocal()
    try:
        rows = session.query(KnowledgeDocument).order_by(KnowledgeDocument.id).all()
        documents = [
            {"id": row.id, "title": row.title, "content": row.content}
            for row in rows
        ]
        return embed_all_documents(documents)
    finally:
        session.close()
