# API Specification: REST Endpoints

## Overview
Complete REST API specification for the Todo Web App with authentication, task management, and user management endpoints. All endpoints follow RESTful conventions with proper HTTP status codes and JSON responses.

## Authentication Endpoints

### POST /api/v1/auth/register
**Description:** Register a new user account
**Authentication:** Public

**Request:**
```json
{
  "email": "string | required | valid email format",
  "password": "string | required | min 8 chars, includes uppercase, lowercase, number, special char",
  "first_name": "string | optional | max 50 chars",
  "last_name": "string | optional | max 50 chars"
}
```

**Response (201):**
```json
{
  "access_token": "string | JWT token with user claims",
  "token_type": "string | 'bearer'",
  "expires_in": "integer | seconds until token expiration",
  "user": {
    "id": "uuid",
    "email": "string",
    "first_name": "string | null",
    "last_name": "string | null",
    "created_at": "ISO8601"
  }
}
```

**Error Responses:**
- 400: Validation errors (invalid email format, weak password, duplicate email)
- 422: Unprocessable entity

### POST /api/v1/auth/login
**Description:** Authenticate user and return JWT tokens
**Authentication:** Public

**Request:**
```json
{
  "email": "string | required | valid email format",
  "password": "string | required"
}
```

**Response (200):**
```json
{
  "access_token": "string | JWT access token",
  "refresh_token": "string | JWT refresh token",
  "token_type": "string | 'bearer'",
  "expires_in": "integer | seconds until access token expiration",
  "user": {
    "id": "uuid",
    "email": "string",
    "first_name": "string | null",
    "last_name": "string | null"
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 422: Unprocessable entity

### POST /api/v1/auth/logout
**Description:** Invalidate current session
**Authentication:** JWT Bearer Token

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "message": "string | 'Successfully logged out'"
}
```

**Error Responses:**
- 401: Invalid or expired token
- 403: Insufficient permissions

### POST /api/v1/auth/refresh
**Description:** Refresh expired access token using refresh token
**Authentication:** Refresh token in request body

**Request:**
```json
{
  "refresh_token": "string | required | valid refresh token"
}
```

**Response (200):**
```json
{
  "access_token": "string | new JWT access token",
  "token_type": "string | 'bearer'",
  "expires_in": "integer | seconds until token expiration"
}
```

**Error Responses:**
- 401: Invalid or expired refresh token
- 422: Unprocessable entity

## Task Management Endpoints

### POST /api/v1/tasks
**Description:** Create a new task
**Authentication:** JWT Bearer Token

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
- 400: Validation errors
- 401: Invalid or expired JWT token
- 422: Unprocessable entity

### GET /api/v1/tasks
**Description:** List tasks for authenticated user with optional filters
**Authentication:** JWT Bearer Token

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

### GET /api/v1/tasks/{task_id}
**Description:** Get specific task by ID
**Authentication:** JWT Bearer Token

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

### PUT /api/v1/tasks/{task_id}
**Description:** Update entire task (full replacement)
**Authentication:** JWT Bearer Token

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
- 422: Unprocessable entity

### PATCH /api/v1/tasks/{task_id}
**Description:** Update specific fields of a task (partial update)
**Authentication:** JWT Bearer Token

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
- 422: Unprocessable entity

### DELETE /api/v1/tasks/{task_id}
**Description:** Delete a task by ID
**Authentication:** JWT Bearer Token

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

## User Management Endpoints

### GET /api/v1/users/me
**Description:** Get current authenticated user profile
**Authentication:** JWT Bearer Token

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "first_name": "string | null",
  "last_name": "string | null",
  "is_active": "boolean",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 401: Invalid or expired JWT token

### PUT /api/v1/users/me
**Description:** Update current user profile
**Authentication:** JWT Bearer Token

**Request:**
```json
{
  "first_name": "string | optional | max 50 chars",
  "last_name": "string | optional | max 50 chars"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "first_name": "string | null",
  "last_name": "string | null",
  "is_active": "boolean",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

**Error Responses:**
- 400: Validation errors
- 401: Invalid or expired JWT token
- 422: Unprocessable entity

### GET /api/v1/users/me/tasks/stats
**Description:** Get task statistics for current user
**Authentication:** JWT Bearer Token

**Response (200):**
```json
{
  "total_tasks": "integer",
  "pending_tasks": "integer",
  "in_progress_tasks": "integer",
  "completed_tasks": "integer",
  "overdue_tasks": "integer",
  "high_priority_tasks": "integer"
}
```

**Error Responses:**
- 401: Invalid or expired JWT token

## Common Error Response Format

### 400 Bad Request
```json
{
  "detail": "string | error message",
  "errors": [
    {
      "field": "string | field name",
      "message": "string | validation error message"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "string | 'Not authenticated'"
}
```

### 403 Forbidden
```json
{
  "detail": "string | 'Access forbidden'"
}
```

### 404 Not Found
```json
{
  "detail": "string | 'Resource not found'"
}
```

### 500 Internal Server Error
```json
{
  "detail": "string | 'An unexpected error occurred'"
}
```

## API Standards

### HTTP Status Codes
- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 409: Conflict (resource conflict, e.g., duplicate email)
- 422: Unprocessable Entity (malformed request)
- 500: Internal Server Error (unexpected error)

### Request/Response Format
- All requests/responses use JSON format
- Dates use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- UUIDs use standard format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- All text fields use UTF-8 encoding

### Authentication
- All protected endpoints require JWT in Authorization header
- Header format: `Authorization: Bearer <jwt-token>`
- Token validation includes signature, expiration, and claims verification
- User identity extracted from `user_id` claim in JWT

### Pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Query parameters: `page`, `limit`
- Response includes metadata: `total`, `page`, `limit`, `has_next`

### Filtering
- Query parameters follow REST conventions
- Date filters: `field_before`, `field_after`
- Status filters: `status=enum_value`
- Range filters: `min_field`, `max_field`

### Sorting
- Query parameters: `sort` (field name), `order` (asc/desc)
- Default sort: created_at descending
- Multiple sorts not supported