from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def health_check():
    return jsonify({
        "name": "ASKI Backend",
        "status": "ok",
        "message": "ASKI backend is running"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
