"""
Authentication Routes for Todo Web App

This module implements user registration, login, logout, and token refresh endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.http import HTTPAuthorizationCredentials
from middleware.auth import security
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt
import uuid
from models import User, RefreshToken
from schemas import (
    UserRegisterRequest, UserLoginRequest, TokenRefreshRequest,
    LoginResponse, TokenResponse, LogoutResponse, TokenRefreshResponse, UserResponse
)
from database import get_async_session
from utils.password import hash_password, verify_password
from middleware.auth import create_access_token, verify_token
import os
import hashlib


# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


router = APIRouter()


@router.post("/auth/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegisterRequest, db: AsyncSession = Depends(get_async_session)):
    """
    Register a new user account.
    """
    # Check if user already exists
    existing_user = await db.execute(select(User).filter(User.email == user_data.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.id}, expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token = str(uuid.uuid4())
    refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    refresh_token_expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token_obj = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=new_user.id,
        token_hash=refresh_token_hash,
        expires_at=refresh_token_expires,
        is_revoked=False,
        created_at=datetime.utcnow()
    )

    db.add(refresh_token_obj)
    await db.commit()

    # Prepare response
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: UserLoginRequest, db: AsyncSession = Depends(get_async_session)):
    """
    Authenticate user and return JWT tokens.
    """
    # Find user by email
    print(f"DEBUG: Login attempt - Email: '{login_data.email}'")
    user_result = await db.execute(select(User).filter(User.email == login_data.email))
    user = user_result.scalar_one_or_none()

    if not user:
        print(f"DEBUG: User not found: '{login_data.email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    is_valid = verify_password(login_data.password, user.password_hash)
    print(f"DEBUG: Password check for '{login_data.email}': {is_valid} (Length: {len(login_data.password)})")
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token = str(uuid.uuid4())
    refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    refresh_token_expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token_obj = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=refresh_token_expires,
        is_revoked=False,
        created_at=datetime.utcnow()
    )

    db.add(refresh_token_obj)
    await db.commit()

    # Prepare response
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


@router.post("/auth/logout", response_model=LogoutResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Invalidate current session by revoking refresh token.
    """
    token = credentials.credentials

    # Hash the token to match stored value
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Find and revoke the refresh token
    token_result = await db.execute(
        select(RefreshToken).filter(RefreshToken.token_hash == token_hash)
    )
    refresh_token = token_result.scalar_one_or_none()

    if refresh_token:
        refresh_token.is_revoked = True
        await db.commit()

    return LogoutResponse(message="Successfully logged out")


@router.post("/auth/refresh", response_model=TokenRefreshResponse)
async def refresh_token(token_data: TokenRefreshRequest, db: AsyncSession = Depends(get_async_session)):
    """
    Refresh expired access token using refresh token.
    """
    # Hash the provided token to match stored value
    token_hash = hashlib.sha256(token_data.refresh_token.encode()).hexdigest()

    # Find the refresh token
    token_result = await db.execute(
        select(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .filter(RefreshToken.expires_at > datetime.utcnow())
        .filter(RefreshToken.is_revoked == False)
    )
    refresh_token = token_result.scalar_one_or_none()

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # Get the associated user
    user_result = await db.execute(select(User).filter(User.id == refresh_token.user_id))
    user = user_result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user account"
        )

    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )