# Feature: Task CRUD Operations

## Overview
Complete task management functionality allowing authenticated users to create, read, update, and delete tasks with filtering, pagination, and user isolation. Each task is owned by a specific user and can only be accessed by the owner.

## User Stories

### US-001: Create Task
**As a** registered user
**I want** to create a new task with title, description, due date, and priority
**So that** I can track my work items and deadlines

#### Acceptance Criteria
- [ ] AC-001: Task is created with provided title (required, 1-200 characters)
- [ ] AC-002: Task is associated with the authenticated user (user_id from JWT)
- [ ] AC-003: Created task is returned with generated ID and timestamps
- [ ] AC-004: Validation errors return 400 with field-specific messages
- [ ] AC-005: Description is optional, max 1000 characters if provided
- [ ] AC-006: Priority defaults to 'medium' if not specified
- [ ] AC-007: Due date is optional, can be null

### US-002: List Tasks with Filters
**As a** registered user
**I want** to view my tasks with optional filters for status, priority, and due date
**So that** I can focus on relevant tasks

#### Acceptance Criteria
- [ ] AC-001: Only tasks belonging to authenticated user are returned
- [ ] AC-002: Results can be filtered by status (pending, in_progress, completed)
- [ ] AC-003: Results can be filtered by priority (low, medium, high)
- [ ] AC-004: Results can be filtered by due_date range
- [ ] AC-005: Pagination is supported with page/limit parameters
- [ ] AC-006: Results can be sorted by creation date, due date, or priority
- [ ] AC-007: Total count and pagination metadata are included in response

### US-003: Get Specific Task
**As a** registered user
**I want** to view details of a specific task
**So that** I can see all information about that task

#### Acceptance Criteria
- [ ] AC-001: Task exists and belongs to authenticated user
- [ ] AC-002: Returns complete task details including all fields
- [ ] AC-003: Returns 404 if task doesn't exist
- [ ] AC-004: Returns 403 if user doesn't own the task
- [ ] AC-005: Task ID validation prevents injection attacks

### US-004: Update Task
**As a** registered user
**I want** to modify my existing task details
**So that** I can keep my task information current

#### Acceptance Criteria
- [ ] AC-001: Task exists and belongs to authenticated user
- [ ] AC-002: Only specified fields are updated (partial updates allowed)
- [ ] AC-003: Returns updated task with new values
- [ ] AC-004: Returns 404 if task doesn't exist
- [ ] AC-005: Returns 403 if user doesn't own the task
- [ ] AC-006: Validation applies to updated values
- [ ] AC-007: Updated_at timestamp is automatically updated

### US-005: Delete Task
**As a** registered user
**I want** to permanently remove a task I no longer need
**So that** my task list stays organized

#### Acceptance Criteria
- [ ] AC-001: Task exists and belongs to authenticated user
- [ ] AC-002: Task is permanently removed from database
- [ ] AC-003: Returns success confirmation
- [ ] AC-004: Returns 404 if task doesn't exist
- [ ] AC-005: Returns 403 if user doesn't own the task
- [ ] AC-006: Operation is atomic (no partial deletion)

## API Specification

### Endpoints

#### POST /api/v1/tasks
**Description:** Create a new task
**Authentication:** JWT Bearer Token (required)

**Request:**
```json
{
  "title": "string | required | 1-200 chars",
  "description": "string | optional | max 1000 chars",
  "due_date": "ISO8601 | optional",
  "status": "enum | optional | default: pending | [pending, in_progress, completed]",
  "priority": "enum | optional | default: medium | [low, medium, high]"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "due_date": "ISO8601 | null",
  "status": "string",
  "priority": "string",
  "user_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 400: Validation errors (title too long, invalid enum values)
- 401: Invalid or expired JWT token
- 422: Unprocessable entity (malformed request)

#### GET /api/v1/tasks
**Description:** List tasks for authenticated user with optional filters
**Authentication:** JWT Bearer Token (required)

**Query Parameters:**
- `status`: Filter by status (optional, enum: pending, in_progress, completed)
- `priority`: Filter by priority (optional, enum: low, medium, high)
- `due_date_before`: Filter tasks due before date (optional, ISO8601)
- `due_date_after`: Filter tasks due after date (optional, ISO8601)
- `search`: Search in title and description (optional, full-text)
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 20, max: 100)
- `sort`: Sort field (optional, default: created_at, enum: created_at, due_date, priority)
- `order`: Sort order (optional, default: desc, enum: asc, desc)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "due_date": "ISO8601 | null",
      "status": "string",
      "priority": "string",
      "user_id": "uuid",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "meta": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "has_next": "boolean"
  }
}
```

