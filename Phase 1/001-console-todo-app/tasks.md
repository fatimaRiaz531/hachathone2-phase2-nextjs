# Implementation Tasks: In-Memory Console Todo App (Phase I)

**Feature**: 001-console-todo-app
**Branch**: `001-console-todo-app`
**Created**: 2025-12-12
**Status**: Ready for Implementation

## Overview

This document contains the detailed implementation tasks for building the Todo App Phase I. Tasks are ordered by dependency and should be implemented sequentially. Each task includes acceptance criteria and test cases.

## Task Execution Guidelines

- Implement tasks in order (dependencies resolved first)
- Mark task as complete only when all acceptance criteria pass
- Run manual tests after each task
- Ensure PEP 8 compliance before marking complete
- All functions must have type hints and docstrings

---

## T-001: Create the task data structure and add_task function [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 30 minutes
**Dependencies**: None
**Status**: ✅ COMPLETED

### Description

Create the foundational task data structure using Python dictionaries and implement the `add_task()` function to create new tasks with auto-incrementing IDs.

### Implementation Requirements

1. Create `src/todo.py` file
2. Define type aliases:
   ```python
   from typing import TypeAlias

   Task: TypeAlias = dict[str, int | str | bool]
   TaskList: TypeAlias = list[Task]
   ```

3. Implement helper function:
   ```python
   def get_next_id(tasks: TaskList) -> int:
       """Generate the next available task ID."""
       if not tasks:
           return 1
       return max(task['id'] for task in tasks) + 1
   ```

4. Implement validation function:
   ```python
   def validate_title(title: str) -> bool:
       """Validate a task title meets requirements."""
       stripped = title.strip()
       return len(stripped) > 0 and len(title) <= 200
   ```

5. Implement core function:
   ```python
   def add_task(tasks: TaskList, title: str, description: str = "") -> int:
       """Add a new task to the tasks list."""
       # Validate title
       if not validate_title(title):
           if not title.strip():
               raise ValueError("Title is required.")
           raise ValueError("Title must be 1-200 characters.")

       # Generate ID and create task
       task_id = get_next_id(tasks)
       task = {
           'id': task_id,
           'title': title,
           'description': description,
           'completed': False
       }
       tasks.append(task)
       return task_id
   ```

### Acceptance Criteria

- [ ] Type aliases defined for Task and TaskList
- [ ] `get_next_id()` returns 1 for empty list
- [ ] `get_next_id()` returns max+1 for non-empty list
- [ ] `validate_title()` rejects empty strings
- [ ] `validate_title()` rejects titles > 200 characters
- [ ] `validate_title()` accepts valid titles (1-200 chars)
- [ ] `add_task()` creates task with correct structure
- [ ] `add_task()` assigns unique auto-incrementing IDs
- [ ] `add_task()` sets completed to False by default
- [ ] `add_task()` raises ValueError for invalid titles
- [ ] All functions have type hints
- [ ] All functions have docstrings with examples

### Test Cases

```python
# Test 1: Add first task
tasks = []
task_id = add_task(tasks, "Buy milk")
assert task_id == 1
assert len(tasks) == 1
assert tasks[0]['title'] == "Buy milk"
assert tasks[0]['completed'] == False

# Test 2: Add multiple tasks with auto-increment
task_id = add_task(tasks, "Buy eggs", "From organic farm")
assert task_id == 2
assert len(tasks) == 2

# Test 3: Empty title raises error
try:
    add_task(tasks, "")
    assert False, "Should raise ValueError"
except ValueError as e:
    assert str(e) == "Title is required."

# Test 4: Title too long raises error
try:
    add_task(tasks, "x" * 201)
    assert False, "Should raise ValueError"
except ValueError as e:
    assert str(e) == "Title must be 1-200 characters."

# Test 5: IDs don't reuse after deletion
tasks = [{'id': 1, ...}, {'id': 3, ...}]  # ID 2 deleted
new_id = get_next_id(tasks)
assert new_id == 4  # Not 2
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Functions have complete type hints
- Docstrings include Args, Returns, Raises, Examples
- No hardcoded values (use constants if needed)

---

## T-002: Implement list_tasks function with formatted table output [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 45 minutes
**Dependencies**: T-001
**Status**: ✅ COMPLETED

### Description

Implement functions to display all tasks in a formatted ASCII table with proper column alignment and description truncation.

### Implementation Requirements

1. Implement truncation helper:
   ```python
   def truncate_text(text: str, max_length: int) -> str:
       """Truncate text to max_length, adding '...' if truncated."""
       if len(text) <= max_length:
           return text
       return text[:max_length-3] + "..."
   ```

2. Implement table display function:
   ```python
   def print_task_table(tasks: TaskList) -> None:
       """Display all tasks in a formatted table."""
       if not tasks:
           print("No tasks yet.")
           return

       # Print header
       print("ID | Title                  | Description             | Status")
       print("---+------------------------+-------------------------+-----------")

       # Print each task
       for task in tasks:
           task_id = str(task['id']).rjust(2)
           title = task['title'][:24].ljust(24)
           description = truncate_text(task['description'], 27).ljust(27)
           status = "Completed" if task['completed'] else "Pending"
           print(f"{task_id} | {title} | {description} | {status}")
   ```

3. Implement wrapper function:
   ```python
   def list_tasks(tasks: TaskList) -> None:
       """List all tasks (wrapper for print_task_table)."""
       print_task_table(tasks)
   ```

### Acceptance Criteria

- [ ] `truncate_text()` returns original text if <= max_length
- [ ] `truncate_text()` adds "..." when truncating
- [ ] `print_task_table()` prints "No tasks yet." for empty list
- [ ] `print_task_table()` displays header row
- [ ] `print_task_table()` displays separator row
- [ ] `print_task_table()` displays task rows with correct columns
- [ ] Description truncated to 27 characters (30 with "...")
- [ ] Status shows "Pending" or "Completed" correctly
- [ ] ID column right-aligned, others left-aligned
- [ ] `list_tasks()` calls `print_task_table()`
- [ ] All functions have type hints and docstrings

### Test Cases

```python
# Test 1: Empty list displays message
tasks = []
list_tasks(tasks)
# Expected output: "No tasks yet."

