from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    """
    Base schema for Task containing common fields.
    """
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskCreate(TaskBase):
    """
    Schema for creating a new task.
    """
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task.
    All fields are optional to allow partial updates.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(TaskBase):
    """
    Schema for task response with additional fields.
    """
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True