# Feature Specification: In-Memory Console Todo App (Phase I)

**Feature Branch**: `001-console-todo-app`
**Created**: 2025-12-12
**Status**: Draft
**Input**: User description: "In-Memory Console Todo App Phase I"

## User Scenarios & Testing

### User Story 1 - Add and View Tasks (Priority: P1)

A user can add new tasks with titles and optional descriptions, then view all tasks in a formatted list.

**Why this priority**: Core functionality that delivers immediate value - users can start tracking tasks immediately. This is the minimum viable product.

**Independent Test**: Can be fully tested by adding tasks and listing them, delivering basic task tracking value.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** user selects "add" command and enters a title, **Then** task is created with auto-incrementing ID and confirmation is shown
2. **Given** tasks exist in the list, **When** user selects "list" command, **Then** all tasks are displayed in a table with ID, title, description (truncated), and status
3. **Given** no tasks exist, **When** user selects "list" command, **Then** message "No tasks yet." is displayed
4. **Given** user attempts to add task, **When** title is empty, **Then** error message "Title is required." is shown

---

### User Story 2 - Mark Tasks Complete (Priority: P2)

A user can mark tasks as complete or incomplete to track progress.

**Why this priority**: Essential for task management but depends on P1 functionality. Adds task completion tracking.

**Independent Test**: Can be tested by adding tasks (P1), then marking them complete/incomplete and verifying status changes in list view.

**Acceptance Scenarios**:

1. **Given** a task exists with ID X, **When** user enters "complete X", **Then** task status changes to "Completed" and confirmation is shown
2. **Given** a completed task exists with ID X, **When** user enters "uncomplete X", **Then** task status changes to "Pending"
3. **Given** user enters complete command with invalid ID, **When** command is processed, **Then** error "Task not found." is displayed

---

### User Story 3 - Update Task Details (Priority: P3)

A user can modify the title or description of existing tasks.

**Why this priority**: Useful enhancement but not critical for basic task tracking. Users can work around by deleting and re-adding.

**Independent Test**: Can be tested by adding a task (P1), then updating its fields and verifying changes in list view.

**Acceptance Scenarios**:

1. **Given** a task exists with ID X, **When** user enters "update X" and provides new title, **Then** task title is updated
2. **Given** a task exists with ID X, **When** user enters "update X" and provides new description, **Then** task description is updated
3. **Given** a task exists with ID X, **When** user enters "update X" and leaves fields blank, **Then** existing values are preserved
4. **Given** user enters update command with invalid ID, **When** command is processed, **Then** error "Task not found." is displayed

---

### User Story 4 - Delete Tasks (Priority: P3)

A user can permanently remove tasks from the list.

**Why this priority**: Nice to have for cleanup, but not essential for basic task tracking in Phase I.

**Independent Test**: Can be tested by adding tasks (P1), deleting specific ones, and verifying they're removed from list view.

**Acceptance Scenarios**:

1. **Given** a task exists with ID X, **When** user enters "delete X", **Then** task is removed and confirmation "Task deleted." is shown
2. **Given** user enters delete command with invalid ID, **When** command is processed, **Then** error "Task not found." is displayed

---

### User Story 5 - Exit Application (Priority: P1)

A user can gracefully exit the application.

**Why this priority**: Critical for usability - users need a clear way to quit the application.

**Independent Test**: Can be tested by running the app and using quit commands to verify graceful exit.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** user enters "quit" or "q", **Then** application displays "Goodbye!" and exits
2. **Given** the application is running, **When** user presses Ctrl+C, **Then** application handles KeyboardInterrupt and exits gracefully

---

### Edge Cases

- What happens when user enters empty command? (Default action: list tasks)
- What happens when title exceeds 200 characters? (Validation error)
- What happens when description is very long? (Truncated in list view to 30 chars)
- What happens when user enters unrecognized command? (Error message with available commands)
- What happens when task ID is non-numeric? (Validation error or command parsing error)
- What happens when multiple spaces or mixed case in commands? (Should handle gracefully with input parsing)

## Requirements

### Functional Requirements

- **FR-001**: System MUST store tasks in memory as a list of dictionaries
- **FR-002**: System MUST auto-generate unique, incrementing integer IDs for tasks starting from 1
- **FR-003**: System MUST validate task titles are non-empty and 1-200 characters
- **FR-004**: System MUST support optional task descriptions with no length limit (truncated in display)
- **FR-005**: System MUST track task completion status as boolean (completed/not completed)
- **FR-006**: System MUST support commands: add, list, update, delete, complete, uncomplete, quit, q
- **FR-007**: System MUST display tasks in formatted table with ID, title, description (truncated to 30 chars), and status
- **FR-008**: System MUST handle invalid commands with clear error messages
- **FR-009**: System MUST handle invalid task IDs with "Task not found." message
- **FR-010**: System MUST handle KeyboardInterrupt (Ctrl+C) gracefully
- **FR-011**: System MUST run with command: `python src/todo.py`
- **FR-012**: System MUST use only Python standard library (no external dependencies)

### Key Entities

- **Task**: Represents a todo item with unique ID (int), title (str, required), description (str, optional), completed status (bool, default False)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a task in under 10 seconds with 2 prompts (title, description)
- **SC-002**: All tasks are displayed immediately when list command is issued (< 1 second for up to 100 tasks)
- **SC-003**: Users can update or delete any task by ID without errors when ID is valid
- **SC-004**: Application handles all error conditions (invalid commands, missing IDs, empty titles) without crashing
- **SC-005**: Application provides clear feedback for every user action (confirmations, errors, status changes)
- **SC-006**: Users can quit the application gracefully using quit, q, or Ctrl+C commands
- **SC-007**: Code follows PEP 8 style guide and uses type hints for all functions
- **SC-008**: All core functions are pure and testable (separate from I/O)

## Assumptions

- Python 3.8+ is installed on user's system
- User is comfortable with command-line interfaces
- Single user session (no concurrent access)
- No data persistence between sessions (acceptable for Phase I)
- Console supports standard input/output
- Task IDs never need to be reused or compacted after deletions

## Out of Scope

- Data persistence (saving/loading tasks from disk)
- Multi-user support or concurrency
- Authentication or authorization
- Task categories, tags, or priorities
- Due dates or reminders
- Task sorting or filtering
- Undo/redo functionality
- Search functionality
- Task dependencies or subtasks
- Export/import functionality
- GUI or web interface
