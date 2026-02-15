"""
Database models for the Todo Web App using SQLModel.

This module defines the database models for users, tasks, and conversations
following the specifications for the Todo Web App.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from enum import Enum
import uuid

if TYPE_CHECKING:
    pass

# Enums for status and priority
class TaskStatus(str, Enum):
    """Enum for task status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    """Enum for task priority values."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# User model
class UserBase(SQLModel):
    """Base model for User containing common fields."""
    email: str = Field(
        sa_column_kwargs={"unique": True},
        max_length=255,
        description="User email address (unique from Clerk)"
    )
    first_name: Optional[str] = Field(
        default=None,
        max_length=50,
        description="User's first name"
    )
    last_name: Optional[str] = Field(
        default=None,
        max_length=50,
        description="User's last name"
    )
    is_active: bool = Field(
        default=True,
        description="Account status flag"
    )


class User(UserBase, table=True):
    """User model representing application users."""
    __tablename__ = "users"

    # We use String ID to match Clerk's User ID (e.g., "user_2N...")
    id: str = Field(
        primary_key=True,
        description="Unique user identifier (from Clerk)"
    )
    password_hash: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Not used with Clerk, but kept for legacy/compatibility"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    # Relationship to tasks
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"
        }
    )

    # Relationship to conversations
    conversations: List["Conversation"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"
        }
    )


# Task model
class TaskBase(SQLModel):
    """Base model for Task containing common fields."""
    title: str = Field(
        max_length=200,
        description="Task title (1-200 chars)",
        sa_column_kwargs={
            "nullable": False
        }
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Task description (max 1000 chars)"
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Task due date/time"
    )
    status: TaskStatus = Field(
        default=TaskStatus.PENDING,
        description="Task status enum"
    )
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM,
        description="Task priority enum"
    )
    completed: bool = Field(
        default=False,
        description="Task completion status (Phase III requirement)"
    )


class Task(TaskBase, table=True):
    """Task model representing user tasks."""
    __tablename__ = "tasks"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique task identifier"
    )
    user_id: Optional[str] = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        description="Owner user identifier"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    # Relationship to user
    user: Optional[User] = Relationship(
        back_populates="tasks",
        sa_relationship_kwargs={
            "lazy": "selectin"
        }
    )


# Conversation models for Phase III
class ConversationBase(SQLModel):
    """Base model for Conversation."""
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="Owner user identifier"
    )


class Conversation(ConversationBase, table=True):
    """Conversation model representing a chat session."""
    __tablename__ = "conversations"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique conversation identifier"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    # Relationship to user
    user: User = Relationship(back_populates="conversations")
    
    # Relationship to messages
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "Message.created_at",
            "lazy": "selectin"
        }
    )


class MessageBase(SQLModel):
    """Base model for Message."""
    role: str = Field(description="Message role (user, assistant, system)")
    content: str = Field(description="Message content")
    conversation_id: str = Field(
        foreign_key="conversations.id",
        index=True,
        description="Parent conversation identifier"
    )
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="Sender user identifier"
    )


class Message(MessageBase, table=True):
    """Message model representing a single chat message."""
    __tablename__ = "messages"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique message identifier"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )

    # Relationship to conversation
    conversation: Conversation = Relationship(back_populates="messages")