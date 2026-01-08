# REST API Endpoint Specification

## Base URL
```
https://api.taskmanagementapp.com/v1
```
*Note: In development, this will be `http://localhost:8000`*

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
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
  "error": "Error message",
  "details": "Optional error details"
}
```

## Authentication Endpoints

### User Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string (min 8 chars)",
    "name": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "created_at": "datetime"
      },
      "token": "string"
    },
    "message": "User registered successfully"
  }
  ```
- **Status Codes**:
  - 201: Created
  - 400: Invalid input
  - 409: User already exists

### User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and return JWT
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string",
        "name": "string"
      },
      "token": "string"
    },
    "message": "Login successful"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 400: Invalid credentials
  - 401: Unauthorized

### User Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Logout user and invalidate session
- **Authentication**: Required
- **Request Body**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Unauthorized

### Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Refresh expired JWT
- **Authentication**: Required (refresh token in body or header)
- **Request Body**:
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "string"
    },
    "message": "Token refreshed successfully"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Invalid refresh token

### Get Current User
- **Endpoint**: `GET /auth/me`
- **Description**: Get current authenticated user's information
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "email": "string",
      "name": "string",
      "created_at": "datetime"
    }
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Unauthorized

## Task Management Endpoints

### Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task for the authenticated user
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "priority": "string (low|medium|high)",
    "due_date": "datetime (optional)",
    "status": "string (pending|in_progress|completed)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "due_date": "datetime",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "message": "Task created successfully"
  }
  ```
- **Status Codes**:
  - 201: Created
  - 400: Invalid input
  - 401: Unauthorized

### Get All Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Get all tasks for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by task status
  - `priority`: Filter by task priority
  - `limit`: Number of tasks to return (default: 20, max: 100)
  - `offset`: Offset for pagination (default: 0)
  - `sort`: Sort field (created_at, due_date, priority) and direction (asc, desc)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "string",
          "user_id": "string",
          "title": "string",
          "description": "string",
          "priority": "string",
          "due_date": "datetime",
          "status": "string",
          "created_at": "datetime",
          "updated_at": "datetime"
        }
      ],
      "pagination": {
        "total": "number",
        "limit": "number",
        "offset": "number",
        "has_more": "boolean"
      }
    }
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Unauthorized

### Get Single Task
- **Endpoint**: `GET /tasks/{task_id}`
- **Description**: Get a specific task for the authenticated user
- **Authentication**: Required
- **Path Parameter**: `task_id` - The ID of the task to retrieve
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "due_date": "datetime",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Unauthorized
  - 403: Task doesn't belong to user
  - 404: Task not found

### Update Task
- **Endpoint**: `PUT /tasks/{task_id}`
- **Description**: Update a specific task for the authenticated user
- **Authentication**: Required
- **Path Parameter**: `task_id` - The ID of the task to update
- **Request Body**: Same as create task, but all fields optional
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "due_date": "datetime",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "message": "Task updated successfully"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 400: Invalid input
  - 401: Unauthorized
  - 403: Task doesn't belong to user
  - 404: Task not found

### Patch Task
- **Endpoint**: `PATCH /tasks/{task_id}`
- **Description**: Partially update a specific task for the authenticated user
- **Authentication**: Required
- **Path Parameter**: `task_id` - The ID of the task to update
- **Request Body**: Only the fields to update
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "due_date": "datetime",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "message": "Task updated successfully"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 400: Invalid input
  - 401: Unauthorized
  - 403: Task doesn't belong to user
  - 404: Task not found

### Delete Task
- **Endpoint**: `DELETE /tasks/{task_id}`
- **Description**: Delete a specific task for the authenticated user
- **Authentication**: Required
- **Path Parameter**: `task_id` - The ID of the task to delete
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```
- **Status Codes**:
  - 200: OK
  - 401: Unauthorized
  - 403: Task doesn't belong to user
  - 404: Task not found

## Health Check Endpoint

### Health Check
- **Endpoint**: `GET /health`
- **Description**: Check the health status of the API
- **Authentication**: Not required
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "datetime",
    "version": "string"
  }
  ```
- **Status Codes**:
  - 200: OK

## Error Codes

### HTTP Status Codes
- **200**: OK - Request successful
- **201**: Created - Resource created successfully
- **204**: No Content - Request successful, no content to return
- **400**: Bad Request - Invalid request parameters
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **422**: Unprocessable Entity - Validation error
- **500**: Internal Server Error - Server error

### Error Messages
- **INVALID_INPUT**: Request body contains invalid data
- **UNAUTHORIZED**: Missing or invalid authentication
- **FORBIDDEN**: User not authorized for this action
- **NOT_FOUND**: Requested resource not found
- **CONFLICT**: Resource conflict (e.g., duplicate email)
- **SERVER_ERROR**: Internal server error

## Rate Limiting
All endpoints are subject to rate limiting:
- **Authenticated endpoints**: 100 requests per hour per user
- **Unauthenticated endpoints**: 10 requests per hour per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

## Pagination
All list endpoints support pagination:
- **Default limit**: 20 items per page
- **Maximum limit**: 100 items per page
- **Offset-based**: Use `offset` and `limit` parameters
- **Response includes**: Total count and pagination metadata

## Filtering and Sorting
List endpoints support:
- **Filtering**: By field values (status, priority, etc.)
- **Sorting**: By field name with direction (asc/desc)
- **Multiple filters**: Combined with AND logic
- **Default sort**: By creation date, descending