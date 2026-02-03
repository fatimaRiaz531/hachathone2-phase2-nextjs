from sqlmodel import create_engine, Session
from contextlib import contextmanager
from typing import Generator
from settings import settings
import logging

# Determine the database URL to use
# Prioritize neon_database_url, fallback to database_url
database_url = settings.neon_database_url or settings.database_url

# Create the database engine
# Using the database_url from settings with Neon-specific optimizations
engine = create_engine(
    database_url,
    echo=settings.debug,  # This will show SQL queries in debug mode
    pool_pre_ping=True,   # Verify connections before use (critical for serverless)
    pool_recycle=300,     # Recycle connections after 5 minutes
    pool_size=5,          # Connection pool size
    max_overflow=10,      # Max additional connections beyond pool_size
    pool_timeout=30,      # Connection timeout
)

@contextmanager
def get_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Ensures proper session cleanup after use.
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def init_db():
    """
    Initialize the database by creating all tables.
    This should be called on application startup.
    """
    from app.models.task import Task  # Import models to register them
    from app.models.user import User
    from sqlmodel import SQLModel

    # Create all tables
    SQLModel.metadata.create_all(engine)
    logging.info("Database tables created successfully")