# Test 2: Single task displays correctly
tasks = [{'id': 1, 'title': 'Buy milk', 'description': 'From store', 'completed': False}]
list_tasks(tasks)
# Expected output:
# ID | Title                  | Description             | Status
# ---+------------------------+-------------------------+-----------
#  1 | Buy milk               | From store              | Pending

# Test 3: Completed task shows correct status
tasks = [{'id': 1, 'title': 'Buy milk', 'description': '', 'completed': True}]
list_tasks(tasks)
# Status column should show "Completed"

# Test 4: Long description truncates
tasks = [{'id': 1, 'title': 'Test', 'description': 'This is a very long description that exceeds the limit', 'completed': False}]
list_tasks(tasks)
# Description should be "This is a very long desc..."

# Test 5: Multiple tasks display in order
tasks = [
    {'id': 1, 'title': 'Task 1', 'description': '', 'completed': False},
    {'id': 2, 'title': 'Task 2', 'description': '', 'completed': True}
]
list_tasks(tasks)
# Should display both tasks with correct statuses
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Table formatting is clean and aligned
- Empty list case handled gracefully
- Long text truncated properly with "..."

---

## T-003: Implement update_task function [X]

**Priority**: P2 (Important)
**Estimated Effort**: 30 minutes
**Dependencies**: T-001
**Status**: ✅ COMPLETED

### Description

Implement the `update_task()` function to modify existing task titles and descriptions, with optional field updates.

### Implementation Requirements

1. Implement find helper (if not already in T-001):
   ```python
   def get_task_by_id(tasks: TaskList, task_id: int) -> Task | None:
       """Find a task by its ID."""
       for task in tasks:
           if task['id'] == task_id:
               return task
       return None
   ```

2. Implement update function:
   ```python
   def update_task(
       tasks: TaskList,
       task_id: int,
       title: str | None = None,
       description: str | None = None
   ) -> bool:
       """Update an existing task's title and/or description."""
       task = get_task_by_id(tasks, task_id)
       if task is None:
           return False

       # Update title if provided
       if title is not None:
           if not validate_title(title):
               if not title.strip():
                   raise ValueError("Title is required.")
               raise ValueError("Title must be 1-200 characters.")
           task['title'] = title

       # Update description if provided (no validation)
       if description is not None:
           task['description'] = description

       return True
   ```

### Acceptance Criteria

- [ ] `get_task_by_id()` returns task dict if found
- [ ] `get_task_by_id()` returns None if not found
- [ ] `update_task()` returns False if task not found
- [ ] `update_task()` updates title when provided
- [ ] `update_task()` updates description when provided
- [ ] `update_task()` updates both when both provided
- [ ] `update_task()` keeps existing values when None passed
- [ ] `update_task()` validates title (non-empty, <= 200 chars)
- [ ] `update_task()` does not validate description
- [ ] `update_task()` raises ValueError for invalid title
- [ ] `update_task()` returns True on success
- [ ] All functions have type hints and docstrings

### Test Cases

```python
# Test 1: Update title only
tasks = [{'id': 1, 'title': 'Old', 'description': 'Old desc', 'completed': False}]
result = update_task(tasks, 1, title="New")
assert result == True
assert tasks[0]['title'] == "New"
assert tasks[0]['description'] == "Old desc"  # Unchanged

# Test 2: Update description only
result = update_task(tasks, 1, description="New desc")
assert result == True
assert tasks[0]['description'] == "New desc"
assert tasks[0]['title'] == "New"  # Unchanged

# Test 3: Update both fields
result = update_task(tasks, 1, title="Both", description="Both desc")
assert result == True
assert tasks[0]['title'] == "Both"
assert tasks[0]['description'] == "Both desc"

# Test 4: Task not found returns False
result = update_task(tasks, 999)
assert result == False

# Test 5: Invalid title raises error
try:
    update_task(tasks, 1, title="")
    assert False, "Should raise ValueError"
except ValueError:
    pass

# Test 6: None values preserve existing
original_title = tasks[0]['title']
result = update_task(tasks, 1, title=None, description=None)
assert result == True
assert tasks[0]['title'] == original_title
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Optional parameters work correctly
- Validation only applied when values provided
- Clear error messages for validation failures

---

## T-004: Implement delete_task function [X]

**Priority**: P2 (Important)
**Estimated Effort**: 20 minutes
**Dependencies**: T-001
**Status**: ✅ COMPLETED

### Description

Implement the `delete_task()` function to permanently remove tasks from the task list.

### Implementation Requirements

```python
def delete_task(tasks: TaskList, task_id: int) -> bool:
    """Delete a task from the tasks list."""
    task = get_task_by_id(tasks, task_id)
    if task is None:
        return False

    tasks.remove(task)
    return True
