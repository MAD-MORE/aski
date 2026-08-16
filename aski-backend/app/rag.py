from sqlalchemy import text

from app.database import engine
from app.search import semantic_search
from app.backfill import backfill_embeddings


def _ensure_embeddings():
    """Populate missing vectors once before semantic retrieval.

    This makes existing knowledge usable after deployment without exposing
    an unauthenticated admin endpoint. ON CONFLICT in the embedding writer
    makes retries safe.
    """
    try:
        with engine.begin() as conn:
            missing = conn.execute(text("""
                SELECT count(*)
                FROM knowledge_documents d
                LEFT JOIN knowledge_embeddings e ON e.document_id = d.id
                WHERE e.document_id IS NULL
            """)).scalar_one()
        if missing:
            backfill_embeddings()
    except Exception:
        # Keyword retrieval remains available if the free embedding provider
        # is temporarily unavailable.
        return


def build_context(question, documents, limit=5):
    _ensure_embeddings()
    matches = semantic_search(question, documents, limit=limit)
    context = "\n\n".join(
        f"SOURCE: {item.get('title')}\nCONTENT: {item.get('content')}\nURL: {item.get('url') or 'N/A'}"
        for item in matches
    )
    return context, matches


def grounded_prompt(question, context):
    return f"""You are ASKI, a university information assistant.\nAnswer only from the supplied verified context. If the context is insufficient, say you do not have enough verified information. Never invent dates, fees, rules, or requirements.\n\nCONTEXT:\n{context}\n\nQUESTION:\n{question}\n"""
