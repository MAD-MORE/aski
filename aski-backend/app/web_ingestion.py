from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from app.ingestion import upsert_source

ALLOWED_HOSTS = {
    "ucc.edu.gh",
    "www.ucc.edu.gh",
}


def _validate_url(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("only official UCC HTTPS URLs are allowed")


def fetch_and_ingest(url, title=None):
    _validate_url(url)

    response = requests.get(
        url,
        timeout=15,
        headers={"User-Agent": "ASKI-UCC-KnowledgeBot/1.0"},
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for element in soup(["script", "style", "noscript", "svg"]):
        element.decompose()

    content = " ".join(soup.stripped_strings)
    if not content:
        raise ValueError("no readable content found at source")

    page_title = title or (soup.title.get_text(strip=True) if soup.title else url)
    entry, changed = upsert_source(page_title, content, "ucc-web", url)
    return entry, changed
