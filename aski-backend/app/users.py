from werkzeug.security import check_password_hash, generate_password_hash

from app.database import Base, SessionLocal, engine
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    institution: Mapped[str | None] = mapped_column(String(255))
    programme: Mapped[str | None] = mapped_column(String(255))
    level: Mapped[str | None] = mapped_column(String(50))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


def init_users():
    Base.metadata.create_all(bind=engine)


def create_user(email, password, institution=None, programme=None, level=None):
    init_users()
    session = SessionLocal()
    try:
        if session.query(User).filter_by(email=email.lower()).first():
            raise ValueError("email already registered")
        user = User(email=email.lower(), password_hash=generate_password_hash(password), institution=institution, programme=programme, level=level)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    finally:
        session.close()


def verify_user(email, password):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(email=email.lower()).first()
        return user if user and check_password_hash(user.password_hash, password) else None
    finally:
        session.close()
