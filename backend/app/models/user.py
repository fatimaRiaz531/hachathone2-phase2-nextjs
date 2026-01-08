from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class UserBase(SQLModel):
    """
    Base class for User model containing common fields.
    Note: User authentication is handled by Better Auth externally,
    but we maintain user references for task ownership.
    """
    external_id: str = Field(
        description="External user ID from Better Auth",
        unique=True,
        nullable=False
    )
    email: str = Field(
        description="User's email address",
        unique=True,
        nullable=False
    )
    name: Optional[str] = Field(
        description="User's display name",
        default=None
    )

class User(UserBase, table=True):
    """
    User model for internal reference to track task ownership.
    Actual authentication is handled by Better Auth externally.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True)