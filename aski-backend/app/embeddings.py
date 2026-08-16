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
    return engine.dialect.name == "postgresql"


def embed_text(text_value):
    client = _client()
    if not client:
        return None
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=text_value)
    return response.data[0].embedding


def _vector_literal(vector):
    return "[" + ",".join(str(float(x)) for x in vector) + "]"


def upsert_embedding(document_id, title, content):
    if not init_vector_store():
        return False
    vector = embed_text(f"{title}\n{content}")
    if vector is None:
        return False
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO knowledge_embeddings (document_id, embedding, model, updated_at)
            VALUES (:id, CAST(:embedding AS vector), :model, CURRENT_TIMESTAMP)
            ON CONFLICT (document_id) DO UPDATE SET
                embedding = EXCLUDED.embedding,
                model = EXCLUDED.model,
                updated_at = CURRENT_TIMESTAMP
        """), {"id": document_id, "embedding": _vector_literal(vector), "model": EMBEDDING_MODEL})
    return True


def embed_all_documents(documents):
    """Generate/update embeddings for documents missing an embedding."""
    results = {"processed": 0, "embedded": 0, "failed": 0}
    for document in documents:
        results["processed"] += 1
        try:
            if upsert_embedding(document["id"], document["title"], document["content"]):
                results["embedded"] += 1
            else:
                results["failed"] += 1
        except Exception:
            results["failed"] += 1
    return results


def semantic_search(question, limit=5):
    if not init_vector_store():
        return []
    vector = embed_text(question)
    if vector is None:
        return []
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT d.id, d.title, d.content, d.source, d.url, d.content_hash,
                   1 - (e.embedding <=> CAST(:embedding AS vector)) AS relevance
            FROM knowledge_embeddings e
            JOIN knowledge_documents d ON d.id = e.document_id
            ORDER BY e.embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """), {"embedding": _vector_literal(vector), "limit": limit}).mappings().all()
    return [dict(row) for row in rows]
