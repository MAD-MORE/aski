from flask import Flask, jsonify, request

from app.ai import generate_answer
from app.knowledge import load_knowledge, save_knowledge
from app.retrieval import search_knowledge

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

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    entries = load_knowledge()
    entry = {
        "id": len(entries) + 1,
        "title": title,
        "content": content,
        "source": source,
    }
    entries.append(entry)
    save_knowledge(entries)
    return jsonify(entry), 201


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
