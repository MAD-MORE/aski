import logging

from sqlalchemy import text

from app.database import engine
from app.search import semantic_search
from app.backfill import backfill_embeddings

logger = logging.getLogger(__name__)


def _missing_embedding_count():
    with engine.begin() as conn:
        return int(conn.execute(text("""
            SELECT count(*)
            FROM knowledge_documents d
            LEFT JOIN knowledge_embeddings e ON e.document_id = d.id
            WHERE e.document_id IS NULL
        """)).scalar_one())


def _ensure_embeddings():
    """Repair missing vectors before semantic retrieval.

    The operation is idempotent: existing vectors are safely upserted, while
    missing vectors are generated in a batch. Failures are logged and the
    keyword path remains available, so knowledge retrieval never disappears.
    """
    try:
        missing = _missing_embedding_count()
        if not missing:
            return {"missing_before": 0, "embedded": 0, "failed": 0}
        result = backfill_embeddings()
        logger.info("ASKI embedding backfill: %s", result)
        result["missing_before"] = missing
        return result
    except Exception:
        logger.exception("ASKI embedding backfill failed")
        return {"missing_before": missing if "missing" in locals() else -1, "embedded": 0, "failed": -1}


def build_context(question, documents, limit=5):
    embedding_status = _ensure_embeddings()
    matches = semantic_search(question, documents, limit=limit)

    # If semantic retrieval cannot run because embeddings/provider are unavailable,
    # search.py still performs keyword retrieval and returns those matches.
    context = "\n\n".join(
        f"SOURCE: {item.get('title')}\nCONTENT: {item.get('content')}\nURL: {item.get('url') or 'N/A'}"
        for item in matches
    )
    return context, matches


def grounded_prompt(question, context):
    return f"""You are ASKI, a university information assistant.\nAnswer only from the supplied verified context. If the context is insufficient, say you do not have enough verified information. Never invent dates, fees, rules, or requirements.\n\nCONTEXT:\n{context}\n\nQUESTION:\n{question}\n"""
