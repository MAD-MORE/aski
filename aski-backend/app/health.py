from datetime import datetime, timezone

from app.knowledge import load_knowledge


def system_health():
    knowledge = load_knowledge()
    return {
        "status": "ok",
        "service": "aski-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "knowledge_items": len(knowledge),
    }
