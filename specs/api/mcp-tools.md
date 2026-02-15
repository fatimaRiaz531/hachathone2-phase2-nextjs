# API / MCP Tools — Phase III

This document defines the MCP tools the Agent can call to manipulate tasks. Each tool is implemented by the backend as an internal MCP endpoint (REST) and exposed to the Agents/ChatKit through the MCP SDK.

General rules

- All MCP tool endpoints require authentication (Bearer token). See `auth_scopes` per tool below.
- Where applicable mutating endpoints accept `client_request_id` (string, optional) for idempotency.
- All times use ISO 8601 in UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- Error responses follow the shape: `{ "error": { "code": "<ERROR_CODE>", "message": "Human readable", "details": {...} } }`.
- Rate limits: default per-user limits included per tool. Backend may implement global safeguards.

Tools summary

- add_task
- list_tasks
- complete_task
- update_task
- delete_task

---

## Tool: add_task

- Purpose: Create a new task for the authenticated user.

- Endpoint (internal MCP REST):
  - POST /mcp/tools/add_task

- Params (JSON body):

```json
{
  "title": "string", // required, short title
  "description": "string|null", // optional
  "due_date": "string|null", // optional, ISO 8601 UTC
  "priority": "string|null", // optional, e.g., "low" | "medium" | "high"
  "tags": ["string"], // optional
  "client_request_id": "string" // optional, idempotency key
}
```

- Returns (201 Created):

```json
{
  "task": {
    "id": 1234,
    "title": "string",
    "description": "string|null",
    "status": "open", // "open" | "completed" | "deleted"
    "due_date": "string|null",
    "priority": "low|medium|high|null",
    "created_at": "string",
    "updated_at": "string",
    "owner_id": 42
  }
}
```

- Error codes
  - TASK_INVALID_INPUT — 400
  - TASK_IDEMPOTENCY_CONFLICT — 409 (client_request_id used, but conflicting)
  - AUTH_REQUIRED — 401
  - RATE_LIMIT_EXCEEDED — 429
  - INTERNAL_ERROR — 500

- Rate Limits: 60 requests / minute per user (burstable)
- Auth Scopes: `tasks:write`

- Example Request (MCP JSON payload from Agent):

```json
{
  "tool": "add_task",
  "input": {
    "title": "Call Ana about report",
    "description": "Discuss Q1 metrics",
    "due_date": "2026-02-09T09:00:00Z",
    "priority": "high",
    "client_request_id": "req-20260208-abc123"
  }
}
```

- Example Response:

```json
HTTP/1.1 201 Created
{
  "task": {
    "id": 9876,
    "title": "Call Ana about report",
    "status": "open",
    "due_date": "2026-02-09T09:00:00Z",
    "priority": "high",
    "created_at": "2026-02-08T15:02:00Z",
    "owner_id": 42
  }
}
```

Mapping to public REST endpoint (for client examples)

- Client-friendly REST: POST /api/tasks -> proxies to /mcp/tools/add_task with auth and transformation.

---

## Tool: list_tasks

- Purpose: Query tasks for the authenticated user with optional filters and pagination.

- Endpoint: POST /mcp/tools/list_tasks

- Params (JSON body):

```json
{
  "status": "string|null", // "open" | "completed" | "deleted" or null for any
  "priority": "low|medium|high|null",
  "due_before": "string|null", // ISO 8601
  "due_after": "string|null", // ISO 8601
  "tags": ["string"],
  "limit": 10,
  "offset": 0,
  "order_by": "due_date|created_at|priority|null"
}
```

- Returns (200):

```json
{
  "tasks": [ { <task-object> }, ... ],
  "meta": { "limit": 10, "offset": 0, "total": 42 }
}
```

- Error codes
  - AUTH_REQUIRED — 401
  - INVALID_FILTERS — 400
  - RATE_LIMIT_EXCEEDED — 429
  - INTERNAL_ERROR — 500

- Rate Limits: 120 requests / minute per user
- Auth Scopes: `tasks:read`

- Example Request (from Agent):

