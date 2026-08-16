import os

os.environ["DATABASE_URL"] = "sqlite:///test_aski.db"

from app.database import init_db
from app.ingestion import upsert_source
from app.knowledge import load_knowledge


def test_database_ingestion():
    init_db()
    item, changed = upsert_source("Test", "UCC test content", "test")
    assert changed is True
    assert item["title"] == "Test"
    assert any(x["title"] == "Test" for x in load_knowledge())
