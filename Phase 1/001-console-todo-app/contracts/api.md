# API Contracts: In-Memory Console Todo App (Phase I)

**Feature**: 001-console-todo-app
**Date**: 2025-12-12
**Status**: Complete

## Overview

This document defines all function signatures, input/output contracts, and behavior specifications for the Todo App Phase I. All functions follow the constitution requirements: type hints, PEP 8, pure functions where possible, and clear error handling.

## Type Aliases

```python
from typing import TypeAlias

# Task dictionary structure
Task: TypeAlias = dict[str, int | str | bool]
# {'id': int, 'title': str, 'description': str, 'completed': bool}

# Tasks storage
TaskList: TypeAlias = list[Task]
```

## Core Business Logic Functions

These functions are **pure** (no I/O, deterministic, testable) and implement task management operations.

### add_task

```python
def add_task(tasks: TaskList, title: str, description: str = "") -> int:
    """
    Add a new task to the tasks list.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        title: Task title, required, 1-200 characters
        description: Optional task description, defaults to empty string

    Returns:
        The ID of the newly created task

    Raises:
        ValueError: If title is empty or exceeds 200 characters

    Side Effects:
        Appends new task dict to tasks list

    Examples:
        >>> tasks = []
        >>> task_id = add_task(tasks, "Buy milk", "From the grocery store")
        >>> task_id
        1
        >>> len(tasks)
        1
        >>> tasks[0]['title']
        'Buy milk'

        >>> add_task(tasks, "")
        ValueError: Title is required.

        >>> add_task(tasks, "x" * 201)
        ValueError: Title must be 1-200 characters.
    """
```

**Implementation Requirements**:
- Validate title is non-empty after stripping whitespace
- Validate title length is 1-200 characters
- Generate ID using `get_next_id(tasks)`
- Create task dict with: `{'id': new_id, 'title': title, 'description': description, 'completed': False}`
- Append to tasks list
- Return new task ID

---

### get_task_by_id

```python
def get_task_by_id(tasks: TaskList, task_id: int) -> Task | None:
    """
    Find a task by its ID.

    Args:
        tasks: The current list of task dictionaries
        task_id: The task ID to search for

    Returns:
        Task dict if found, None if not found

    Side Effects:
        None (pure function, read-only)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> task = get_task_by_id(tasks, 1)
        >>> task['title']
        'Test'

        >>> get_task_by_id(tasks, 999)
        None
    """
```

**Implementation Requirements**:
- Iterate through tasks list
- Return first task dict where `task['id'] == task_id`
- Return None if no match found
- Do not modify tasks list

---

### update_task

```python
def update_task(
    tasks: TaskList,
    task_id: int,
    title: str | None = None,
    description: str | None = None
) -> bool:
    """
    Update an existing task's title and/or description.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to update
        title: New title, or None to keep existing (if provided, validates 1-200 chars)
        description: New description, or None to keep existing (no validation)

    Returns:
        True if task was found and updated, False if task not found

    Raises:
        ValueError: If provided title is empty or exceeds 200 characters

    Side Effects:
        Modifies matching task dict in tasks list (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Old', 'description': 'Old desc', 'completed': False}]
        >>> update_task(tasks, 1, title="New")
        True
        >>> tasks[0]['title']
        'New'
        >>> tasks[0]['description']
        'Old desc'

        >>> update_task(tasks, 1, description="New desc")
        True
        >>> tasks[0]['description']
        'New desc'

        >>> update_task(tasks, 999)
        False
    """
```

**Implementation Requirements**:
- Find task using `get_task_by_id(tasks, task_id)`
- Return False if task not found
- If title provided (not None):
  - Validate non-empty after stripping
  - Validate length 1-200 characters
  - Update `task['title']`
- If description provided (not None):
  - Update `task['description']` (no validation)
- Return True on success

---

### delete_task

```python
def delete_task(tasks: TaskList, task_id: int) -> bool:
    """
    Delete a task from the tasks list.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to delete

    Returns:
        True if task was found and deleted, False if task not found

    Side Effects:
        Removes matching task dict from tasks list (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> delete_task(tasks, 1)
        True
        >>> len(tasks)
        0

        >>> delete_task(tasks, 999)
        False
    """
```

**Implementation Requirements**:
- Find task using `get_task_by_id(tasks, task_id)`
- Return False if task not found
- Remove task dict from tasks list
- Return True on success

---

### toggle_complete

```python
def toggle_complete(tasks: TaskList, task_id: int) -> bool:
    """
    Toggle the completed status of a task.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to toggle

    Returns:
        True if task was found and toggled, False if task not found

    Side Effects:
        Flips completed boolean of matching task dict (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> toggle_complete(tasks, 1)
        True
        >>> tasks[0]['completed']
        True

        >>> toggle_complete(tasks, 1)
        True
        >>> tasks[0]['completed']
        False

        >>> toggle_complete(tasks, 999)
        False
    """
```

