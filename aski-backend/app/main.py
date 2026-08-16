from flask import Flask, jsonify, request
import requests

from app.ai import generate_answer
from app.auth import require_sync_token
from app.ingestion import upsert_source
from app.knowledge import load_knowledge
from app.retrieval import search_knowledge
from app.sync import sync_ucc_sources
from app.web_ingestion import fetch_and_ingest

app = Flask(__name__)


@app.get("/")
def health_check():
    return jsonify({
        "name": "ASKI Backend",
        "status": "ok",
        "message": "ASKI backend is running"
    })


@app.get("/api/knowledge")
def get_knowledge():
    entries = load_knowledge()
    return jsonify({"count": len(entries), "items": entries})


@app.post("/api/knowledge")
def add_knowledge():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "")).strip()
    content = str(payload.get("content", "")).strip()
    source = str(payload.get("source", "manual")).strip() or "manual"
    url = payload.get("url")

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    try:
        entry, changed = upsert_source(title, content, source, url)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({"item": entry, "changed": changed}), 200 if not changed else 201


@app.post("/api/ingest")
def ingest():
    payload = request.get_json(silent=True) or {}
    items = payload.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({"error": "items must be a non-empty list"}), 400

    results = []
    changed_count = 0

    for item in items:
        if not isinstance(item, dict):
            return jsonify({"error": "each item must be an object"}), 400

        try:
            entry, changed = upsert_source(
                item.get("title", ""),
                item.get("content", ""),
                item.get("source", "manual"),
                item.get("url"),
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        changed_count += int(changed)
        results.append(entry)

    return jsonify({
        "processed": len(results),
        "changed": changed_count,
        "items": results,
    })


@app.post("/api/ingest/ucc")
def ingest_ucc():
    payload = request.get_json(silent=True) or {}
    url = str(payload.get("url", "")).strip()

    if not url:
        return jsonify({"error": "url is required"}), 400

    try:
        entry, changed = fetch_and_ingest(url, payload.get("title"))
    except requests.RequestException as exc:
        return jsonify({"error": f"failed to fetch source: {exc}"}), 502
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({"item": entry, "changed": changed})


@app.post("/api/sync/ucc")
@require_sync_token
def sync_ucc():
    return jsonify(sync_ucc_sources())


@app.post("/api/ask")
def ask():
    payload = request.get_json(silent=True) or {}
    question = str(payload.get("question", "")).strip()

    if not question:
        return jsonify({"error": "question is required"}), 400

    matches = search_knowledge(question, load_knowledge())
    result = generate_answer(question, matches)

    return jsonify({
        "question": question,
        "answer": result["answer"],
        "provider": result["provider"],
        "model": result.get("model"),
        "sources": matches,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