```

### Acceptance Criteria

- [ ] `delete_task()` returns False if task not found
- [ ] `delete_task()` removes task from list when found
- [ ] `delete_task()` returns True on success
- [ ] List length decreases by 1 after deletion
- [ ] Other tasks remain in list after deletion
- [ ] IDs are not reused after deletion (verified with get_next_id)
- [ ] Function has type hints and docstring

### Test Cases

```python
# Test 1: Delete existing task
tasks = [
    {'id': 1, 'title': 'Task 1', 'description': '', 'completed': False},
    {'id': 2, 'title': 'Task 2', 'description': '', 'completed': False}
]
result = delete_task(tasks, 1)
assert result == True
assert len(tasks) == 1
assert tasks[0]['id'] == 2  # Task 2 remains

# Test 2: Delete non-existent task
result = delete_task(tasks, 999)
assert result == False
assert len(tasks) == 1  # No change

# Test 3: Delete all tasks
delete_task(tasks, 2)
assert len(tasks) == 0

# Test 4: IDs not reused after deletion
tasks = []
add_task(tasks, "Task 1")  # ID 1
add_task(tasks, "Task 2")  # ID 2
delete_task(tasks, 1)
new_id = add_task(tasks, "Task 3")
assert new_id == 3  # Not 1
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Function correctly removes tasks
- No side effects on other tasks
- ID generation still works after deletions

---

## T-005: Implement toggle_complete function (complete/uncomplete) [X]

**Priority**: P2 (Important)
**Estimated Effort**: 20 minutes
**Dependencies**: T-001
**Status**: ✅ COMPLETED

### Description

Implement the `toggle_complete()` function to flip the completion status of tasks between completed and pending.

### Implementation Requirements

```python
def toggle_complete(tasks: TaskList, task_id: int) -> bool:
    """Toggle the completed status of a task."""
    task = get_task_by_id(tasks, task_id)
    if task is None:
        return False

    task['completed'] = not task['completed']
    return True
```

### Acceptance Criteria

- [ ] `toggle_complete()` returns False if task not found
- [ ] `toggle_complete()` flips False to True
- [ ] `toggle_complete()` flips True to False
- [ ] `toggle_complete()` returns True on success
- [ ] Can be called multiple times to toggle back and forth
- [ ] Function has type hints and docstring

### Test Cases

```python
# Test 1: Toggle from pending to completed
tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
result = toggle_complete(tasks, 1)
assert result == True
assert tasks[0]['completed'] == True

# Test 2: Toggle from completed to pending
result = toggle_complete(tasks, 1)
assert result == True
assert tasks[0]['completed'] == False

# Test 3: Multiple toggles
toggle_complete(tasks, 1)  # True
toggle_complete(tasks, 1)  # False
toggle_complete(tasks, 1)  # True
assert tasks[0]['completed'] == True

# Test 4: Task not found
result = toggle_complete(tasks, 999)
assert result == False

# Test 5: Verify list_tasks shows correct status
tasks[0]['completed'] = False
list_tasks(tasks)
# Should show "Pending"
toggle_complete(tasks, 1)
list_tasks(tasks)
# Should show "Completed"
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Boolean toggling works correctly
- Status changes visible in list output

---

## T-006: Implement get_task_by_id helper [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 15 minutes
**Dependencies**: T-001
**Note**: May already be implemented in T-003
**Status**: ✅ COMPLETED

### Description

Ensure the `get_task_by_id()` helper function is implemented and tested independently, as it's used by multiple other functions.

### Implementation Requirements

```python
def get_task_by_id(tasks: TaskList, task_id: int) -> Task | None:
    """
    Find a task by its ID.

    Args:
        tasks: The current list of task dictionaries
        task_id: The task ID to search for

    Returns:
        Task dict if found, None if not found

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> task = get_task_by_id(tasks, 1)
        >>> task['title']
        'Test'
        >>> get_task_by_id(tasks, 999)
        None
    """
    for task in tasks:
        if task['id'] == task_id:
            return task
    return None
```

### Acceptance Criteria

- [ ] Returns task dict when ID found
- [ ] Returns None when ID not found
- [ ] Works with empty task list (returns None)
- [ ] Returns first match if duplicate IDs (shouldn't happen)
- [ ] Does not modify tasks list
- [ ] Function has type hints and docstring with examples

### Test Cases

```python
# Test 1: Find existing task
tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
task = get_task_by_id(tasks, 1)
assert task is not None
assert task['id'] == 1
assert task['title'] == 'Test'

