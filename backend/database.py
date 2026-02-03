"""
Database configuration and connection module for the Todo Web App.

This module provides database connection utilities using SQLModel with async support
for PostgreSQL/Neon DB. It includes both sync and async engines for different use cases.
"""

from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from typing import AsyncGenerator


# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://username:password@localhost:5432/todo_app"
)


# Create async engine for application operations
async_engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=20,  # Connection pool size
    max_overflow=30,  # Additional connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
)


# Create sync engine for migrations and admin operations
sync_engine = create_engine(
    DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"),
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)


# Async session maker
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# Sync session maker for migrations
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get async database session.

    Yields:
        AsyncSession: An async database session for use with FastAPI dependencies.
    """
    async with AsyncSessionLocal() as session:
        yield session


def get_sync_session():
    """
    Dependency function to get sync database session.

    Yields:
        Session: A sync database session for use with migrations and admin operations.
    """
    with SyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """
    Initialize the database by creating all tables.

    This function creates all tables defined in the SQLModel models.
    It should be called during application startup.
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


def init_db_sync() -> None:
    """
    Initialize the database synchronously (for migrations).

    This function creates all tables defined in the SQLModel models.
    It should be used for migration scripts and setup operations.
    """
    SQLModel.metadata.create_all(sync_engine)


async def close_db():
    """
    Close the database connections.

    This function should be called during application shutdown.
    """
    await async_engine.dispose()


# Test connection function
async def test_connection():
    """
    Test the database connection by attempting to connect.

    Returns:
        bool: True if connection successful, False otherwise.
    """
    try:
        async with async_engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception:
        return False