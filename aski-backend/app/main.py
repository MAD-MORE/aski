import os
import time

import requests
from flask import Flask, jsonify, request, send_from_directory, render_template
from sqlalchemy import text

from app.ai import generate_answer
from app.auth import require_sync_token
from app.health import system_health
from app.ingestion import upsert_source
from app.knowledge import load_knowledge
from app.memory import add_message, get_history
from app.rag import build_context
from app.security import require_admin
from app.sync import sync_ucc_sources, get_sync_history, get_source_health
from app.ucc_intelligence import classify_question
from app.users import create_user, verify_user
from app.web_ingestion import fetch_and_ingest
from app.embeddings import embed_all_documents
from app.backfill import backfill_embeddings
from app.database import engine

app = Flask(__name__, template_folder="../templates")
_rate = {}


def allowed_origins():
    configured = os.getenv("ASKI_ALLOWED_ORIGINS", "https://aski-theta.vercel.app,https://aski.vercel.app")
    return {origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()}


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin", "").rstrip("/")
    if origin in allowed_origins():
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.before_request
def handle_options_and_rate_limit():
    if request.method == "OPTIONS":
        return ("", 204)
    key = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    now = time.time()
    window = _rate.setdefault(key, [])
    window[:] = [t for t in window if now - t < 60]
    if len(window) >= int(os.getenv("ASKI_RATE_LIMIT", "60")):
        return jsonify({"error": "rate limit exceeded"}), 429
    window.append(now)


@app.get("/")
def health_check():
    return jsonify(system_health())


@app.get("/health")
def detailed_health_check():
    return jsonify(system_health())


@app.route("/test", methods=["GET", "POST"])
def ai_test_page():
    answer = None
    sources = []
    error = None
    question = ""
    if request.method == "POST":
        question = str(request.form.get("question", "")).strip()
        if not question:
            error = "Please enter a question."
        elif len(question) > 2000:
            error = "Question is too long."
        else:
            try:
                _, matches = build_context(question, load_knowledge())
                result = generate_answer(question, matches, history=[], profile=None)
                answer = result["answer"]
                sources = matches
            except Exception as exc:
                app.logger.exception("AI test failed")
                error = f"ASKI error: {exc}"
    return render_template("test.html", question=question, answer=answer, sources=sources, error=error)


@app.get("/admin")
def admin_dashboard():
    return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), "admin"), "index.html")


@app.get("/api/knowledge")
def get_knowledge():
    items = load_knowledge()
    return jsonify({"count": len(items), "items": items})


@app.post("/api/knowledge")
def add_knowledge():
    payload = request.get_json(silent=True) or {}
    try:
        entry, changed = upsert_source(payload.get("title", ""), payload.get("content", ""), payload.get("source", "manual"), payload.get("url"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"item": entry, "changed": changed}), 201 if changed else 200


@app.post("/api/ingest")
def ingest():
    payload = request.get_json(silent=True) or {}
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return jsonify({"error": "items must be a non-empty list"}), 400
    results, changed_count = [], 0
    for item in items:
        try:
            entry, changed = upsert_source(item.get("title", ""), item.get("content", ""), item.get("source", "manual"), item.get("url"))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        changed_count += int(changed)
        results.append(entry)
    return jsonify({"processed": len(results), "changed": changed_count, "items": results})


@app.post("/api/ingest/ucc")
def ingest_ucc():
    payload = request.get_json(silent=True) or {}
    try:
        entry, changed = fetch_and_ingest(str(payload.get("url", "")).strip(), payload.get("title"))
    except requests.RequestException as exc:
        return jsonify({"error": f"failed to fetch source: {exc}"}), 502
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"item": entry, "changed": changed})


@app.post("/api/sync/ucc")
@require_sync_token
def sync_ucc():
    return jsonify(sync_ucc_sources())


@app.get("/api/cron/ucc-sync")
def cron_ucc_sync():
    expected = os.getenv("CRON_SECRET")
    provided = request.headers.get("Authorization", "")
    if not expected or provided != f"Bearer {expected}":
        return jsonify({"error": "unauthorized"}), 401
    return jsonify(sync_ucc_sources())


@app.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True) or {}
    email, password = str(payload.get("email", "")).strip(), str(payload.get("password", ""))
    if len(password) < 8 or "@" not in email:
        return jsonify({"error": "valid email and password of at least 8 characters are required"}), 400
    try:
        user = create_user(email, password, payload.get("institution"), payload.get("programme"), payload.get("level"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409
    return jsonify({"id": user.id, "email": user.email}), 201


@app.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    user = verify_user(str(payload.get("email", "")), str(payload.get("password", "")))
    if not user:
        return jsonify({"error": "invalid credentials"}), 401
    return jsonify({"user": {"id": user.id, "email": user.email, "institution": user.institution, "programme": user.programme, "level": user.level}})


@app.post("/api/ask")
def ask():
    payload = request.get_json(silent=True) or {}
    question = str(payload.get("question", "")).strip()
    session_id = str(payload.get("session_id", "default"))
    if not question:
        return jsonify({"error": "question is required"}), 400
    if len(question) > 2000:
        return jsonify({"error": "question is too long"}), 400
    _, matches = build_context(question, load_knowledge())
    history = get_history(session_id)
    result = generate_answer(question, matches, history=history, profile=payload.get("profile"))
    add_message(session_id, "user", question)
    add_message(session_id, "assistant", result["answer"])
    return jsonify({
        "question": question,
        "intent": classify_question(question),
        "answer": result["answer"],
        "provider": result["provider"],
        "model": result.get("model"),
        "sources": [{"title": m.get("title"), "url": m.get("url"), "relevance": m.get("relevance"), "retrieval": m.get("retrieval"), "freshness": m.get("freshness"), "conflict_warning": m.get("conflict_warning")} for m in matches],
    })


@app.get("/api/rag/status")
def rag_status():
    return jsonify(system_health())


@app.get("/api/sources/health")
@require_admin
def sources_health():
    return jsonify({"sources": get_source_health()})


@app.get("/api/admin/sync/history")
@require_admin
def sync_history():
    return jsonify({"runs": get_sync_history()})


@app.get("/api/admin/knowledge/versions")
@require_admin
def knowledge_versions():
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT id, document_id, title, content_hash, source, url, captured_at
            FROM source_versions ORDER BY captured_at DESC LIMIT 100
        """)).mappings().all()
    return jsonify({"versions": [dict(r) for r in rows]})


@app.post("/api/admin/embeddings")
@require_admin
def generate_embeddings():
    rows = engine.connect().execute(text("SELECT id, title, content FROM knowledge_documents ORDER BY id")).mappings().all()
    result = embed_all_documents(rows)
    result["model"] = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")
    return jsonify(result)


@app.post("/api/admin/embeddings/backfill")
@require_admin
def backfill_embeddings_route():
    result = backfill_embeddings()
    result["model"] = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")
    return jsonify(result)


@app.get("/api/admin/knowledge")
@require_admin
def admin_knowledge():
    items = load_knowledge()
    return jsonify({"count": len(items), "items": items})


@app.get("/api/admin/sync")
@require_admin
def admin_sync():
    return jsonify({"message": "Sync history is available at /api/admin/sync/history"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
