from datetime import datetime, timezone

from app.database import SessionLocal, init_db
from app.models import Source, SyncRun
from app.web_ingestion import fetch_and_ingest
from app.knowledge import load_knowledge
from app.embeddings import embed_all_documents

DEFAULT_UCC_SOURCES = [
    {"title": "UCC Homepage", "url": "https://ucc.edu.gh/"},
    {"title": "UCC News", "url": "https://news.ucc.edu.gh/"},
    {"title": "UCC Academic Calendar", "url": "https://academics.ucc.edu.gh/academic-calendar"},
    {"title": "UCC Directorate of Academic Affairs Calendar", "url": "https://daa.ucc.edu.gh/academic-calendar-20252026-academic-year"},
]


def sync_ucc_sources(sources=None):
    sources = sources or DEFAULT_UCC_SOURCES
    init_db()
    session = SessionLocal()
    run = SyncRun(status="running")
    session.add(run)
    session.commit()
    results = []
    changed_count = 0
    changed_documents = []
    try:
        for source in sources:
            url, title = source["url"], source.get("title")
            try:
                entry, changed = fetch_and_ingest(url, title)
                changed_count += int(changed)
                now = datetime.now(timezone.utc).replace(tzinfo=None)
                db_source = session.query(Source).filter_by(url=url).first()
                if not db_source:
                    db_source = Source(name=title or url, url=url, source_type="official")
                    session.add(db_source)
                db_source.last_checked = now
                if changed:
                    db_source.last_changed = now
                    changed_documents.append(entry)
                results.append({"url": url, "changed": changed, "status": "updated" if changed else "unchanged", "item": entry})
            except Exception as exc:
                results.append({"url": url, "changed": False, "status": "error", "error": str(exc)})

        embedding_result = {"processed": 0, "embedded": 0, "failed": 0}
        if changed_documents:
            embedding_result = embed_all_documents(changed_documents)

        run.status = "completed" if all(r["status"] != "error" for r in results) else "partial"
        run.sources_checked = len(sources)
        run.documents_changed = changed_count
        run.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.commit()
    except Exception:
        run.status = "failed"
        run.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.commit()
        raise
    finally:
        session.close()
    return {
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "sources": len(sources),
        "changed": changed_count,
        "embeddings": embedding_result,
        "results": results,
    }
