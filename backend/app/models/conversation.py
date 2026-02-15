from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .message import Message
    from .user import User

class Conversation(SQLModel, table=True):
    """
    Conversation model to group messages.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(
        description="External user ID from Better Auth",
        foreign_key="user.external_id",
        index=True,
        nullable=False
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to Messages
    messages: List["Message"] = Relationship(back_populates="conversation")
    
    # Relationship to User (optional to avoid circular dependency issues if strict, but good to have)
    # We will use string forward reference if we were to add it, but for now we just keep the ID.
    # If we need the object:
    # user: Optional["User"] = Relationship()
