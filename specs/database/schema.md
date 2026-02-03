# Database Schema Specification

## Overview
Complete PostgreSQL database schema for the Todo Web App using Neon DB. The schema implements user isolation, proper indexing, and follows security best practices for multi-tenant applications.

## Database Configuration
- **Database Type:** PostgreSQL (Neon DB compatible)
- **Connection Pooling:** Enabled with asyncpg
- **Migration Tool:** Alembic for schema evolution
- **ORM:** SQLModel (Pydantic + SQLAlchemy hybrid)

## Tables

### users Table
| Column | Type | Constraints | Indexes | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | PK | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | UNIQUE, BTREE | User email address (unique) |
| password_hash | VARCHAR(255) | NOT NULL | BTREE | BCrypt hashed password |
| first_name | VARCHAR(50) | NULL | BTREE | User's first name |
| last_name | VARCHAR(50) | NULL | BTREE | User's last name |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | BTREE | Account status flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | BTREE | Account creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | BTREE | Last update timestamp |

**Indexes:**
- `idx_users_email` ON email (UNIQUE)
- `idx_users_created_at` ON created_at
- `idx_users_is_active` ON is_active

**Constraints:**
- `users_email_unique` - UNIQUE(email)
- `users_email_check` - CHECK(email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

**Triggers:**
- `trg_users_updated_at` - Updates `updated_at` on any row modification

### tasks Table
| Column | Type | Constraints | Indexes | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | PK | Unique task identifier |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | BTREE, FK | Owner user identifier |
| title | VARCHAR(200) | NOT NULL | BTREE | Task title (1-200 chars) |
| description | TEXT | NULL | GIN (fulltext) | Task description (max 1000 chars) |
| due_date | TIMESTAMPTZ | NULL | BTREE | Task due date/time |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | BTREE | Task status enum |
| priority | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | BTREE | Task priority enum |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | BTREE | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | BTREE | Last update timestamp |

**Indexes:**
- `idx_tasks_user_id` ON user_id (BTREE) - Critical for user isolation
- `idx_tasks_due_date` ON due_date (BTREE) - For date filtering
- `idx_tasks_status` ON status (BTREE) - For status filtering
- `idx_tasks_priority` ON priority (BTREE) - For priority filtering
- `idx_tasks_created_at` ON created_at (BTREE) - For chronological sorting
- `idx_tasks_user_status` ON (user_id, status) (BTREE) - Composite for common queries
- `idx_tasks_search` ON (title, description) USING gin - Full-text search

**Foreign Keys:**
- `fk_tasks_user_id` - REFERENCES users(id) ON DELETE CASCADE

**Constraints:**
- `tasks_title_length_check` - CHECK(LENGTH(title) >= 1 AND LENGTH(title) <= 200)
- `tasks_description_length_check` - CHECK(LENGTH(description) <= 1000 OR description IS NULL)
- `tasks_status_check` - CHECK(status IN ('pending', 'in_progress', 'completed'))
- `tasks_priority_check` - CHECK(priority IN ('low', 'medium', 'high'))

**Triggers:**
- `trg_tasks_updated_at` - Updates `updated_at` on any row modification

### refresh_tokens Table (Optional - for refresh token storage)
| Column | Type | Constraints | Indexes | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | PK | Unique token identifier |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | BTREE, FK | Associated user |
| token_hash | VARCHAR(255) | NOT NULL | UNIQUE | Hashed refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | BTREE | Token expiration |
| is_revoked | BOOLEAN | NOT NULL, DEFAULT false | BTREE | Revocation status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | BTREE | Creation timestamp |

**Indexes:**
- `idx_refresh_tokens_user_id` ON user_id (BTREE)
- `idx_refresh_tokens_token_hash` ON token_hash (UNIQUE)
- `idx_refresh_tokens_expires_at` ON expires_at (BTREE)
- `idx_refresh_tokens_active` ON (user_id, is_revoked, expires_at) (BTREE)

**Foreign Keys:**
- `fk_refresh_tokens_user_id` - REFERENCES users(id) ON DELETE CASCADE

**Constraints:**
- `refresh_tokens_not_expired_check` - CHECK(expires_at > NOW())

## Database Functions and Procedures

### update_updated_at_column()
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Security Considerations

### User Isolation
- All queries must filter by `user_id` to prevent cross-user data access
- Row Level Security (RLS) can be enabled for additional protection
- Foreign key constraints enforce referential integrity
- CASCADE delete ensures orphaned records are removed

### Data Encryption
- Connection encryption using SSL/TLS
- Passwords stored as bcrypt hashes (not plain text)
- Sensitive data should be encrypted at application layer if needed

### Indexing Strategy
- Primary indexes on all primary keys
- Foreign key columns indexed for JOIN performance
- Frequently queried columns (status, priority, due_date) indexed
- Composite indexes for common query patterns
- Full-text search index on text fields

## Migration Strategy

### Initial Schema Creation
1. Create users table with basic structure
2. Create tasks table with foreign key relationship
3. Add indexes for performance
4. Create triggers for automatic timestamp updates
5. Add check constraints for data validation

### Future Schema Changes
- Use Alembic for version-controlled migrations
- Maintain backward compatibility when possible
- Plan for zero-downtime deployments
- Include rollback procedures for each migration

## Performance Optimization

### Query Optimization
- Use EXPLAIN ANALYZE for query performance analysis
- Ensure proper indexing for all WHERE clauses
- Limit result sets with pagination
- Use connection pooling for efficiency

### Connection Management
- Configure connection pool size based on application load
- Implement proper connection cleanup
- Monitor connection usage and timeouts
- Use async connections for non-blocking I/O

## Backup and Recovery

### Backup Strategy
- Automated daily backups via Neon DB
- Point-in-time recovery capability
- Regular backup verification
- Off-site backup storage

### Recovery Procedures
- Documented restore procedures
- Test recovery process regularly
- Version control for schema changes
- Data validation after recovery

## Monitoring and Maintenance

### Database Monitoring
- Query performance monitoring
- Connection pool utilization
- Disk space monitoring
- Replication lag (if applicable)

### Maintenance Tasks
- Regular vacuum and analyze operations
- Index maintenance and rebuilding
- Statistics updates
- Log rotation and retention

## Sample Queries

### User-Specific Task Retrieval
```sql
SELECT * FROM tasks
WHERE user_id = $1
AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

### Task Count by Status
```sql
SELECT status, COUNT(*) as count
FROM tasks
WHERE user_id = $1
GROUP BY status;
```

### Overdue Tasks Query
```sql
SELECT * FROM tasks
WHERE user_id = $1
AND status != 'completed'
AND due_date < NOW()
ORDER BY due_date ASC;
```

### Full-Text Search
```sql
SELECT * FROM tasks
WHERE user_id = $1
AND (to_tsvector('english', title || ' ' || COALESCE(description, ''))
     @@ plainto_tsquery('english', $2))
ORDER BY created_at DESC;
```