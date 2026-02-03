# Feature Specification: In-Memory Console Todo App (Phase I)

## User Stories
- As a user, I can add a new task with a title and optional description.
- As a user, I can see a numbered list of all my tasks with their status.
- As a user, I can update the title or description of any task.
- As a user, I can delete any task by its ID.
- As a user, I can mark any task as complete or incomplete.
- As a user, I can quit the application.

## Acceptance Criteria

### 1. Add Task
- Command: `add`
- Prompt: "Enter task title: " then "Enter description (optional): "
- Title is required (1–200 chars). If empty, show error.
- Description is optional.
- Task gets auto-incrementing ID starting from 1.
- Task is added to in-memory list.
- Confirmation message: "Task added: [title] (ID: X)"

### 2. List Tasks
- Command: `list` or empty input (default action)
- Shows all tasks in a clean table format:
  ID | Title                  | Description (truncated) | Status
  1  | Buy groceries          | Milk, eggs, bread       | Pending
  2  | Finish report          |                         | Completed
- Status shows "Pending" or "Completed"
- If no tasks: "No tasks yet."

### 3. Update Task
- Command: `update <id>`
- Prompt: "New title (leave blank to keep): " then "New description (leave blank to keep): "
- If task ID not found: "Task not found."
- Only update fields that are provided.

### 4. Delete Task
- Command: `delete <id>`
- If ID exists: remove task and show "Task deleted."
- If not: "Task not found."

### 5. Mark Complete/Incomplete
- Command: `complete <id>` or `uncomplete <id>`
- Toggles the completed flag.
- Confirmation: "Task marked as [Completed/Pending]"

### 6. Quit
- Command: `quit` or `q` or Ctrl+C
- Graceful exit with "Goodbye!"

## Error Handling
- Invalid command → "Unknown command. Try: add, list, update, delete, complete, quit"
- Invalid ID → "Task not found."
- Empty title → "Title is required."

## Non-Functional Requirements
- Application must run with: python src/todo.py
- No external packages
- Code must be organized into clear functions (e.g., add_task, list_tasks, etc.)
- Main loop should be clean and easy to follow