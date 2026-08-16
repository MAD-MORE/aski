import os

import requests
from sqlalchemy import text

from app.database import engine

EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")
EMBEDDING_DIMENSIONS = int(os.getenv("OPENROUTER_EMBEDDING_DIMENSIONS", "1536"))
OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings"


def _headers():
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return None
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("ASKI_SITE_URL", "https://aski-theta.vercel.app"),
        "X-Title": "ASKI",
    }


def _request_embeddings(inputs):
    headers = _headers()
    if not headers:
        return None
    response = requests.post(
        OPENROUTER_EMBEDDINGS_URL,
        headers=headers,
        json={
            "model": EMBEDDING_MODEL,
            "input": inputs,
            "encoding_format": "float",
            "dimensions": EMBEDDING_DIMENSIONS,
        },
        timeout=60,
    )
    if not response.ok:
        try:
            detail = response.json()
        except Exception:
            detail = response.text[:500]
        raise RuntimeError(f"Embedding provider returned HTTP {response.status_code}: {detail}")
    data = response.json()
    items = data.get("data") or []
    items.sort(key=lambda item: item.get("index", 0))
    vectors = [item.get("embedding") for item in items]
    if len(vectors) != len(inputs) or any(not vector for vector in vectors):
        raise RuntimeError("Embedding provider returned an incomplete vector batch")
    for vector in vectors:
        if len(vector) != EMBEDDING_DIMENSIONS:
            raise ValueError(
                f"Embedding dimension mismatch: database expects {EMBEDDING_DIMENSIONS}, provider returned {len(vector)}"
            )
    return vectors


def init_vector_store():
    return engine.dialect.name == "postgresql"


def embed_text(text_value):
    vectors = _request_embeddings([text_value])
    return vectors[0] if vectors else None


def _vector_literal(vector):
    return "[" + ",".join(str(float(x)) for x in vector) + "]"


def _upsert_vector(document_id, vector):
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO knowledge_embeddings (document_id, embedding, model, updated_at)
            VALUES (:id, CAST(:embedding AS vector), :model, CURRENT_TIMESTAMP)
            ON CONFLICT (document_id) DO UPDATE SET
                embedding = EXCLUDED.embedding,
                model = EXCLUDED.model,
                updated_at = CURRENT_TIMESTAMP
        """), {"id": document_id, "embedding": _vector_literal(vector), "model": EMBEDDING_MODEL})


def upsert_embedding(document_id, title, content):
    if not init_vector_store():
        return False
    vector = embed_text(f"{title}\n{content}")
    if vector is None:
        return False
    _upsert_vector(document_id, vector)
    return True


def embed_all_documents(documents):
    """Batch-index all supplied documents using the free OpenRouter embedding model."""
    results = {"processed": len(documents), "embedded": 0, "failed": 0}
    if not documents or not init_vector_store():
        results["failed"] = len(documents)
        return results

    inputs = [f"{doc['title']}\n{doc['content']}" for doc in documents]
    try:
        vectors = _request_embeddings(inputs)
        for document, vector in zip(documents, vectors):
            _upsert_vector(document["id"], vector)
            results["embedded"] += 1
        return results
    except Exception:
        # Fall back to individual requests so one problematic document does not
        # prevent the remaining UCC documents from being indexed.
        for document in documents:
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