# Test 2: Task not found
task = get_task_by_id(tasks, 999)
assert task is None

# Test 3: Empty list
tasks = []
task = get_task_by_id(tasks, 1)
assert task is None

# Test 4: Multiple tasks, find specific one
tasks = [
    {'id': 1, 'title': 'Task 1', 'description': '', 'completed': False},
    {'id': 5, 'title': 'Task 5', 'description': '', 'completed': True},
    {'id': 10, 'title': 'Task 10', 'description': '', 'completed': False}
]
task = get_task_by_id(tasks, 5)
assert task['id'] == 5
assert task['title'] == 'Task 5'
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Function is pure (no side effects)
- Used by update, delete, and toggle functions

---

## T-007: Implement print_menu and main command loop [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 1 hour
**Dependencies**: T-001, T-002, T-003, T-004, T-005
**Status**: ✅ COMPLETED

### Description

Implement the main interactive loop with menu display, command parsing, and routing to appropriate handler functions.

### Implementation Requirements

1. Implement menu display:
   ```python
   def print_menu() -> None:
       """Display the main menu with available commands."""
       print("\n=== Todo App Menu ===")
       print("Commands:")
       print("  add              - Add a new task")
       print("  list             - List all tasks")
       print("  update <id>      - Update a task")
       print("  delete <id>      - Delete a task")
       print("  complete <id>    - Mark task as completed")
       print("  uncomplete <id>  - Mark task as incomplete")
       print("  quit (or q)      - Exit the application")
       print("\nPress Ctrl+C to quit anytime.\n")
   ```

2. Implement command parsing:
   ```python
   def parse_command(input_str: str) -> tuple[str, str]:
       """Parse user input into command and arguments."""
       stripped = input_str.strip().lower()
       if not stripped:
           return ('list', '')  # Default to list

       parts = stripped.split(maxsplit=1)
       command = parts[0]
       args = parts[1] if len(parts) > 1 else ""
       return (command, args)
   ```

3. Implement command handlers:
   ```python
   def handle_add(tasks: TaskList) -> None:
       """Handle the 'add' command."""
       title = input("Enter task title: ").strip()
       description = input("Enter description (optional): ").strip()
       try:
           task_id = add_task(tasks, title, description)
           print(f"Task added: {title} (ID: {task_id})")
       except ValueError as e:
           print(f"Error: {e}")

   def handle_update(args: str, tasks: TaskList) -> None:
       """Handle the 'update <id>' command."""
       try:
           task_id = int(args)
       except ValueError:
           print("Error: Invalid task ID.")
           return

       new_title = input("New title (leave blank to keep): ").strip()
       new_desc = input("New description (leave blank to keep): ").strip()

       try:
           result = update_task(
               tasks,
               task_id,
               new_title if new_title else None,
               new_desc if new_desc else None
           )
           if result:
               print("Task updated.")
           else:
               print("Error: Task not found.")
       except ValueError as e:
           print(f"Error: {e}")

   def handle_delete(args: str, tasks: TaskList) -> None:
       """Handle the 'delete <id>' command."""
       try:
           task_id = int(args)
       except ValueError:
           print("Error: Invalid task ID.")
           return

       result = delete_task(tasks, task_id)
       if result:
           print("Task deleted.")
       else:
           print("Error: Task not found.")

   def handle_complete(args: str, tasks: TaskList) -> None:
       """Handle the 'complete <id>' command."""
       try:
           task_id = int(args)
       except ValueError:
           print("Error: Invalid task ID.")
           return

       result = toggle_complete(tasks, task_id)
       if result:
           print("Task marked as Completed.")
       else:
           print("Error: Task not found.")

   def handle_uncomplete(args: str, tasks: TaskList) -> None:
       """Handle the 'uncomplete <id>' command."""
       try:
           task_id = int(args)
       except ValueError:
           print("Error: Invalid task ID.")
           return

       result = toggle_complete(tasks, task_id)
       if result:
           print("Task marked as Pending.")
       else:
           print("Error: Task not found.")
   ```

4. Implement routing:
   ```python
   def route_command(command: str, args: str, tasks: TaskList) -> bool:
       """
       Route parsed command to appropriate handler.

       Returns:
           False to continue loop, True to quit
       """
       if command in ('quit', 'q'):
           return True
       elif command == 'add':
           handle_add(tasks)
       elif command == 'list':
           list_tasks(tasks)
       elif command == 'update':
           handle_update(args, tasks)
       elif command == 'delete':
           handle_delete(args, tasks)
       elif command == 'complete':
           handle_complete(args, tasks)
       elif command == 'uncomplete':
           handle_uncomplete(args, tasks)
       else:
           print("Error: Unknown command. Try: add, list, update, delete, complete, quit")

       return False
   ```

