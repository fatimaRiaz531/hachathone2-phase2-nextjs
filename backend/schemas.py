"""
Pydantic Schemas for Todo Web App API

This module defines all request and response schemas for API endpoints
including user, authentication, and task models.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from models import TaskStatus, TaskPriority


# Enum schemas for API use
class TaskStatusSchema(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPrioritySchema(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Authentication Schemas
class UserRegisterRequest(BaseModel):
    """Schema for user registration request."""
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')

        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(not c.isalnum() for c in v)

        if not (has_upper and has_lower and has_digit and has_special):
            raise ValueError('Password must include uppercase, lowercase, number, and special character')

        return v

    @field_validator('first_name', 'last_name')
    def validate_name_length(cls, v):
        if v and len(v) > 50:
            raise ValueError('Name must be at most 50 characters')
        return v


class UserLoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


class UserLogoutRequest(BaseModel):
    """Schema for user logout request (empty)."""
    pass


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class LogoutResponse(BaseModel):
    """Schema for logout response."""
    message: str


class TokenRefreshResponse(BaseModel):
    """Schema for token refresh response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# Task Schemas
class TaskCreateRequest(BaseModel):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[TaskStatusSchema] = TaskStatusSchema.PENDING
    priority: Optional[TaskPrioritySchema] = TaskPrioritySchema.MEDIUM

    @field_validator('title')
    def validate_title(cls, v):
        if not v or len(v) < 1 or len(v) > 200:
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if v and len(v) > 1000:
            raise ValueError('Description must be at most 1000 characters')
        return v


class TaskUpdateRequest(BaseModel):
    """Schema for updating a task (full replacement)."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatusSchema
    priority: TaskPrioritySchema

    @field_validator('title')
    def validate_title(cls, v):
        if not v or len(v) < 1 or len(v) > 200:
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if v and len(v) > 1000:
            raise ValueError('Description must be at most 1000 characters')
        return v


class TaskPartialUpdateRequest(BaseModel):
    """Schema for partially updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[TaskStatusSchema] = None
    priority: Optional[TaskPrioritySchema] = None

    @field_validator('title')
    def validate_title(cls, v):
        if v and (len(v) < 1 or len(v) > 200):
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if v and len(v) > 1000:
            raise ValueError('Description must be at most 1000 characters')
        return v


class TaskResponse(BaseModel):
    """Schema for task response."""
    model_config = {"from_attributes": True}
    
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatusSchema
    priority: TaskPrioritySchema
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """Schema for task list response with pagination metadata."""
    data: List[TaskResponse]
    meta: dict


class TaskStatsResponse(BaseModel):
    """Schema for task statistics response."""
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
    high_priority_tasks: int


# User Profile Schemas
class UserProfileUpdateRequest(BaseModel):
    """Schema for updating user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @field_validator('first_name', 'last_name')
    def validate_name_length(cls, v):
        if v and len(v) > 50:
            raise ValueError('Name must be at most 50 characters')
        return v


class UserProfileResponse(BaseModel):
    """Schema for user profile response."""
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Common Response Schemas
class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    errors: Optional[List[dict]] = None


class SuccessResponse(BaseModel):
    """Schema for success responses."""
    message: str
# Chat Schemas
class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatMessageResponse(BaseModel):
    role: str
    content: str
    created_at: datetime

class ChatResponse(BaseModel):
    response: str
    history: List[ChatMessageResponse]
