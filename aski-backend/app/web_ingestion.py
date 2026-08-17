import time
from collections import deque
from urllib.parse import urljoin, urlparse, urldefrag

import requests
from bs4 import BeautifulSoup
from sqlalchemy import text

from app.database import engine
from app.ingestion import upsert_source

ALLOWED_HOSTS = {
    "ucc.edu.gh", "www.ucc.edu.gh", "news.ucc.edu.gh", "admissions.ucc.edu.gh",
    "academics.ucc.edu.gh", "daa.ucc.edu.gh", "sgs.ucc.edu.gh", "directory.ucc.edu.gh",
    "library.ucc.edu.gh", "ode.ucc.edu.gh", "coas.ucc.edu.gh",
}

SKIP_EXTENSIONS = (".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".mp4", ".mp3", ".zip", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx")


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


def _extract_page(response):
    soup = BeautifulSoup(response.text, "html.parser")
    for element in soup(["script", "style", "noscript", "svg", "nav", "footer"]):
        element.decompose()
    content = " ".join(soup.stripped_strings)
    if not content:
        raise ValueError("no readable content found at source")
    title = soup.title.get_text(strip=True) if soup.title else response.url
    return soup, title, content


def fetch_and_ingest(url, title=None):
    _validate_url(url)
    started = time.monotonic()
    try:
        response = requests.get(url, timeout=20, headers={"User-Agent": "ASKI-UCC-KnowledgeBot/3.0"})
        elapsed = int((time.monotonic() - started) * 1000)
        response.raise_for_status()
        soup, page_title, content = _extract_page(response)
        entry, changed = upsert_source(title or page_title, content, "ucc-web", url)
        _record_health(url, title or page_title, "ok", response.status_code, elapsed, changed=changed)
        return entry, changed
    except Exception as exc:
        elapsed = int((time.monotonic() - started) * 1000)
        status = getattr(getattr(exc, "response", None), "status_code", None)
        _record_health(url, title, "error", status, elapsed, str(exc), changed=False)
        raise


def crawl_and_ingest(start_url, max_pages=30, max_depth=1):
    """Crawl a small, bounded set of official UCC pages from a trusted root.

    The crawl is deliberately same-host, HTTPS-only and bounded so an official
    site cannot accidentally turn a scheduled sync into an unbounded crawler.
    """
    _validate_url(start_url)
    start_host = urlparse(start_url).hostname
    queue = deque([(start_url, 0)])
    visited = set()
    results = []

    while queue and len(visited) < max_pages:
        url, depth = queue.popleft()
        url = urldefrag(url)[0].rstrip("/")
        parsed = urlparse(url)
        if url in visited or parsed.hostname != start_host or parsed.path.lower().endswith(SKIP_EXTENSIONS):
            continue
        visited.add(url)
        try:
            response = requests.get(url, timeout=20, headers={"User-Agent": "ASKI-UCC-KnowledgeBot/3.0"})
            response.raise_for_status()
            soup, title, content = _extract_page(response)
            entry, changed = upsert_source(title, content, "ucc-web", url)
            _record_health(url, title, "ok", response.status_code, changed=changed)
            results.append({"url": url, "title": title, "changed": changed, "status": "updated" if changed else "unchanged"})

            if depth < max_depth:
                for link in soup.find_all("a", href=True):
                    child = urldefrag(urljoin(url, link["href"]))[0]
                    child_parsed = urlparse(child)
                    if child_parsed.scheme == "https" and child_parsed.hostname == start_host:
                        queue.append((child, depth + 1))
        except Exception as exc:
            _record_health(url, None, "error", getattr(getattr(exc, "response", None), "status_code", None), error=str(exc))
            results.append({"url": url, "status": "error", "error": str(exc)})

    return {"start_url": start_url, "pages_checked": len(visited), "results": results}
