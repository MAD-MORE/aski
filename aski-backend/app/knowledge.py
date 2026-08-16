import json
from pathlib import Path

KNOWLEDGE_FILE = Path(__file__).resolve().parent.parent / "data" / "knowledge.json"


def load_knowledge():
    if not KNOWLEDGE_FILE.exists():
        return []
    with KNOWLEDGE_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_knowledge(entries):
    KNOWLEDGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with KNOWLEDGE_FILE.open("w", encoding="utf-8") as file:
        json.dump(entries, file, ensure_ascii=False, indent=2)
