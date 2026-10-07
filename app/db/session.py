from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.config import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

Base = declarative_base()

_engine = None
_async_session_maker = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        # For sqlite, ensure connect_args allows check_same_thread=False
        connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            connect_args=connect_args
        )
    return _engine


def get_session_maker():
    global _async_session_maker
    if _async_session_maker is None:
        engine = get_engine()
        _async_session_maker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    return _async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    session_maker = get_session_maker()
    async with session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initializes database schema and tables."""
    engine = get_engine()
    # Import all models to ensure they are registered with Base.metadata
    import app.db.models  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")
