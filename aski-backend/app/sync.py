from datetime import datetime, timezone

from app.web_ingestion import fetch_and_ingest


DEFAULT_UCC_SOURCES = [
    {
        "title": "UCC Homepage",
        "url": "https://ucc.edu.gh/",
    },
]


def sync_ucc_sources(sources=None):
    sources = sources or DEFAULT_UCC_SOURCES
    results = []

    for source in sources:
        url = source["url"]
        title = source.get("title")
        try:
            entry, changed = fetch_and_ingest(url, title)
            results.append({
                "url": url,
                "changed": changed,
                "status": "updated" if changed else "unchanged",
                "item": entry,
            })
        except Exception as exc:
            results.append({
                "url": url,
                "changed": False,
                "status": "error",
                "error": str(exc),
            })

    return {
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "sources": len(sources),
        "results": results,
    }
