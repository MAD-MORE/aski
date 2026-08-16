import os
from functools import wraps

from flask import jsonify, request


def require_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        token = os.getenv("ASKI_ADMIN_TOKEN")
        supplied = request.headers.get("Authorization", "")
        if not token or supplied != f"Bearer {token}":
            return jsonify({"error": "admin authorization required"}), 401
        return view(*args, **kwargs)
    return wrapped
