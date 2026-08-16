import os
from urllib.parse import urlparse, urlunparse

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be configured for ASKI")

# ASKI runs on Vercel, where Supabase's direct database hostname can resolve
# to IPv6. Vercel's Python runtime may not have usable IPv6 connectivity, so
# transparently route Supabase direct URLs through the IPv4-compatible pooler.
parsed = urlparse(DATABASE_URL)

if parsed.scheme in ("postgres", "postgresql"):
    host = parsed.hostname or ""
    username = parsed.username
    port = parsed.port

    # Direct Supabase DB host: db.<project-ref>.supabase.co
    if host.startswith("db.") and host.endswith(".supabase.co"):
        project_ref = host[3:-len(".supabase.co")]
        pooler_host = "aws-0-eu-north-1.pooler.supabase.com"
        pooler_user = f"postgres.{project_ref}"
        # Session-mode pooler uses 5432 and avoids IPv6-only direct access.
        parsed = parsed._replace(
            scheme="postgresql+psycopg",
            netloc=f"{pooler_user}:{parsed.password}@{pooler_host}:5432",
        )
        DATABASE_URL = urlunparse(parsed)
    elif parsed.scheme == "postgres":
        DATABASE_URL = urlunparse(parsed._replace(scheme="postgresql+psycopg"))
    elif parsed.scheme == "postgresql":
        DATABASE_URL = urlunparse(parsed._replace(scheme="postgresql+psycopg"))

# Supabase pooler connections should not be held by SQLAlchemy between
# serverless invocations. Let each invocation acquire/release its connection.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def init_db():
    # Production schema is managed by Supabase migrations.
    # Do not create tables from application startup.
    return None
