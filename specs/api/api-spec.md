# Phase-II API Specification: Full-Stack Todo Web Application

## Overview
This document specifies the API contract for Phase-II of the Evolution of Todo project: a full-stack multi-user web application with authentication. The API follows REST principles and uses JWT tokens for authentication. All endpoints (except authentication endpoints) require a valid JWT token in the Authorization header.

## API Base URL
```
https://your-domain.com/api
```

## Authentication
All API endpoints (except authentication endpoints) require JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Endpoints

### Authentication Endpoints

#### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password",
    "name": "User Name"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user_id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "token": "jwt_token"
    },
    "message": "User registered successfully"
  }
  ```

#### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and return JWT token
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user_id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "token": "jwt_token"
    },
    "message": "Login successful"
  }
  ```

#### 3. User Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Invalidate user session
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Task Management Endpoints

#### 4. Get All User Tasks
- **Endpoint**: `GET /{user_id}/tasks`
- **Description**: Retrieve all tasks for the authenticated user
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**: user_id (must match authenticated user)
- **Query Parameters**:
  - `limit` (optional): Number of tasks to return (default: 50, max: 100)
  - `offset` (optional): Number of tasks to skip (default: 0)
  - `status` (optional): Filter by completion status ("completed", "pending", "all")
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": 1,
          "title": "Task title",
          "description": "Task description",
          "completed": false,
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 5,
      "limit": 50,
      "offset": 0
    }
  }
  ```

#### 5. Create New Task
- **Endpoint**: `POST /{user_id}/tasks`
- **Description**: Create a new task for the authenticated user
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**: user_id (must match authenticated user)
- **Request**:
  ```json
  {
    "title": "Task title",
    "description": "Task description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user_id": "user_id"
    },
    "message": "Task created successfully"
  }
  ```

#### 6. Get Specific Task
- **Endpoint**: `GET /{user_id}/tasks/{id}`
- **Description**: Retrieve a specific task for the authenticated user
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**:
  - user_id (must match authenticated user)
  - id (task ID)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user_id": "user_id"
    }
  }
  ```

#### 7. Update Task
- **Endpoint**: `PUT /{user_id}/tasks/{id}`
- **Description**: Update an existing task for the authenticated user
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**:
  - user_id (must match authenticated user)
  - id (task ID)
- **Request**:
  ```json
  {
    "title": "Updated task title",
    "description": "Updated task description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Updated task title",
      "description": "Updated task description",
      "completed": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z",
      "user_id": "user_id"
    },
    "message": "Task updated successfully"
  }
  ```

#### 8. Delete Task
- **Endpoint**: `DELETE /{user_id}/tasks/{id}`
- **Description**: Delete a task for the authenticated user
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**:
  - user_id (must match authenticated user)
  - id (task ID)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

#### 9. Update Task Completion Status
- **Endpoint**: `PATCH /{user_id}/tasks/{id}/complete`
- **Description**: Update the completion status of a task
- **Headers**: Authorization: Bearer <token>
- **Path Parameters**:
  - user_id (must match authenticated user)
  - id (task ID)
- **Request**:
  ```json
  {
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z",
      "user_id": "user_id"
    },
    "message": "Task completion status updated successfully"
  }
  ```

## Data Models

### User Model
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "password_hash": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Task Model
```json
{
  "id": "integer",
  "title": "string (max 255)",
  "description": "string (max 1000)",
  "completed": "boolean",
  "user_id": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Authentication Requirements

### Protected Endpoints
All task management endpoints require:
1. Valid JWT token in Authorization header
2. User ID in token must match user_id in URL path
3. Token must not be expired
4. User account must be active

### Public Endpoints
- `/auth/register`
- `/auth/login`

## Error Codes

### Authentication Errors
- `AUTH_TOKEN_INVALID`: Invalid JWT token
- `AUTH_TOKEN_EXPIRED`: JWT token has expired
- `AUTH_USER_MISMATCH`: User ID in token doesn't match URL
- `AUTH_USER_NOT_FOUND`: User account doesn't exist
- `AUTH_USER_INACTIVE`: User account is inactive

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `MISSING_REQUIRED_FIELD`: Required field is missing
- `INVALID_DATA_TYPE`: Field has incorrect data type
- `FIELD_TOO_LONG`: Field exceeds maximum length

### Task Errors
- `TASK_NOT_FOUND`: Task with given ID doesn't exist
- `TASK_USER_MISMATCH`: Task doesn't belong to user
- `TASK_ALREADY_DELETED`: Task has been deleted

### General Errors
- `INTERNAL_ERROR`: Internal server error
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded

## Rate Limiting
- API endpoints are rate-limited to 100 requests per minute per user
- Exceeding rate limit returns 429 status code with `RATE_LIMIT_EXCEEDED` error

## Security Requirements
1. All API communication must use HTTPS
2. JWT tokens must be stored securely on client-side
3. Passwords must be hashed using bcrypt or similar
4. Input validation must be performed on all endpoints
5. SQL injection prevention through parameterized queries
6. XSS prevention through proper output encoding

## Response Codes
- `200`: Success for GET, PUT, PATCH requests
- `201`: Success for POST requests (resource created)
- `204`: Success for DELETE requests (no content returned)
- `400`: Bad request (validation error)
- `401`: Unauthorized (invalid/missing authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (resource already exists)
- `429`: Rate limit exceeded
- `500`: Internal server error