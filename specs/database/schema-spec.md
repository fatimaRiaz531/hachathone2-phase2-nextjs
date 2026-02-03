# Phase-II Database Schema Specification

## Overview
This document specifies the database schema for Phase-II of the Evolution of Todo project. The database uses PostgreSQL with Neon and follows the SQLModel specifications for the full-stack multi-user web application. The schema implements a multi-tenant approach where all data is scoped to individual users to ensure proper data isolation.

## Database Technology
- **Database System**: PostgreSQL (Neon)
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Connection**: Connection pooling with proper resource management
- **Migration Tool**: Alembic for schema migrations

## Database Tables

### 1. Users Table
**Table Name**: `users`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| name | VARCHAR(255) | NOT NULL | User's display name |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when user was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when user was last updated |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Flag indicating if user account is active |

**Indexes**:
- Primary key: `id`
- Unique index: `email`
- Index: `created_at`

**Foreign Key Relationships**: None

### 2. Tasks Table
**Table Name**: `tasks`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, NOT NULL, AUTO_INCREMENT | Unique identifier for the task |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Task description (optional) |
| completed | BOOLEAN | NOT NULL, DEFAULT false | Flag indicating if task is completed |
| user_id | UUID | NOT NULL | Foreign key referencing the user who owns the task |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when task was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when task was last updated |

**Indexes**:
- Primary key: `id`
- Index: `user_id` (for efficient user-based queries)
- Index: `completed` (for filtering by completion status)
- Index: `created_at` (for sorting by creation date)

**Foreign Key Relationships**:
- `user_id` references `users.id` with CASCADE delete

## SQLModel Definitions

### User Model
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default=datetime.utcnow)
    updated_at: datetime = Field(default=datetime.utcnow)
    is_active: bool = Field(default=True)

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    password: str

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool
```

### Task Model
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid

class TaskBase(SQLModel):
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: int = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    created_at: datetime = Field(default=datetime.utcnow)
    updated_at: datetime = Field(default=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="tasks")

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: int
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
```

## Database Constraints

### 1. Referential Integrity
- Foreign key constraint ensures tasks are deleted when a user is deleted (CASCADE)
- User email must be unique across the system

### 2. Data Validation
- User email format validation (handled at application level)
- Task title length validation (max 255 characters)
- Task description length validation (max 1000 characters)
- Required field constraints enforced at database level

### 3. Indexing Strategy
- Primary keys indexed automatically
- Foreign key columns indexed for join performance
- Frequently queried columns (user_id, completed) indexed
- Unique constraints for business logic enforcement

## Security Considerations

### 1. Data Protection
- Passwords stored as bcrypt hashes (never stored in plain text)
- No sensitive user data stored without encryption
- User isolation through foreign key relationships

### 2. Access Control
- Database access limited to application backend only
- No direct database access from frontend
- Proper connection string security with environment variables

### 3. Injection Prevention
- All queries use parameterized statements through SQLModel
- Input validation at application level before database operations
- SQLModel's built-in protection against SQL injection

## Performance Considerations

### 1. Query Optimization
- Proper indexing on frequently queried fields
- Efficient relationship loading strategies
- Pagination support for large result sets

### 2. Connection Management
- Connection pooling for efficient resource utilization
- Proper connection lifecycle management
- Timeout configurations for connection health

### 3. Scalability
- Schema designed to handle multi-user load
- Indexing strategy supports concurrent access
- Efficient data retrieval patterns

## Migration Strategy

### 1. Initial Schema Creation
- Alembic migration for initial database setup
- Proper migration naming and versioning
- Downgrade capability for rollback scenarios

### 2. Future Schema Changes
- Non-breaking changes should maintain backward compatibility
- Breaking changes require proper migration scripts
- Data preservation during schema evolution

## Data Lifecycle

### 1. User Lifecycle
- User created during registration
- User updated when profile information changes
- User marked inactive rather than deleted (soft delete)

### 2. Task Lifecycle
- Task created when user adds a new task
- Task updated when user modifies title/description/completion status
- Task deleted when user removes it
- All tasks deleted when user account is deleted (CASCADE)

## Backup and Recovery

### 1. Backup Strategy
- Automated database backups through Neon
- Point-in-time recovery capability
- Regular backup validation

### 2. Recovery Procedures
- Database restoration from backups
- Data consistency verification
- Application restart procedures after recovery