import time
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from sqlalchemy import text

from app.database import engine
from app.ingestion import upsert_source

ALLOWED_HOSTS = {
    "ucc.edu.gh", "www.ucc.edu.gh", "news.ucc.edu.gh",
    "academics.ucc.edu.gh", "daa.ucc.edu.gh",
}


def _validate_url(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("only official UCC HTTPS URLs are allowed")


def _record_health(url, title, status, http_status=None, response_ms=None, error=None, changed=False):
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO source_health
                    (url, title, status, http_status, response_ms, last_checked, last_changed, last_error, consecutive_failures, updated_at)
                VALUES
                    (:url, :title, :status, :http_status, :response_ms, now(), CASE WHEN :changed THEN now() ELSE NULL END,
                     :error, CASE WHEN :status = 'ok' THEN 0 ELSE 1 END, now())
                ON CONFLICT (url) DO UPDATE SET
                    title = EXCLUDED.title,
                    status = EXCLUDED.status,
                    http_status = EXCLUDED.http_status,
                    response_ms = EXCLUDED.response_ms,
                    last_checked = now(),
                    last_changed = CASE WHEN EXCLUDED.status = 'ok' AND :changed THEN now() ELSE source_health.last_changed END,
                    last_error = EXCLUDED.last_error,
                    consecutive_failures = CASE WHEN EXCLUDED.status = 'ok' THEN 0 ELSE source_health.consecutive_failures + 1 END,
                    updated_at = now()
            """), {"url": url, "title": title, "status": status, "http_status": http_status,
                  "response_ms": response_ms, "error": error, "changed": changed})
    except Exception:
        pass


def fetch_and_ingest(url, title=None):
    _validate_url(url)
    started = time.monotonic()
    try:
        response = requests.get(
            url, timeout=20,
            headers={"User-Agent": "ASKI-UCC-KnowledgeBot/2.0"},
        )
        elapsed = int((time.monotonic() - started) * 1000)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        for element in soup(["script", "style", "noscript", "svg"]):
            element.decompose()
        content = " ".join(soup.stripped_strings)
        if not content:
            raise ValueError("no readable content found at source")
        page_title = title or (soup.title.get_text(strip=True) if soup.title else url)
        entry, changed = upsert_source(page_title, content, "ucc-web", url)
        _record_health(url, page_title, "ok", response.status_code, elapsed, changed=changed)
        return entry, changed
    except Exception as exc:
        elapsed = int((time.monotonic() - started) * 1000)
        status = getattr(getattr(exc, "response", None), "status_code", None)
        _record_health(url, title, "error", status, elapsed, str(exc), changed=False)
        raise
