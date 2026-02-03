"""
JWT Authentication Middleware for Todo Web App

This module implements JWT token validation middleware for protecting API endpoints.
"""

from fastapi import Request, HTTPException, status, Depends
from fastapi.security.http import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime
from typing import Optional
import os
from ..models import User
from ..database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import hashlib


# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


security = HTTPBearer()


async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get current user from JWT token.

    Args:
        token: HTTP authorization credentials

    Returns:
        User: The authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Verify token hasn't expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Get user from database
    async with get_async_session() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if user is None or not user.is_active:
            raise credentials_exception

        return user


# Middleware function for JWT validation
async def jwt_auth_middleware(request: Request, call_next):
    """JWT authentication middleware function."""
    # Skip authentication for public endpoints
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        # Also skip for auth endpoints that don't require authentication
        if not request.url.path.startswith("/api/v1/auth/register") and \
           not request.url.path.startswith("/api/v1/auth/login"):
            pass  # Allow through for now, will be handled by individual route dependencies

    # For protected endpoints, we'll rely on the get_current_user dependency
    # This middleware is primarily for setting up the request state
    response = await call_next(request)
    return response


# Utility function to create JWT token
def create_access_token(data: dict, expires_delta=None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        from datetime import timedelta
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire.timestamp()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Utility function to verify JWT token
async def verify_token(token: str) -> Optional[User]:
    """Verify JWT token and return user if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            return None

        # Verify token hasn't expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        # Get user from database
        async with get_async_session() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if user and user.is_active:
                return user
            return None
    except JWTError:
        return None