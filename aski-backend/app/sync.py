from datetime import datetime, timezone

from sqlalchemy import text

from app.database import SessionLocal, engine, init_db
from app.models import Source, SyncRun
from app.web_ingestion import crawl_and_ingest, fetch_and_ingest
from app.knowledge import load_knowledge
from app.embeddings import embed_all_documents

# Canonical UCC source registry. These are deliberately official UCC domains;
# the crawler is same-host and bounded, while individual high-value pages are
# fetched directly so important records are never dependent on link discovery.
DEFAULT_UCC_SOURCES = [
    {"title": "UCC Homepage", "url": "https://ucc.edu.gh/", "crawl": True},
    {"title": "UCC News", "url": "https://news.ucc.edu.gh/", "crawl": True},
    {"title": "UCC Admissions", "url": "https://admissions.ucc.edu.gh/", "crawl": True},
    {"title": "UCC Application Portal", "url": "https://apply.ucc.edu.gh/"},
    {"title": "UCC How to Apply", "url": "https://admissions.ucc.edu.gh/how-to-apply"},
    {"title": "UCC Academic Programmes Catalogue", "url": "https://admissions.ucc.edu.gh/catalogue"},
    {"title": "UCC Programmes Catalogue — Accepting", "url": "https://admissions.ucc.edu.gh/catalogue?accepting=1"},
    {"title": "UCC Departments", "url": "https://admissions.ucc.edu.gh/catalogue/departments"},
    {"title": "UCC Admission Announcements", "url": "https://ucc.edu.gh/announcements?type=admission"},
    {"title": "UCC Academic Calendar", "url": "https://academics.ucc.edu.gh/academic-calendar"},
    {"title": "UCC All Academic Calendars", "url": "https://academics.ucc.edu.gh/academic-calendar/all"},
    {"title": "UCC Directorate of Academic Affairs", "url": "https://daa.ucc.edu.gh/", "crawl": True},
    {"title": "UCC School of Graduate Studies", "url": "https://sgs.ucc.edu.gh/", "crawl": True},
    {"title": "UCC School of Graduate Studies Calendar", "url": "https://sgs.ucc.edu.gh/sgs-academic-calendar-20252026"},
    {"title": "UCC Library", "url": "https://ucc.edu.gh/main/explore-ucc/corporate-strategic-plan/library"},
    {"title": "UCC Academic Counselling", "url": "https://ucc.edu.gh/main/applicants-and-students/academic-counselling"},
    {"title": "UCC Recreational and Social Activities", "url": "https://ucc.edu.gh/main/explore-ucc/recreational-and-social-activities"},
    {"title": "UCC Faculties and Schools", "url": "https://archive.ucc.edu.gh/academics/faculties-schools"},
    {"title": "UCC Staff Directory", "url": "https://directory.ucc.edu.gh/", "crawl": True},
    {"title": "UCC Counselling Centre Directory", "url": "https://directory.ucc.edu.gh/d/counselling-centre"},
]


def sync_ucc_sources(sources=None):
    sources = sources or DEFAULT_UCC_SOURCES
    init_db()
    session = SessionLocal()
    run = SyncRun(status="running")
    session.add(run)
    session.commit()
    results, changed_count = [], 0
    try:
        for source in sources:
            url, title = source["url"], source.get("title")
            try:
                if source.get("crawl"):
                    crawl_result = crawl_and_ingest(url, max_pages=25, max_depth=1)
                    page_results = crawl_result.get("results", [])
                    changed = any(item.get("changed") for item in page_results)
                    changed_count += sum(1 for item in page_results if item.get("changed"))
                    results.append({"url": url, "changed": changed, "status": "updated" if changed else "unchanged", "pages_checked": crawl_result.get("pages_checked", 0), "results": page_results})
                else:
                    entry, changed = fetch_and_ingest(url, title)
                    changed_count += int(changed)
                    results.append({"url": url, "changed": changed, "status": "updated" if changed else "unchanged", "item": entry})

                now = datetime.now(timezone.utc).replace(tzinfo=None)
                db_source = session.query(Source).filter_by(url=url).first()
                if not db_source:
                    db_source = Source(name=title or url, url=url, source_type="official")
                    session.add(db_source)
                db_source.last_checked = now
                if results[-1].get("changed"):
                    db_source.last_changed = now
            except Exception as exc:
                results.append({"url": url, "changed": False, "status": "error", "error": str(exc)})

        all_documents = load_knowledge()
        embedding_result = embed_all_documents(all_documents) if all_documents else {"processed": 0, "embedded": 0, "failed": 0}
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


def get_sync_history(limit=20):
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT id, started_at, completed_at, status, sources_checked, documents_changed
            FROM sync_runs ORDER BY started_at DESC LIMIT :limit
        """), {"limit": limit}).mappings().all()
    return [dict(r) for r in rows]


def get_source_health():
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT url, title, status, http_status, response_ms, last_checked,
                   last_changed, last_error, consecutive_failures
            FROM source_health ORDER BY title NULLS LAST, url
        """).mappings().all()
    return [dict(r) for r in rows]
