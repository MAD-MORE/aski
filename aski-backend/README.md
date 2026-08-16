# ASKI Backend

Backend foundation for ASKI AI.

## Step 1

A minimal Flask service with a health endpoint.

### Run locally

```bash
cd aski-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

The API starts on `http://localhost:8000`.

`GET /` returns the backend health status.
