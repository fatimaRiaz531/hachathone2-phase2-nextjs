from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """
    Base schema for User containing common fields.
    """
    external_id: str
    email: str
    name: Optional[str] = None


class UserCreate(UserBase):
    """
    Schema for creating a new user.
    """
    external_id: str
    email: str
    name: Optional[str] = None


class UserUpdate(BaseModel):
    """
    Schema for updating an existing user.
    All fields are optional to allow partial updates.
    """
    name: Optional[str] = None


class UserResponse(UserBase):
    """
    Schema for user response with additional fields.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True