**Error Responses:**
- 401: Invalid or expired JWT token

#### GET /api/v1/tasks/{task_id}
**Description:** Get specific task by ID
**Authentication:** JWT Bearer Token (required)

**Path Parameters:**
- `task_id`: UUID of the task to retrieve

**Response (200):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "due_date": "ISO8601 | null",
  "status": "string",
  "priority": "string",
  "user_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 401: Invalid or expired JWT token
- 403: User doesn't own the task
- 404: Task not found

#### PUT /api/v1/tasks/{task_id}
**Description:** Update entire task (full replacement)
**Authentication:** JWT Bearer Token (required)

**Path Parameters:**
- `task_id`: UUID of the task to update

**Request:**
```json
{
  "title": "string | required | 1-200 chars",
  "description": "string | optional | max 1000 chars",
  "due_date": "ISO8601 | optional",
  "status": "enum | required | [pending, in_progress, completed]",
  "priority": "enum | required | [low, medium, high]"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "due_date": "ISO8601 | null",
  "status": "string",
  "priority": "string",
  "user_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 400: Validation errors
- 401: Invalid or expired JWT token
- 403: User doesn't own the task
- 404: Task not found
- 422: Unprocessable entity (malformed request)

#### PATCH /api/v1/tasks/{task_id}
**Description:** Update specific fields of a task (partial update)
**Authentication:** JWT Bearer Token (required)

**Path Parameters:**
- `task_id`: UUID of the task to update

**Request:**
```json
{
  "title": "string | optional | 1-200 chars",
  "description": "string | optional | max 1000 chars",
  "due_date": "ISO8601 | optional",
  "status": "enum | optional | [pending, in_progress, completed]",
  "priority": "enum | optional | [low, medium, high]"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "due_date": "ISO8601 | null",
  "status": "string",
  "priority": "string",
  "user_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 400: Validation errors
- 401: Invalid or expired JWT token
- 403: User doesn't own the task
- 404: Task not found
- 422: Unprocessable entity (malformed request)

#### DELETE /api/v1/tasks/{task_id}
**Description:** Delete a task by ID
**Authentication:** JWT Bearer Token (required)

**Path Parameters:**
- `task_id`: UUID of the task to delete

**Response (204):**
```json
{}
```

**Error Responses:**
- 401: Invalid or expired JWT token
- 403: User doesn't own the task
- 404: Task not found

## Database Models

### Task
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary identifier |
| user_id | UUID | FK users.id, NOT NULL, INDEX | Task owner |
| title | VARCHAR(200) | NOT NULL | Task title (1-200 chars) |
| description | TEXT | NULL | Task details (max 1000 chars) |
| due_date | TIMESTAMPTZ | NULL, INDEX | When task is due |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | Task state |
| priority | VARCHAR(10) | NOT NULL, DEFAULT 'medium', CHECK | Task priority |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW(), INDEX | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

## Business Rules
1. Tasks are owned by specific users and can only be accessed by the owner
2. Title length must be between 1 and 200 characters
3. Description length must not exceed 1000 characters
4. Status must be one of: pending, in_progress, completed
5. Priority must be one of: low, medium, high
6. All queries must filter by user_id from JWT claims

## Non-Functional Requirements
- **Performance:** CRUD operations under 200ms
- **Security:** User isolation enforced at database and application layers
- **Scalability:** Proper indexing supports large datasets

## Dependencies
- Authentication system for user identification
- Database connection for task storage
- User model for ownership validation

## Out of Scope
- Task sharing between users
- Collaborative task management
- Advanced scheduling features
- File attachments to tasks