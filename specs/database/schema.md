# Database Schema Specification

## Overview
This document defines the database schema for the Task Management Application using SQLModel. The schema implements a multi-user system with proper data isolation and follows security best practices.

## Database Configuration
- **Database System**: Neon PostgreSQL
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Connection**: Connection pooling enabled
- **Security**: Encrypted connections, parameterized queries

## Database Tables

### 1. Users Table
The users table stores information about registered users.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field, Column, DateTime
from typing import Optional
from datetime import datetime
import uuid

class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    name: str = Field(nullable=False)

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow)
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
```

**Indexes:**
- `users_email_idx`: Index on email field for fast lookups
- `users_created_at_idx`: Index on created_at for time-based queries

### 2. Tasks Table
The tasks table stores user tasks with proper user scoping.

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
from typing import Optional
from datetime import datetime
import uuid

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    status: str = Field(default="pending", max_length=50)
    priority: str = Field(default="medium", max_length=20)
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)

class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    user: "User" = Relationship()
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow)
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
```

**Indexes:**
- `tasks_user_id_idx`: Index on user_id for user-specific queries
- `tasks_status_idx`: Index on status for filtering
- `tasks_priority_idx`: Index on priority for sorting
- `tasks_due_date_idx`: Index on due_date for deadline-based queries
- `tasks_created_at_idx`: Index on created_at for time-based queries

### 3. Sessions Table (Optional - for token management)
The sessions table stores active user sessions if needed for refresh tokens.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
from typing import Optional
from datetime import datetime
import uuid

class SessionBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    token_hash: str = Field(unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)

class Session(SessionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user: "User" = Relationship()
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), default=datetime.utcnow)
    )
```

**Indexes:**
- `sessions_token_hash_idx`: Index on token_hash for fast token lookup
- `sessions_expires_at_idx`: Index on expires_at for cleanup queries

## Data Integrity Constraints

### Primary Keys
- All tables use UUID primary keys for better security and distributed systems compatibility
- Primary key fields are auto-generated

### Foreign Keys
- Tasks are linked to users via user_id foreign key
- CASCADE delete ensures data consistency when users are deleted
- Referential integrity enforced at database level

### Unique Constraints
- Users email field has unique constraint
- Session token_hash field has unique constraint

### Check Constraints
- Status field in tasks table: CHECK (status IN ('pending', 'in_progress', 'completed'))
- Priority field in tasks table: CHECK (priority IN ('low', 'medium', 'high'))

## Indexing Strategy

### Performance Indexes
1. **Users Table**
   - Email index for authentication lookups
   - Created at index for user analytics

2. **Tasks Table**
   - User ID index for user-specific queries
   - Status index for filtering
   - Priority index for sorting
   - Due date index for deadline management
   - Created at index for time-based queries

3. **Sessions Table**
   - Token hash index for session validation
   - Expires at index for cleanup operations

### Composite Indexes
- `(user_id, status)` for user-specific status queries
- `(user_id, priority)` for user-specific priority queries
- `(user_id, due_date)` for user-specific deadline queries

## Security Considerations

### Data Isolation
- All user data is properly scoped using user_id foreign keys
- Queries must always include user_id filters
- Foreign key constraints enforce data integrity

### Sensitive Data
- Passwords stored as hashed values (never plain text)
- JWT tokens stored as hashed values when persisted
- No sensitive data stored in plain text

### Access Control
- Database user has minimal required permissions
- No direct database access from frontend
- All database operations go through backend API

## Migration Strategy

### Initial Schema
- Create all tables in proper dependency order
- Set up indexes after table creation
- Configure foreign key constraints

### Future Migrations
- Use Alembic for database migrations
- Maintain backward compatibility where possible
- Test migrations in development environment first

## Performance Guidelines

### Query Optimization
- Always filter by user_id for user-specific data
- Use appropriate indexes for common query patterns
- Implement pagination for large result sets
- Use connection pooling for database connections

### Index Maintenance
- Regularly analyze query performance
- Add indexes for new query patterns
- Remove unused indexes periodically
- Monitor index size and performance impact

## Backup and Recovery

### Backup Strategy
- Automated daily backups
- Point-in-time recovery capability
- Encrypted backup storage
- Regular backup verification

### Recovery Procedures
- Documented recovery procedures
- Regular recovery testing
- Multiple backup retention policies
- Disaster recovery plan