**Implementation Requirements**:
- Find task using `get_task_by_id(tasks, task_id)`
- Return False if task not found
- Flip completed boolean: `task['completed'] = not task['completed']`
- Return True on success

---

## Helper Functions

These functions support the core business logic.

### get_next_id

```python
def get_next_id(tasks: TaskList) -> int:
    """
    Generate the next available task ID.

    Args:
        tasks: The current list of task dictionaries

    Returns:
        1 if tasks is empty, otherwise max(task['id']) + 1

    Side Effects:
        None (pure function, read-only)

    Examples:
        >>> get_next_id([])
        1

        >>> tasks = [{'id': 1, ...}, {'id': 2, ...}]
        >>> get_next_id(tasks)
        3

        >>> tasks = [{'id': 1, ...}, {'id': 5, ...}]
        >>> get_next_id(tasks)
        6
    """
```

**Implementation Requirements**:
- Return 1 if tasks list is empty
- Find maximum `task['id']` value in tasks list
- Return max_id + 1

---

### validate_title

```python
def validate_title(title: str) -> bool:
    """
    Validate a task title meets requirements.

    Args:
        title: The title string to validate

    Returns:
        True if title is valid (non-empty, 1-200 chars), False otherwise

    Side Effects:
        None (pure function)

    Examples:
        >>> validate_title("Valid title")
        True

        >>> validate_title("")
        False

        >>> validate_title("   ")
        False

        >>> validate_title("x" * 200)
        True

        >>> validate_title("x" * 201)
        False
    """
```

**Implementation Requirements**:
- Strip whitespace from title
- Return False if empty after stripping
- Return False if length > 200
- Return True otherwise

---

### truncate_text

```python
def truncate_text(text: str, max_length: int) -> str:
    """
    Truncate text to maximum length, adding "..." if truncated.

    Args:
        text: The string to truncate
        max_length: Maximum length including "..." suffix

    Returns:
        Original text if len <= max_length, otherwise text[:max_length-3] + "..."

    Side Effects:
        None (pure function)

    Examples:
        >>> truncate_text("Short", 30)
        'Short'

        >>> truncate_text("This is a very long description that exceeds", 30)
        'This is a very long descri...'

        >>> truncate_text("Exactly30Characters1234567890", 30)
        'Exactly30Characters1234567890'
    """
```

**Implementation Requirements**:
- Return text unchanged if `len(text) <= max_length`
- Otherwise return `text[:max_length-3] + "..."`
- Handle edge case: if max_length < 3, return text[:max_length]

---

## Display Functions (I/O)

These functions handle console output and are **not pure** (perform I/O operations).

### print_menu

```python
def print_menu() -> None:
    """
    Display the main menu with available commands.

    Args:
        None

    Returns:
        None

    Side Effects:
        Prints to stdout

    Output Format:
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
    """
```

**Implementation Requirements**:
- Print formatted menu with clear command descriptions
- Include examples of command syntax
- Mention Ctrl+C quit option

---

### print_task_table

```python
def print_task_table(tasks: TaskList) -> None:
    """
    Display all tasks in a formatted table.

    Args:
        tasks: The current list of task dictionaries

    Returns:
        None

    Side Effects:
        Prints to stdout

    Output Format (with tasks):
        ID | Title                  | Description             | Status
        ---+------------------------+-------------------------+-----------
        1  | Buy groceries          | Milk, eggs, bread       | Pending
        2  | Finish report          |                         | Completed

    Output Format (empty):
        No tasks yet.

    Examples:
        >>> print_task_table([])
        No tasks yet.

        >>> tasks = [{'id': 1, 'title': 'Test', 'description': 'Long description here', 'completed': False}]
        >>> print_task_table(tasks)
        ID | Title                  | Description             | Status
        ---+------------------------+-------------------------+-----------
        1  | Test                   | Long description her... | Pending
    """
```

**Implementation Requirements**:
- Check if tasks list is empty, print "No tasks yet." if so
- Otherwise, print table header
- For each task:
  - Format ID (right-aligned, 3-5 chars)
  - Print title (left-aligned, 20-30 chars)
  - Truncate description to 30 chars using `truncate_text()`
  - Print status: "Completed" if `task['completed']` else "Pending"

---

### list_tasks

```python
def list_tasks(tasks: TaskList) -> None:
    """
    List all tasks (wrapper for print_task_table).

    Args:
        tasks: The current list of task dictionaries

    Returns:
        None

    Side Effects:
        Prints to stdout via print_task_table()

    Examples:
        >>> list_tasks([])
        No tasks yet.
    """
```

