import os
from datetime import datetime, timezone

from sqlalchemy import text

from app.database import engine
from app.knowledge import load_knowledge


def _rag_health():
    if engine.dialect.name != "postgresql":
        return {"documents": 0, "embeddings": 0, "semantic_ready": False}
    try:
        with engine.begin() as conn:
            documents = int(conn.execute(text("SELECT count(*) FROM knowledge_documents")).scalar_one())
            embeddings = int(conn.execute(text("SELECT count(*) FROM knowledge_embeddings")).scalar_one())
        return {
            "documents": documents,
            "embeddings": embeddings,
            "semantic_ready": documents > 0 and documents == embeddings,
        }
    except Exception:
        return {"documents": 0, "embeddings": 0, "semantic_ready": False}


def system_health():
    knowledge = load_knowledge()
    rag = _rag_health()
    return {
        "status": "ok",
        "service": "aski-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "knowledge_items": len(knowledge),
        "rag": rag,
        "ai": {
            "providers": {
                "gemini": bool(os.getenv("GEMINI_API_KEY")),
                "grok": bool(os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY")),
                "openrouter": bool(os.getenv("OPENROUTER_API_KEY")),
            },
            "provider_order": [
                name.strip().lower()
                for name in os.getenv("ASKI_PROVIDER_ORDER", "gemini,grok,openrouter").split(",")
                if name.strip()
            ],
            "embedding_model": os.getenv(
                "OPENROUTER_EMBEDDING_MODEL",
                "nvidia/llama-nemotron-embed-vl-1b-v2:free",
            ),
        },
    }
