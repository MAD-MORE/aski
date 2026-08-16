import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND = os.path.join(ROOT, "aski-backend")
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

from app.main import app

# Vercel's Python runtime discovers the Flask WSGI application as `app`.
