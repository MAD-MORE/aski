import os

from sqlalchemy import text

from app.database import engine

EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIMENSIONS = 1536


def _client():
    from openai import OpenAI
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    return OpenAI(api_key=key)


def init_vector_store():
    if engine.dialect.name != "postgresql":
        return False
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS knowledge_embeddings (
                document_id INTEGER PRIMARY KEY REFERENCES knowledge_documents(id) ON DELETE CASCADE,
                embedding vector(1536) NOT NULL,
                model VARCHAR(100) NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS knowledge_embeddings_hnsw
            ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops)
        """))
    return True


def embed_text(text_value):
    client = _client()
    if not client:
        return None
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=text_value)
    return response.data[0].embedding


def upsert_embedding(document_id, title, content):
    if not init_vector_store():
        return False
    vector = embed_text(f"{title}\n{content}")
    if vector is None:
        return False
    vector_sql = "[" + ",".join(str(x) for x in vector) + "]"
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO knowledge_embeddings (document_id, embedding, model, updated_at)
            VALUES (:id, CAST(:embedding AS vector), :model, CURRENT_TIMESTAMP)
            ON CONFLICT (document_id) DO UPDATE SET
                embedding = EXCLUDED.embedding,
                model = EXCLUDED.model,
                updated_at = CURRENT_TIMESTAMP
        """), {"id": document_id, "embedding": vector_sql, "model": EMBEDDING_MODEL})
    return True


def semantic_search(question, limit=5):
    if engine.dialect.name != "postgresql":
        return []
    init_vector_store()
    vector = embed_text(question)
    if vector is None:
        return []
    vector_sql = "[" + ",".join(str(x) for x in vector) + "]"
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT d.id, d.title, d.content, d.source, d.url, d.content_hash,
                   1 - (e.embedding <=> CAST(:embedding AS vector)) AS relevance
            FROM knowledge_embeddings e
            JOIN knowledge_documents d ON d.id = e.document_id
            ORDER BY e.embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """), {"embedding": vector_sql, "limit": limit}).mappings().all()
    return [dict(row) for row in rows]
