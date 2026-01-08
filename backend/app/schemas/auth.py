from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """
    Schema for JWT token response.
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Schema for token data.
    """
    username: Optional[str] = None


class UserLogin(BaseModel):
    """
    Schema for user login request.
    """
    email: str
    password: str


class UserSignup(BaseModel):
    """
    Schema for user signup request.
    """
    email: str
    password: str
    name: Optional[str] = None