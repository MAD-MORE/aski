from flask import Flask, jsonify, request

from app.knowledge import load_knowledge, save_knowledge

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
    return jsonify({"count": len(load_knowledge()), "items": load_knowledge()})


@app.post("/api/knowledge")
def add_knowledge():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "")).strip()
    content = str(payload.get("content", "")).strip()
    source = str(payload.get("source", "manual")).strip() or "manual"

    if not title or not content:
        return jsonify({
            "error": "title and content are required"
        }), 400

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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
