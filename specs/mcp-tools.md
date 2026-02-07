# MCP Tools Specification

## Overview
Stateless MCP server exposing tools for task management. Built using the Official MCP SDK.

## Tools

### `add_task`
- **Arguments**: 
  - `user_id` (string): Unique identifier for the user.
  - `title` (string): Title of the task.
  - `description` (string, optional): Detailed description of the task.
- **Action**: Creates a new task in the database for the specified user.
- **Returns**: Confirmation message with task details.

### `list_tasks`
- **Arguments**:
  - `user_id` (string): Unique identifier for the user.
  - `status` (string, optional): Filter by "pending" or "completed".
- **Action**: Retrieves tasks filtered by status.
- **Returns**: Formatted list of tasks or "No tasks found".

### `complete_task`
- **Arguments**:
  - `user_id` (string): Unique identifier for the user.
  - `task_id` (string): ID of the task to complete (supports partial matches).
- **Action**: Marks the specified task as completed.
- **Returns**: Confirmation message or error if not found.

### `delete_task`
- **Arguments**:
  - `user_id` (string): Unique identifier for the user.
  - `task_id` (string): ID of the task to delete (supports partial matches).
- **Action**: Removes the specified task from the database.
- **Returns**: Confirmation message or error if not found.

### `update_task`
- **Arguments**:
  - `user_id` (string): Unique identifier for the user.
  - `task_id` (string): ID of the task to update (supports partial matches).
  - `title` (string, optional): New title for the task.
  - `description` (string, optional): New description for the task.
- **Action**: Updates specific fields of the task.
- **Returns**: Confirmation message or error if not found.

## Implementation Details
- Uses Official Python `mcp` SDK (`FastMCP`).
- Stateless design (requires `user_id` for every call).
- Direct DB access via SQLModel for efficiency.

