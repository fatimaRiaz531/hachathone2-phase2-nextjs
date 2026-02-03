"""
Dependency Injection Module for Todo Web App

This module provides FastAPI dependency injection functions for common operations
like getting current user, database sessions, and other shared resources.
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from .models import User
from .database import get_async_session
from .middleware.auth import JWTBearer
from typing import Optional


async def get_current_user(
    db: AsyncSession = Depends(get_async_session),
    token_data: str = Depends(JWTBearer())
) -> User:
    """
    Get the currently authenticated user from JWT token.

    Args:
        db: Async database session
        token_data: Verified JWT token data

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: If user is not found or inactive
    """
    # Extract user ID from token (this would come from the JWTBearer dependency)
    # Since our JWTBearer already verifies and attaches the user to request state,
    # we can access it directly

    # The JWTBearer dependency should have already validated the token and attached
    # the user to the request state, so we'll extract the user_id from the token
    # and fetch the user from the database

    # For now, we'll implement this based on our JWT utility
    from .middleware.auth import verify_token
    user = await verify_token(token_data.credentials if hasattr(token_data, 'credentials') else token_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_db_session() -> AsyncSession:
    """
    Get database session dependency.

    This is a convenience alias for get_async_session.
    """
    return Depends(get_async_session)


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get the current active user, ensuring they are active.

    Args:
        current_user: The authenticated user

    Returns:
        User: The active user object

    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    return current_user