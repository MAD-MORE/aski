import logging
import re

from sqlalchemy import text

from app.database import engine
from app.search import semantic_search
from app.backfill import backfill_embeddings

logger = logging.getLogger(__name__)


def _missing_embedding_count():
    with engine.begin() as conn:
        return int(conn.execute(text("SELECT count(*) FROM knowledge_documents d LEFT JOIN knowledge_embeddings e ON e.document_id = d.id WHERE e.document_id IS NULL")).scalar_one())


def _ensure_embeddings():
    try:
        missing = _missing_embedding_count()
        if not missing:
            return {"missing_before": 0, "embedded": 0, "failed": 0}
        result = backfill_embeddings()
        result["missing_before"] = missing
        logger.info("ASKI embedding backfill: %s", result)
        return result
    except Exception:
        logger.exception("ASKI embedding backfill failed")
        return {"missing_before": -1, "embedded": 0, "failed": -1}


def _date_tokens(content):
    return set(re.findall(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b", content.lower()))


def _conflict_note(matches):
    calendars = [m for m in matches if "calendar" in (m.get("title") or "").lower()]
    if len(calendars) < 2:
        return None
    sets = [_date_tokens(m.get("content", "")) for m in calendars]
    if all(s == sets[0] for s in sets[1:]):
        return None
    names = ", ".join(m.get("title", "UCC calendar") for m in calendars)
    return f"OFFICIAL-SOURCE CONFLICT WARNING: multiple UCC calendar sources were retrieved ({names}) and they contain different date sets. Do not silently merge or choose between conflicting dates; identify the relevant calendar and state the discrepancy."


def _freshness():
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT d.id, d.title, d.url, d.updated_at, s.last_checked, s.last_changed
            FROM knowledge_documents d LEFT JOIN sources s ON s.url = d.url
        """)).mappings().all()
    return {r["id"]: dict(r) for r in rows}


def build_context(question, documents, limit=5):
    embedding_status = _ensure_embeddings()
    matches = semantic_search(question, documents, limit=limit)
    freshness = _freshness()
    for item in matches:
        item["freshness"] = freshness.get(item.get("id"))
        item["source_verified"] = bool(item.get("url", "").startswith("https://") and ".ucc.edu.gh" in item.get("url", ""))
    conflict = _conflict_note(matches)
    if conflict:
        for item in matches:
            item["conflict_warning"] = conflict
    return "", matches


def grounded_prompt(question, context):
    return f"""You are ASKI, a university information assistant. Answer only from supplied verified context. If context is insufficient, say so. Never invent dates, fees, rules, or requirements. If official sources conflict, explicitly identify the conflict and do not silently choose one.\n\nCONTEXT:\n{context}\n\nQUESTION:\n{question}\n"""
