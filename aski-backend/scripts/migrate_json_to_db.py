import json
from pathlib import Path

from app.database import SessionLocal, init_db
from app.models import KnowledgeDocument


KNOWLEDGE_FILE = Path(__file__).resolve().parents[1] / "data" / "knowledge.json"


def migrate():
    init_db()
    if not KNOWLEDGE_FILE.exists():
        print("No JSON knowledge file found; nothing to migrate.")
        return

    with KNOWLEDGE_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, dict):
        data = data.get("items", [])

    session = SessionLocal()
    try:
        for item in data:
            existing = session.get(KnowledgeDocument, item.get("id"))
            if existing:
                continue
            session.add(KnowledgeDocument(
                id=item.get("id"),
                title=item.get("title", "Untitled"),
                content=item.get("content", ""),
                source=item.get("source", "manual"),
                url=item.get("url"),
                content_hash=item.get("content_hash"),
            ))
        session.commit()
        print(f"Migrated {len(data)} knowledge records.")
    finally:
        session.close()


if __name__ == "__main__":
    migrate()