**Implementation Requirements**:
- Call `print_task_table(tasks)`
- Provides consistent interface for main loop

---

## Main Application Functions

These functions implement the interactive loop and command routing.

### main

```python
def main() -> None:
    """
    Main application entry point. Runs interactive command loop.

    Args:
        None

    Returns:
        None

    Side Effects:
        - Reads from stdin
        - Prints to stdout
        - Maintains tasks list in memory
        - Exits on "quit", "q", or Ctrl+C

    Command Loop:
        1. Print menu
        2. Read command from stdin
        3. Parse command and arguments
        4. Route to appropriate handler
        5. Handle errors gracefully
        6. Repeat until quit

    Error Handling:
        - KeyboardInterrupt (Ctrl+C): Print "Goodbye!" and exit
        - ValueError (invalid input): Print error message, continue loop
        - Unknown command: Print available commands, continue loop

    Examples:
        $ python src/todo.py
        === Todo App Menu ===
        ...
        > add
        Enter task title: Buy milk
        Enter description (optional):
        Task added: Buy milk (ID: 1)
        ...
        > quit
        Goodbye!
    """
```

**Implementation Requirements**:
- Initialize empty tasks list: `tasks: TaskList = []`
- Wrap main loop in try/except for KeyboardInterrupt
- Infinite loop (while True):
  1. Call `print_menu()`
  2. Read input: `command_str = input("> ").strip()`
  3. Parse command and args (see parse_command)
  4. Route to handler (see route_command)
  5. Continue on error (don't crash)
- On KeyboardInterrupt: print "Goodbye!" and exit
- On "quit" or "q": print "Goodbye!" and break loop

---

### parse_command

```python
def parse_command(input_str: str) -> tuple[str, str]:
    """
    Parse user input into command and arguments.

    Args:
        input_str: Raw input string from user

    Returns:
        Tuple of (command, args) where:
        - command: Lowercase command name (first word)
        - args: Remaining text after command (may be empty)

    Side Effects:
        None (pure function)

    Examples:
        >>> parse_command("add")
        ('add', '')

        >>> parse_command("delete 5")
        ('delete', '5')

        >>> parse_command("UPDATE 3")
        ('update', '3')

        >>> parse_command("  list  ")
        ('list', '')

        >>> parse_command("")
        ('list', '')  # Empty input defaults to list
    """
```

**Implementation Requirements**:
- Strip whitespace and convert to lowercase
- Handle empty input: return ('list', '') as default
- Split on first space: `parts = input_str.strip().lower().split(maxsplit=1)`
- Return `(parts[0], parts[1] if len(parts) > 1 else "")`

---

### route_command

```python
def route_command(command: str, args: str, tasks: TaskList) -> None:
    """
    Route parsed command to appropriate handler function.

    Args:
        command: Lowercase command name
        args: Command arguments (may be empty)
        tasks: The current list of task dictionaries

    Returns:
        None

    Side Effects:
        - Reads additional input for add/update commands
        - Prints feedback/errors to stdout
        - Modifies tasks list via handler functions

    Routing Table:
        add -> handle_add()
        list -> list_tasks()
        update -> handle_update(args)
        delete -> handle_delete(args)
        complete -> handle_complete(args)
        uncomplete -> handle_uncomplete(args)
        quit, q -> return (handled in main)
        (unknown) -> print error

    Error Handling:
        - Unknown command: Print available commands
        - Invalid args: Print specific error for command
        - Handler exceptions: Catch and print error message
    """
```

**Implementation Requirements**:
- Use if/elif chain or dict dispatch to route commands
- Call appropriate handler function with tasks and args
- Catch ValueError exceptions, print error message
- Print "Unknown command..." for unrecognized commands

---

## Command Handler Functions

These functions implement the logic for each user command.

### handle_add

```python
def handle_add(tasks: TaskList) -> None:
    """
    Handle the 'add' command by prompting for title and description.

    Args:
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        - Reads title and description from stdin
        - Calls add_task() to create task
        - Prints confirmation or error message

    Prompts:
        Enter task title: <user input>
        Enter description (optional): <user input>

    Success Output:
        Task added: <title> (ID: <id>)

    Error Output:
        Title is required.
        Title must be 1-200 characters.
    """
```

**Implementation Requirements**:
- Prompt for title: `title = input("Enter task title: ").strip()`
- Prompt for description: `description = input("Enter description (optional): ").strip()`
- Try: `task_id = add_task(tasks, title, description)`
- On success: print f"Task added: {title} (ID: {task_id})"
- On ValueError: print error message

---

### handle_update

```python
def handle_update(args: str, tasks: TaskList) -> None:
    """
    Handle the 'update <id>' command by prompting for new values.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        - Parses ID from args
        - Reads new title and description from stdin
        - Calls update_task() to modify task
        - Prints confirmation or error message

    Prompts:
        New title (leave blank to keep): <user input>
        New description (leave blank to keep): <user input>

    Success Output:
        Task updated.

    Error Output:
        Task not found.
        Invalid task ID.
        Title must be 1-200 characters.
    """
```

**Implementation Requirements**:
- Try: parse ID from args: `task_id = int(args)`
- On ValueError: print "Invalid task ID." and return
- Prompt for new title: `new_title = input("New title (leave blank to keep): ").strip()`
- Prompt for new description: `new_desc = input("New description (leave blank to keep): ").strip()`
- Convert empty strings to None
- Call `update_task(tasks, task_id, new_title or None, new_desc or None)`
- Print "Task updated." on success, "Task not found." on failure

---

### handle_delete

```python
def handle_delete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'delete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        - Parses ID from args
        - Calls delete_task() to remove task
        - Prints confirmation or error message

    Success Output:
        Task deleted.

    Error Output:
        Task not found.
        Invalid task ID.
    """
```

**Implementation Requirements**:
- Try: parse ID from args: `task_id = int(args)`
- On ValueError: print "Invalid task ID." and return
- Call `delete_task(tasks, task_id)`
- Print "Task deleted." on success, "Task not found." on failure

---

### handle_complete

```python
def handle_complete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'complete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        - Parses ID from args
        - Calls toggle_complete() to mark complete
        - Prints confirmation or error message

    Success Output:
        Task marked as Completed.

    Error Output:
        Task not found.
        Invalid task ID.
    """
```

**Implementation Requirements**:
- Try: parse ID from args: `task_id = int(args)`
- On ValueError: print "Invalid task ID." and return
- Call `toggle_complete(tasks, task_id)`
- Print "Task marked as Completed." on success, "Task not found." on failure

---

### handle_uncomplete

```python
def handle_uncomplete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'uncomplete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        - Parses ID from args
        - Calls toggle_complete() to mark incomplete
        - Prints confirmation or error message

    Success Output:
        Task marked as Pending.

    Error Output:
        Task not found.
        Invalid task ID.
    """
```

**Implementation Requirements**:
- Try: parse ID from args: `task_id = int(args)`
- On ValueError: print "Invalid task ID." and return
- Call `toggle_complete(tasks, task_id)`
- Print "Task marked as Pending." on success, "Task not found." on failure

---

## Entry Point

```python
if __name__ == "__main__":
    main()
```

**Implementation Requirements**:
- Guard main() call with `if __name__ == "__main__":` idiom
- Allows module to be imported without running main loop

---

## Error Messages Reference

| Scenario | Error Message |
|----------|---------------|
| Empty title | "Title is required." |
| Title too long | "Title must be 1-200 characters." |
| Invalid task ID format | "Invalid task ID." |
| Task ID not found | "Task not found." |
| Unknown command | "Unknown command. Try: add, list, update, delete, complete, quit" |

## Success Messages Reference

| Command | Success Message |
|---------|----------------|
| add | "Task added: {title} (ID: {task_id})" |
| update | "Task updated." |
| delete | "Task deleted." |
| complete | "Task marked as Completed." |
| uncomplete | "Task marked as Pending." |
| quit | "Goodbye!" |

## Function Dependency Graph

```text
main()
├─> print_menu()
├─> parse_command()
└─> route_command()
    ├─> handle_add()
    │   └─> add_task()
    │       ├─> get_next_id()
    │       └─> validate_title()
    ├─> list_tasks()
    │   └─> print_task_table()
    │       └─> truncate_text()
    ├─> handle_update()
    │   └─> update_task()
    │       ├─> get_task_by_id()
    │       └─> validate_title()
    ├─> handle_delete()
    │   └─> delete_task()
    │       └─> get_task_by_id()
    ├─> handle_complete()
    │   └─> toggle_complete()
    │       └─> get_task_by_id()
    └─> handle_uncomplete()
        └─> toggle_complete()
            └─> get_task_by_id()
```

## Summary

**Total Functions**: 17

**Categories**:
- Core business logic (pure): 6 functions
- Helper functions (pure): 3 functions
- Display functions (I/O): 3 functions
- Main application: 2 functions
- Command handlers (I/O): 6 functions

**Key Characteristics**:
- All functions have complete type hints
- Pure functions are side-effect free and testable
- I/O functions have clear contracts
- Error handling via return values and exceptions
- Consistent error/success messaging

**Next Steps**:
- Create `quickstart.md` for developer onboarding
- Run `/sp.tasks` to generate implementation tasks
