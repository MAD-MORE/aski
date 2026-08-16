import os
from functools import wraps

from flask import jsonify, request


def require_sync_token(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        expected = os.getenv("ASKI_SYNC_API_TOKEN")
        if not expected:
            return jsonify({"error": "sync authentication is not configured"}), 503

        auth = request.headers.get("Authorization", "")
        if auth != f"Bearer {expected}":
            return jsonify({"error": "unauthorized"}), 401

        return view(*args, **kwargs)

    return wrapped
