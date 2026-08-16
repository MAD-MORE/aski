import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be configured for ASKI")

# Supabase commonly provides a PostgreSQL URL without an explicit driver.
# SQLAlchemy otherwise falls back to psycopg2, while ASKI ships psycopg (v3).
# Normalize the URL so the installed psycopg v3 driver is always selected.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def init_db():
    # Production schema is managed by Supabase migrations.
    # Do not create tables from application startup.
    return None