5. Implement main loop:
   ```python
   def main() -> None:
       """Main application entry point."""
       tasks: TaskList = []
       print("Welcome to Todo App!")

       try:
           while True:
               print_menu()
               user_input = input("> ")
               command, args = parse_command(user_input)
               should_quit = route_command(command, args, tasks)
               if should_quit:
                   break
       except KeyboardInterrupt:
           pass  # Handle Ctrl+C gracefully

       print("\nGoodbye!")

   if __name__ == "__main__":
       main()
   ```

### Acceptance Criteria

- [ ] `print_menu()` displays all commands clearly
- [ ] `parse_command()` extracts command and args correctly
- [ ] `parse_command()` defaults to 'list' for empty input
- [ ] `parse_command()` normalizes to lowercase
- [ ] All handler functions implemented (add, update, delete, complete, uncomplete)
- [ ] `route_command()` calls correct handler for each command
- [ ] `route_command()` prints error for unknown commands
- [ ] `main()` initializes empty tasks list
- [ ] `main()` runs infinite loop until quit
- [ ] `main()` handles KeyboardInterrupt gracefully
- [ ] Quit works with 'quit' or 'q' commands
- [ ] Goodbye message printed on exit
- [ ] Entry point guard (`if __name__ == "__main__"`) included
- [ ] All functions have type hints and docstrings

### Test Cases

```python
# Manual interactive tests (run python src/todo.py):

# Test 1: Menu displays correctly
# Expected: Menu with 7 commands listed

# Test 2: Add task interactively
> add
Enter task title: Buy milk
Enter description (optional): From store
# Expected: "Task added: Buy milk (ID: 1)"

# Test 3: List tasks
> list
# Expected: Table with one task

# Test 4: Empty command defaults to list
>
# Expected: Table displayed

# Test 5: Update task
> update 1
New title (leave blank to keep): Buy organic milk
New description (leave blank to keep):
# Expected: "Task updated."

# Test 6: Complete task
> complete 1
# Expected: "Task marked as Completed."

# Test 7: List shows completed status
> list
# Expected: Status column shows "Completed"

# Test 8: Uncomplete task
> uncomplete 1
# Expected: "Task marked as Pending."

# Test 9: Delete task
> delete 1
# Expected: "Task deleted."

# Test 10: Unknown command
> foo
# Expected: Error message with available commands

# Test 11: Quit with 'quit'
> quit
# Expected: "Goodbye!" and exit

# Test 12: Quit with 'q'
> q
# Expected: "Goodbye!" and exit

# Test 13: Quit with Ctrl+C
> ^C
# Expected: "Goodbye!" and exit (no crash)

# Test 14: Invalid ID format
> delete abc
# Expected: "Error: Invalid task ID."
```

### Definition of Done

- Code written and follows PEP 8
- All manual tests pass
- Main loop runs continuously
- All commands work as expected
- Error handling prevents crashes
- Graceful exit on quit or Ctrl+C

---

## T-008: Add error handling for invalid commands and IDs [X]

**Priority**: P2 (Important)
**Estimated Effort**: 30 minutes
**Dependencies**: T-007
**Note**: Most error handling already implemented in T-007
**Status**: ✅ COMPLETED

### Description

Verify and enhance error handling throughout the application to ensure robust user experience with clear error messages.

### Implementation Requirements

Review and ensure these error cases are handled:

1. **Command Errors**:
   - Unknown command → "Error: Unknown command. Try: add, list, update, delete, complete, quit"
   - Missing ID argument → "Error: Invalid task ID."

2. **Title Validation**:
   - Empty title → "Error: Title is required."
   - Title too long → "Error: Title must be 1-200 characters."

3. **ID Validation**:
   - Non-numeric ID → "Error: Invalid task ID."
   - Task not found → "Error: Task not found."

4. **Input Parsing**:
   - Handle empty input gracefully (default to list)
   - Strip whitespace from all inputs
   - Convert commands to lowercase

5. **Exception Handling**:
   - Catch ValueError from validation functions
   - Catch KeyboardInterrupt for Ctrl+C
   - No uncaught exceptions should crash the app

### Acceptance Criteria

- [ ] All error messages are user-friendly (no stack traces)
- [ ] All error messages start with "Error: "
- [ ] Invalid commands don't crash the app
- [ ] Invalid IDs don't crash the app
- [ ] Empty title handled with clear message
- [ ] Long title handled with clear message
- [ ] Task not found handled with clear message
- [ ] Ctrl+C exits gracefully
- [ ] Empty input defaults to list
- [ ] All ValueError exceptions caught and displayed
- [ ] Application never crashes during normal usage

### Test Cases

```python
# All error cases from T-007 tests, plus:

# Test 1: Multiple validation errors in sequence
> add
Enter task title:
# Error: Title is required.
> add
Enter task title: x * 201
# Error: Title must be 1-200 characters.

# Test 2: Operations on non-existent tasks
> update 999
# Error: Task not found.
> delete 999
# Error: Task not found.
> complete 999
# Error: Task not found.

# Test 3: Whitespace handling
>    add
# Should work normally (whitespace stripped)
>
# Should list tasks (empty input)

# Test 4: Case insensitivity
> ADD
# Should work (command normalized to lowercase)
> LiSt
# Should work

# Test 5: Recovery after errors
> delete abc
# Error: Invalid task ID.
> list
# Should work normally (app still running)

# Test 6: Stress test - many errors in a row
> foo
> bar
> delete xyz
> update
> complete
# App should handle all errors and keep running
```

