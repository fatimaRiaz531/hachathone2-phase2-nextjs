from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from .user import User

class TaskBase(SQLModel):
    """
    Base class for Task model containing common fields.
    """
    title: str = Field(
        description="Task title",
        min_length=1,
        max_length=200,
        nullable=False
    )
    description: Optional[str] = Field(
        description="Task description",
        default=None
    )
    completed: bool = Field(
        description="Task completion status",
        default=False
    )
    user_id: str = Field(
        description="External user ID from Better Auth",
        foreign_key="user.external_id",
        nullable=False
    )

class Task(TaskBase, table=True):
    """
    Task model with user association.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True)

    # Relationship to User (external reference)
    user: Optional[User] = Relationship()