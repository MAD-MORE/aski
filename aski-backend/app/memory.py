from sqlalchemy import text

from app.database import engine


def _ensure_session(session_id):
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO chat_sessions (session_id)
                VALUES (:session_id)
                ON CONFLICT (session_id) DO UPDATE SET updated_at = now()
            """),
            {"session_id": session_id},
        )


def add_message(session_id, role, content, sources=None):
    _ensure_session(session_id)
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO chat_messages (session_id, role, content, sources)
                VALUES (:session_id, :role, :content, CAST(:sources AS jsonb))
            """),
            {
                "session_id": session_id,
                "role": role,
                "content": content,
                "sources": __import__("json").dumps(sources or []),
            },
        )


def get_history(session_id, limit=12):
    with engine.begin() as conn:
        rows = conn.execute(
            text("""
                SELECT role, content, sources
                FROM chat_messages
                WHERE session_id = :session_id
                ORDER BY created_at DESC, id DESC
                LIMIT :limit
            """),
            {"session_id": session_id, "limit": limit},
        ).mappings().all()
    return [dict(row) for row in reversed(rows)]
