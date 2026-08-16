import os
from urllib.parse import quote, urlparse, urlunparse

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

    # Direct Supabase DB host: db.<project-ref>.supabase.co
    if host.startswith("db.") and host.endswith(".supabase.co"):
        project_ref = host[3:-len(".supabase.co")]
        pooler_host = "aws-0-eu-north-1.pooler.supabase.com"
        pooler_user = f"postgres.{project_ref}"
        password = quote(parsed.password or "", safe="")
        userinfo = f"{quote(pooler_user, safe='')}:{password}"

        parsed = parsed._replace(
            scheme="postgresql+psycopg",
            netloc=f"{userinfo}@{pooler_host}:5432",
        )
        DATABASE_URL = urlunparse(parsed)
    elif parsed.scheme == "postgres":
        DATABASE_URL = urlunparse(parsed._replace(scheme="postgresql+psycopg"))
    elif parsed.scheme == "postgresql":
        DATABASE_URL = urlunparse(parsed._replace(scheme="postgresql+psycopg"))

# Production schema is managed by Supabase. SQLAlchemy only manages runtime
# connections; it must never create or alter the production schema at startup.
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
    return None
