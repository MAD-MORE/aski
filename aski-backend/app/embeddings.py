import os

import requests
from sqlalchemy import text

from app.database import engine

EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")
EMBEDDING_DIMENSIONS = 1536


def _openrouter_embedding(text_value):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return None
    response = requests.post(
        "https://openrouter.ai/api/v1/embeddings",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("ASKI_SITE_URL", "https://aski.vercel.app"),
            "X-Title": "ASKI",
        },
        json={
            "model": EMBEDDING_MODEL,
            "input": text_value,
            "encoding_format": "float",
            "dimensions": EMBEDDING_DIMENSIONS,
        },
        timeout=45,
    )
    response.raise_for_status()
    data = response.json()
    vector = data.get("data", [{}])[0].get("embedding")
    if not vector:
        raise RuntimeError("Free embedding provider returned no vector")
    return vector


def init_vector_store():
    return engine.dialect.name == "postgresql"


def embed_text(text_value):
    return _openrouter_embedding(text_value)


def _vector_literal(vector):
    return "[" + ",".join(str(float(x)) for x in vector) + "]"


def upsert_embedding(document_id, title, content):
    if not init_vector_store():
        return False
    vector = embed_text(f"{title}\n{content}")
    if vector is None:
        return False
    if len(vector) != EMBEDDING_DIMENSIONS:
        raise ValueError(f"Expected {EMBEDDING_DIMENSIONS}-dimensional embedding, got {len(vector)}")
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
    if vector is None or len(vector) != EMBEDDING_DIMENSIONS:
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