### Definition of Done

- All error paths tested manually
- Error messages are clear and consistent
- Application never crashes
- Users can recover from any error
- Error handling follows constitution principles

---

## T-009: Add graceful exit on quit or Ctrl+C [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 15 minutes
**Dependencies**: T-007
**Note**: Already implemented in T-007, this task verifies it
**Status**: ✅ COMPLETED

### Description

Ensure the application exits gracefully with a goodbye message when users quit via command or Ctrl+C.

### Implementation Requirements

Verify the following is implemented in `main()`:

```python
def main() -> None:
    """Main application entry point."""
    tasks: TaskList = []
    print("Welcome to Todo App!")

    try:
        while True:
            print_menu()
            user_input = input("> ")
            command, args = parse_command(user_input)
            should_quit = route_command(command, args, tasks)
            if should_quit:
                break
    except KeyboardInterrupt:
        pass  # Exit gracefully on Ctrl+C

    print("\nGoodbye!")
```

### Acceptance Criteria

- [ ] Typing "quit" exits the application
- [ ] Typing "q" exits the application
- [ ] Both commands print "Goodbye!" message
- [ ] Pressing Ctrl+C exits the application
- [ ] Ctrl+C prints "Goodbye!" message
- [ ] Ctrl+C does not print stack trace
- [ ] Exit is immediate (no delay)
- [ ] No error messages on normal exit
- [ ] Application returns exit code 0

### Test Cases

```python
# Test 1: Quit command
$ python src/todo.py
> quit
Goodbye!
$ echo $?  # Should be 0

# Test 2: Q command
$ python src/todo.py
> q
Goodbye!

# Test 3: Ctrl+C during menu
$ python src/todo.py
>  # Press Ctrl+C here
Goodbye!

# Test 4: Ctrl+C during input
$ python src/todo.py
> add
Enter task title:  # Press Ctrl+C here
Goodbye!

# Test 5: Multiple quit attempts
$ python src/todo.py
> quit
# Should exit immediately (not wait for another command)
```

### Definition of Done

- All quit methods work correctly
- Goodbye message always displayed
- No stack traces or error messages
- Exit is clean and immediate

---

## T-010: Add timestamp to new tasks

**Priority**: P3 (Nice to Have)
**Estimated Effort**: 30 minutes
**Dependencies**: T-001

### Description

Add a creation timestamp to each task using ISO 8601 format. This is optional for Phase I but provides useful metadata.

### Implementation Requirements

1. Import datetime:
   ```python
   from datetime import datetime
   ```

2. Add helper function:
   ```python
   def format_timestamp() -> str:
       """Return current timestamp in ISO 8601 format."""
       return datetime.now().isoformat()
   ```

3. Update Task type alias:
   ```python
   Task: TypeAlias = dict[str, int | str | bool]
   # Keys: 'id', 'title', 'description', 'completed', 'created_at'
   ```

4. Update `add_task()`:
   ```python
   def add_task(tasks: TaskList, title: str, description: str = "") -> int:
       """Add a new task to the tasks list."""
       # ... validation code ...

       task = {
           'id': task_id,
           'title': title,
           'description': description,
           'completed': False,
           'created_at': format_timestamp()
       }
       tasks.append(task)
       return task_id
   ```

5. Optionally update `print_task_table()` to show timestamp:
   ```python
   # Add timestamp column (optional - may make table too wide)
   # For now, timestamp is stored but not displayed
   ```

### Acceptance Criteria

- [ ] `format_timestamp()` returns ISO 8601 format string
- [ ] All new tasks have 'created_at' field
- [ ] Timestamp is set when task is created
- [ ] Timestamp is not changed on update
- [ ] Type alias documentation updated
- [ ] Function has type hints and docstring

### Test Cases

```python
# Test 1: New task has timestamp
tasks = []
add_task(tasks, "Test task")
assert 'created_at' in tasks[0]
assert len(tasks[0]['created_at']) > 0

# Test 2: Timestamp format is ISO 8601
created_at = tasks[0]['created_at']
# Should match format: YYYY-MM-DDTHH:MM:SS.ffffff
assert 'T' in created_at  # Has date-time separator

# Test 3: Each task gets unique timestamp
import time
add_task(tasks, "Task 1")
time.sleep(0.01)  # Small delay
add_task(tasks, "Task 2")
assert tasks[0]['created_at'] != tasks[1]['created_at']

# Test 4: Update doesn't change timestamp
original_timestamp = tasks[0]['created_at']
update_task(tasks, 1, title="Updated")
assert tasks[0]['created_at'] == original_timestamp

# Test 5: Format function works
from datetime import datetime
timestamp = format_timestamp()
parsed = datetime.fromisoformat(timestamp)
# Should parse without error
```

### Definition of Done

- Code written and follows PEP 8
- All test cases pass manually
- Timestamps stored but not displayed (to keep table clean)
- Type alias documentation updated
- Optional feature - can be skipped if time-constrained

