from app.database import SessionLocal, init_db
from app.embeddings import init_vector_store, upsert_embedding
from app.models import KnowledgeDocument


if __name__ == "__main__":
    init_db()
    if not init_vector_store():
        raise SystemExit("DATABASE_URL must point to PostgreSQL for pgvector backfill.")
    session = SessionLocal()
    try:
        rows = session.query(KnowledgeDocument).all()
        for row in rows:
            upsert_embedding(row.id, row.title, row.content)
        print(f"Embedded {len(rows)} knowledge documents.")
    finally:
        session.close()