```json
{
  "tool": "list_tasks",
  "input": {
    "status": "open",
    "due_before": "2026-02-15T00:00:00Z",
    "limit": 5
  }
}
```

- Example Response:

```json
HTTP/1.1 200 OK
{
  "tasks": [
    { "id": 111, "title": "File taxes", "status": "open", "due_date": "2026-02-14T12:00:00Z", "priority": "high" },
    { "id": 112, "title": "Buy groceries", "status": "open", "due_date": "2026-02-10T18:00:00Z", "priority": "medium" }
  ],
  "meta": { "limit": 5, "offset": 0, "total": 2 }
}
```

Mapping to client REST example: GET /api/tasks?status=open&due_before=2026-02-15T00:00:00Z

---

## Tool: complete_task

- Purpose: Mark a task as completed.

- Endpoint: POST /mcp/tools/complete_task

- Params (JSON body):

```json
{
  "task_id": 1234, // required
  "client_request_id": "string" // optional idempotency key
}
```

- Returns (200):

```json
{
  "task": {
    "id": 1234,
    "status": "completed",
    "completed_at": "2026-02-08T15:10:00Z"
  }
}
```

- Error codes
  - TASK_NOT_FOUND — 404
  - TASK_ALREADY_COMPLETED — 409
  - AUTH_REQUIRED — 401
  - RATE_LIMIT_EXCEEDED — 429
  - INTERNAL_ERROR — 500

- Rate Limits: 60 requests / minute per user
- Auth Scopes: `tasks:write`

- Example Request (Agent payload):

```json
{
  "tool": "complete_task",
  "input": { "task_id": 9876, "client_request_id": "req-20260208-complete-1" }
}
```

- Example Response:

```json
HTTP/1.1 200 OK
{ "task": { "id": 9876, "status": "completed", "completed_at": "2026-02-08T15:12:45Z" } }
```

Idempotency note: If `client_request_id` reused, return the prior result rather than create duplicate state transitions.

---

## Tool: update_task

- Purpose: Update mutable fields of a task (title, description, due_date, priority, tags).

- Endpoint: PATCH /mcp/tools/update_task

- Params (JSON body):

```json
{
  "task_id": 1234, // required
  "title": "string|null",
  "description": "string|null",
  "due_date": "string|null",
  "priority": "low|medium|high|null",
  "tags": ["string"],
  "client_request_id": "string"
}
```

- Returns (200):

```json
{ "task": { <full-task-object> } }
```

- Error codes
  - TASK_NOT_FOUND — 404
  - VALIDATION_ERROR — 400
  - AUTH_REQUIRED — 401
  - RATE_LIMIT_EXCEEDED — 429
  - INTERNAL_ERROR — 500

- Rate Limits: 60 requests / minute per user
- Auth Scopes: `tasks:write`

- Example Request:

```json
{
  "tool": "update_task",
  "input": {
    "task_id": 9876,
    "title": "Call Ana (rescheduled)",
    "due_date": "2026-02-10T10:00:00Z"
  }
}
```

- Example Response:

```json
HTTP/1.1 200 OK
{ "task": { "id": 9876, "title": "Call Ana (rescheduled)", "due_date": "2026-02-10T10:00:00Z", "status": "open" } }
```

---

## Tool: delete_task

- Purpose: Soft-delete a task. Destructive deletion requires explicit confirmation from user flow; backend implements soft-delete by default.

- Endpoint: DELETE /mcp/tools/delete_task

- Params (JSON body):

```json
{ "task_id": 1234, "permanent": false, "client_request_id": "string" }
```

- Returns (200):

```json
{
  "task": {
    "id": 1234,
    "status": "deleted",
    "deleted_at": "2026-02-08T15:20:00Z"
  }
}
```

- Error codes
  - TASK_NOT_FOUND — 404
  - AUTH_REQUIRED — 401
  - RATE_LIMIT_EXCEEDED — 429
  - INTERNAL_ERROR — 500

- Rate Limits: 30 requests / minute per user (lower due to destructive nature)
- Auth Scopes: `tasks:write`, `tasks:delete`

- Example Request:

