from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .conversation import Conversation

class Message(SQLModel, table=True):
    """
    Message model for user/assistant interactions.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversation.id", index=True, nullable=False)
    user_id: str = Field(
        description="External user ID from Better Auth",
        index=True,
        nullable=False
    )
    role: str = Field(description="Role: user or assistant", nullable=False)
    content: str = Field(description="Content of the message", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to Conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