---

## T-011: Add README.md with setup instructions [X]

**Priority**: P2 (Important)
**Estimated Effort**: 30 minutes
**Dependencies**: All implementation tasks complete
**Status**: ✅ COMPLETED

### Description

Create user-facing README.md documentation with installation, usage instructions, and examples.

### Implementation Requirements

Create `README.md` with the following sections:

```markdown
# Todo App - Phase I

A simple command-line todo application for managing tasks in memory.

## Features

- Add new tasks with title and optional description
- List all tasks in a formatted table
- Update task titles and descriptions
- Delete tasks
- Mark tasks as complete or incomplete
- Auto-incrementing task IDs
- Graceful error handling
- No external dependencies

## Requirements

- Python 3.8 or higher
- No external packages required (uses Python standard library only)

## Installation

1. Clone or download this repository
2. Ensure Python 3.8+ is installed: `python --version`
3. No additional setup needed!

## Usage

### Running the Application

```bash
python src/todo.py
```

### Available Commands

- `add` - Add a new task (prompts for title and description)
- `list` - Display all tasks in a table (also default for empty input)
- `update <id>` - Update a task's title and/or description
- `delete <id>` - Delete a task permanently
- `complete <id>` - Mark a task as completed
- `uncomplete <id>` - Mark a task as incomplete
- `quit` or `q` - Exit the application
- `Ctrl+C` - Exit the application

### Example Session

```
$ python src/todo.py
Welcome to Todo App!

=== Todo App Menu ===
Commands:
  add              - Add a new task
  list             - List all tasks
  update <id>      - Update a task
  delete <id>      - Delete a task
  complete <id>    - Mark task as completed
  uncomplete <id>  - Mark task as incomplete
  quit (or q)      - Exit the application

Press Ctrl+C to quit anytime.

> add
Enter task title: Buy groceries
Enter description (optional): Milk, eggs, bread
Task added: Buy groceries (ID: 1)

> add
Enter task title: Finish report
Enter description (optional):
Task added: Finish report (ID: 2)

> list
ID | Title                  | Description             | Status
---+------------------------+-------------------------+-----------
 1 | Buy groceries          | Milk, eggs, bread       | Pending
 2 | Finish report          |                         | Pending

> complete 1
Task marked as Completed.

> list
ID | Title                  | Description             | Status
---+------------------------+-------------------------+-----------
 1 | Buy groceries          | Milk, eggs, bread       | Completed
 2 | Finish report          |                         | Pending

> update 2
New title (leave blank to keep): Finish quarterly report
New description (leave blank to keep): Due Friday
Task updated.

> delete 1
Task deleted.

> list
ID | Title                  | Description             | Status
---+------------------------+-------------------------+-----------
 2 | Finish quarterly report| Due Friday              | Pending

> quit
Goodbye!
```

## Data Storage

- All data is stored **in memory only**
- Tasks are lost when the application exits
- No database or file persistence in Phase I
- Designed for single-user, single-session use

## Limitations (Phase I)

- No data persistence (tasks lost on exit)
- No task priorities, categories, or tags
- No due dates or reminders
- No search or filtering
- No undo/redo
- Single-user only (no concurrency)
- Optimized for up to 1000 tasks

## Error Handling

The application handles errors gracefully:

- Empty titles are rejected
- Titles over 200 characters are rejected
- Invalid task IDs show "Task not found"
- Unknown commands show available options
- Ctrl+C exits cleanly without errors

## Code Quality

This project follows strict code quality standards:

- PEP 8 compliant
- Type hints on all functions
- Docstrings with examples
- Pure functions for business logic
- Comprehensive error handling
- No external dependencies

## Development

See `specs/001-console-todo-app/` for development documentation:

- `spec.md` - Feature specification
- `plan.md` - Implementation plan
- `data-model.md` - Data structures
- `contracts/api.md` - Function contracts
- `quickstart.md` - Developer guide

## Future Enhancements (Planned for Phase II+)

- Data persistence (save/load from file or database)
- Task priorities and categories
- Due dates and reminders
- Search and filtering
- Automated tests
- Export to various formats
- Web or GUI interface

## License

[Add your license here]

## Author

[Add your information here]
```

### Acceptance Criteria

- [ ] README.md created in project root
- [ ] All sections included (features, requirements, installation, usage, examples)
- [ ] Example session shows realistic workflow
- [ ] Error handling documented
- [ ] Limitations clearly stated
- [ ] Future enhancements listed
- [ ] Markdown formatting correct
- [ ] Code blocks properly formatted
- [ ] Links to development docs included

### Test Cases

```python
# Manual verification:

# Test 1: README renders correctly in GitHub
# View README.md in GitHub or markdown viewer
# All formatting should display properly

# Test 2: Installation instructions work
# Follow installation steps from scratch
# Application should run without issues

# Test 3: Example session is accurate
# Run the exact commands from example
# Output should match documented output

# Test 4: All commands documented
# Compare README command list to actual menu
# Should be identical

# Test 5: Links to dev docs work
# Click links in "Development" section
# Files should exist and open correctly
```

