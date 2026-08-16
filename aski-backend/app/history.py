from datetime import datetime, timezone

from app.database import SessionLocal, init_db
from app.models import SyncRun


def record_sync(status, sources_checked=0, documents_changed=0, run_id=None):
    init_db()
    session = SessionLocal()
    try:
        if run_id:
            run = session.get(SyncRun, run_id)
        else:
            run = SyncRun()
            session.add(run)
        run.status = status
        run.sources_checked = sources_checked
        run.documents_changed = documents_changed
        run.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.commit()
        return run.id
    finally:
        session.close()