```json
{
  "tool": "delete_task",
  "input": {
    "task_id": 7777,
    "permanent": false,
    "client_request_id": "req-20260208-delete-7777"
  }
}
```

- Example Response:

```json
HTTP/1.1 200 OK
{ "task": { "id": 7777, "status": "deleted", "deleted_at": "2026-02-08T15:22:18Z" } }
```

Destructive permanent deletion (`permanent: true`) should only be allowed when the authenticated user has `tasks:admin` scope or through a separate admin flow.

---

## MCP Tool Invocation Examples from Agent to Backend (JSON)

- Agent calling `add_task` via MCP SDK -> backend receives standardized JSON payload (tool name + input):

```json
{
  "tool": "add_task",
  "input": {
    "title": "Finish project report",
    "due_date": "2026-02-12T09:00:00Z",
    "priority": "high",
    "client_request_id": "req-20260208-xyz"
  },
  "meta": { "conversation_id": "conv-123", "agent_run_id": "run-abc" }
}
```

- Backend REST mapping examples (client -> public API):
  - POST /api/tasks -> proxied to /mcp/tools/add_task
  - GET /api/tasks -> proxied to /mcp/tools/list_tasks
  - PATCH /api/tasks/{id} -> proxied to /mcp/tools/update_task
  - POST /api/tasks/{id}/complete -> proxied to /mcp/tools/complete_task
  - DELETE /api/tasks/{id} -> proxied to /mcp/tools/delete_task

---

## Auth Scopes Quick Reference

- `tasks:read` — list/query tasks
- `tasks:write` — create/update/complete tasks
- `tasks:delete` — soft-delete tasks
- `tasks:admin` — permanent deletion or bulk admin operations

---

## Rate Limiting Strategy (engineer guidance)

- Per-user rate limiting using token bucket algorithm.
- Tool-specific default limits as defined above. Admin endpoints have stricter throttles.
- Provide `Retry-After` header on 429 responses.

---

## Error Handling and Observability

- Log all tool invocations with `conversation_id`, `agent_run_id`, `client_request_id`, and result.
- Persist tool call inputs and outputs in the `Message` model with a `message_type` of `tool_call` and `tool_response` as part of the payload for troubleshooting.
- Surface concise error strings to the Agent; let the Agent choose user-facing phrasing.

---

End of MCP Tools spec.

# API Specification: MCP Tools (Phase III)

## 1. Overview

This document defines the Model Context Protocol (MCP) tools exposed to the AI agent. These tools provide the interface between the LLM and the backend logic.

## 2. Tools

### 2.1 `add_task`

- **Description**: Creates a new task for the current user.
- **Parameters**:
  - `title` (string, required): The title of the task.
  - `description` (string, optional): Detailed desciption.
  - `priority` (string, optional): "low", "medium", or "high".
- **Returns**: JSON object of the created task.

### 2.2 `list_tasks`

- **Description**: Retrieves a list of tasks, optionally filtered.
- **Parameters**:
  - `status` (string, optional): Filter by "pending" or "completed".
  - `limit` (int, optional): Max number of tasks to return (default: 10).
- **Returns**: JSON list of task objects.

### 2.3 `complete_task`

- **Description**: Marks a specific task as completed.
- **Parameters**:
  - `task_id` (string, optional): ID of the task.
  - `task_title_search` (string, optional): Fuzzy search string to identify task if ID is unknown.
- **Returns**: JSON object of the updated task.

### 2.4 `delete_task`

- **Description**: Permanently removes a task.
- **Parameters**:
  - `task_id` (string, optional): ID of the task.
  - `task_title_search` (string, optional): Fuzzy search to identify task.
- **Returns**: Success message or error.

### 2.5 `update_task`

- **Description**: Modifies an existing task.
- **Parameters**:
  - `task_id` (string, required): ID of the task.
  - `title` (string, optional)
  - `description` (string, optional)
  - `priority` (string, optional)
- **Returns**: JSON object of the updated task.

## 3. Implementation Constraints

- All tools must verify user ownership (`user_id`).
- Tools must operate within the user's database session scope.