### Definition of Done

- README.md created and properly formatted
- All sections complete and accurate
- Example session tested and verified
- Markdown syntax correct
- User can follow instructions successfully

---

## T-012: Add type hints and docstrings to all functions [X]

**Priority**: P1 (Critical)
**Estimated Effort**: 1 hour
**Dependencies**: All implementation tasks
**Note**: Should be done incrementally with each task
**Status**: ✅ COMPLETED

### Description

Ensure every function in `src/todo.py` has complete type hints and comprehensive docstrings following the project standards.

### Implementation Requirements

For each function, ensure:

1. **Type Hints**:
   ```python
   def function_name(arg1: Type1, arg2: Type2 = default) -> ReturnType:
   ```

2. **Docstring Format**:
   ```python
   """
   Brief one-line description.

   Detailed description if needed (optional).

   Args:
       arg1: Description of arg1
       arg2: Description of arg2

   Returns:
       Description of return value

   Raises:
       ValueError: When this error occurs

   Side Effects:
       Describes any mutations or I/O

   Examples:
       >>> function_name(val1, val2)
       expected_output
   """
   ```

3. **Type Aliases Used**:
   ```python
   Task: TypeAlias = dict[str, int | str | bool]
   TaskList: TypeAlias = list[Task]
   ```

### Functions Checklist

- [ ] Type aliases defined (Task, TaskList)
- [ ] `get_next_id()` - type hints and docstring
- [ ] `validate_title()` - type hints and docstring
- [ ] `add_task()` - type hints and docstring
- [ ] `truncate_text()` - type hints and docstring
- [ ] `print_task_table()` - type hints and docstring
- [ ] `list_tasks()` - type hints and docstring
- [ ] `get_task_by_id()` - type hints and docstring
- [ ] `update_task()` - type hints and docstring
- [ ] `delete_task()` - type hints and docstring
- [ ] `toggle_complete()` - type hints and docstring
- [ ] `print_menu()` - type hints and docstring
- [ ] `parse_command()` - type hints and docstring
- [ ] `handle_add()` - type hints and docstring
- [ ] `handle_update()` - type hints and docstring
- [ ] `handle_delete()` - type hints and docstring
- [ ] `handle_complete()` - type hints and docstring
- [ ] `handle_uncomplete()` - type hints and docstring
- [ ] `route_command()` - type hints and docstring
- [ ] `main()` - type hints and docstring
- [ ] `format_timestamp()` - type hints and docstring (if T-010 implemented)

### Acceptance Criteria

- [ ] All functions have complete type hints (parameters and return)
- [ ] All functions have docstrings with at least: description, Args, Returns
- [ ] Pure functions marked with "Side Effects: None (pure function)"
- [ ] I/O functions note side effects (e.g., "Prints to stdout")
- [ ] Functions that modify lists note "modified in place"
- [ ] Exceptions documented in Raises section
- [ ] At least one example per function in Examples section
- [ ] Optional parameters documented with defaults
- [ ] Return values clearly described
- [ ] Type checking passes: `python -m mypy src/todo.py` (if using mypy)

### Test Cases

```python
# Manual verification:

# Test 1: Check all functions have type hints
# Open src/todo.py
# Verify every function signature has -> ReturnType

# Test 2: Check all functions have docstrings
# Verify every function has """...""" immediately after def line

# Test 3: Run type checker
$ python -m mypy src/todo.py
# Should pass with no errors (if mypy installed)

# Test 4: Generate documentation
$ pydoc src/todo.py
# Should display all docstrings correctly

# Test 5: IDE autocomplete works
# In VS Code or PyCharm, type a function name
# Should show parameter types and docstring hints
```

### Definition of Done

- All 17+ functions have complete type hints
- All functions have comprehensive docstrings
- Docstrings follow consistent format
- Examples included where helpful
- Side effects documented
- PEP 257 docstring conventions followed

---

## Summary

**Total Tasks**: 12
**Critical (P1)**: 7 tasks (T-001, T-002, T-006, T-007, T-009, T-012)
**Important (P2)**: 4 tasks (T-003, T-004, T-005, T-008, T-011)
**Nice to Have (P3)**: 1 task (T-010)

**Estimated Total Effort**: 6-8 hours for experienced Python developer

**Implementation Order**:
1. T-001 (Foundation)
2. T-006 (Helper, may be done with T-001)
3. T-002 (Display)
4. T-003, T-004, T-005 (CRUD operations - can be parallel)
5. T-007 (Main loop and handlers)
6. T-008, T-009 (Error handling verification)
7. T-010 (Optional timestamp)
8. T-011 (Documentation)
9. T-012 (Type hints verification - ongoing throughout)

**Success Criteria**:
- All critical tasks (P1) completed
- All manual tests pass
- Application runs without crashes
- Constitution requirements met
- README documentation complete

**Next Steps After Completion**:
1. Complete all manual test cases
2. Run application through various scenarios
3. Verify PEP 8 compliance: `pycodestyle src/todo.py`
4. Review constitution checklist
5. Create final commit
6. Tag release as v1.0.0-phase1
