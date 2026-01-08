from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from .auth import verify_token


security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Dependency to get the current authenticated user from the JWT token.

    Args:
        credentials: The authorization credentials from the request header

    Returns:
        The user data from the token if valid

    Raises:
        HTTPException: If the token is invalid or expired
    """
    token = credentials.credentials
    user_data = verify_token(token)

    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_data


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Dependency to get the current authenticated user ID from the JWT token.

    Args:
        credentials: The authorization credentials from the request header

    Returns:
        The user ID from the token if valid

    Raises:
        HTTPException: If the token is invalid or expired
    """
    token = credentials.credentials
    user_data = verify_token(token)

    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = user_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: no user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id