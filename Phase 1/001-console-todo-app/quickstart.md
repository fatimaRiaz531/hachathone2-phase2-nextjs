# Quickstart Guide: Todo App Phase I

**Feature**: 001-console-todo-app
**Date**: 2025-12-12
**Target Audience**: Developers implementing or extending the Todo App

## Overview

This guide helps you quickly understand the Todo App codebase structure, set up your development environment, and start contributing. The Todo App Phase I is a simple in-memory console application for managing tasks.

## Prerequisites

- **Python**: 3.8 or higher
- **Operating System**: Windows, Linux, or macOS
- **Editor**: Any text editor or IDE (VS Code, PyCharm, etc.)
- **Knowledge**: Basic Python programming, command-line usage

## Project Structure

```text
Todo App/
├── src/
│   └── todo.py              # Main application (all code here)
├── specs/
│   └── 001-console-todo-app/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Technical research
│       ├── data-model.md    # Data structures
│       ├── contracts/
│       │   └── api.md       # Function contracts
│       └── quickstart.md    # This file
├── history/
│   └── prompts/             # Prompt History Records
├── .specify/
│   └── memory/
│       └── constitution.md  # Project constitution (currently stores spec)
├── CLAUDE.md                # Claude Code development guidelines
└── README.md                # User documentation (to be created)
```

## Quick Start (5 Minutes)

### 1. Clone/Navigate to Project

```bash
cd "C:\Users\Cs\Desktop\Todo App"
```

### 2. Verify Python Version

```bash
python --version  # Should be 3.8 or higher
```

### 3. Run the Application (once implemented)

```bash
python src/todo.py
```

Expected output:
```text
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

>
```

### 4. Try Basic Commands

```text
> add
Enter task title: Buy groceries
Enter description (optional): Milk, eggs, bread
Task added: Buy groceries (ID: 1)

> list
ID | Title                  | Description             | Status
---+------------------------+-------------------------+-----------
1  | Buy groceries          | Milk, eggs, bread       | Pending

> complete 1
Task marked as Completed.

> quit
Goodbye!
```

## Architecture Overview

### Core Concepts

1. **In-Memory Storage**: Tasks stored as list of dicts, lost on exit
2. **Single File**: All code in `src/todo.py` for simplicity
3. **Interactive Loop**: Main loop reads commands and routes to handlers
4. **Pure Functions**: Business logic separated from I/O for testability

### Data Model

```python
# Task structure
task = {
    'id': 1,                    # Auto-incrementing unique ID
    'title': 'Buy groceries',   # Required, 1-200 characters
    'description': 'Milk...',   # Optional, no limit
    'completed': False          # Boolean status
}

# Storage
tasks: list[dict] = []  # List of task dicts
```

### Key Functions

| Function | Purpose | Pure? |
|----------|---------|-------|
| `add_task()` | Create new task | Yes |
| `get_task_by_id()` | Find task by ID | Yes |
| `update_task()` | Modify task fields | Yes |
| `delete_task()` | Remove task | Yes |
| `toggle_complete()` | Toggle completion status | Yes |
| `print_task_table()` | Display tasks | No (I/O) |
| `main()` | Run interactive loop | No (I/O) |

## Development Workflow

### Phase 1: Understanding (Current)

1. Read `specs/001-console-todo-app/spec.md` for requirements
2. Read `specs/001-console-todo-app/plan.md` for architecture
3. Read `specs/001-console-todo-app/data-model.md` for data structures
4. Read `specs/001-console-todo-app/contracts/api.md` for function signatures

### Phase 2: Implementation (Next - via /sp.tasks)

1. Run `/sp.tasks` to generate implementation task list
2. Create `src/todo.py` skeleton
3. Implement helper functions first (`get_next_id`, `validate_title`, etc.)
4. Implement core business logic (`add_task`, `update_task`, etc.)
5. Implement display functions (`print_menu`, `print_task_table`, etc.)
6. Implement command handlers (`handle_add`, `handle_update`, etc.)
7. Implement main loop and command routing
8. Manual testing

### Phase 3: Testing

1. Test each command with valid inputs
2. Test error cases (invalid IDs, empty titles, etc.)
3. Test edge cases (empty list, many tasks, long text)
4. Test on different platforms if possible

### Phase 4: Documentation

1. Create `README.md` with user instructions
2. Document any gotchas or known issues
3. Add examples to README

## Constitution Compliance Checklist

Before committing changes, verify:

- [ ] Python standard library only (no external imports)
- [ ] PEP 8 compliant (use linter: `pycodestyle src/todo.py`)
- [ ] Type hints on all function signatures
- [ ] Docstrings on all public functions
- [ ] No hardcoded values (use constants or parameters)
- [ ] Error handling for all user inputs
- [ ] Clear, user-friendly error messages
- [ ] Functions under 20 lines where possible
- [ ] Pure functions separate from I/O functions

## Common Tasks

### Add a New Command

1. Define handler function: `handle_<command>(args, tasks)`
2. Add route in `route_command()` function
3. Update menu in `print_menu()` function
4. Test new command thoroughly

### Modify Task Structure

1. Update `Task` type alias in type hints
2. Update `add_task()` to initialize new field
3. Update `print_task_table()` to display new field
4. Update data-model.md documentation

### Add Input Validation

1. Create validation function (e.g., `validate_<field>()`)
2. Call in appropriate handler (`handle_add`, `handle_update`)
3. Return clear error message on failure
4. Add test cases for edge cases

## Code Style Guide

### Naming Conventions

```python
# Functions: snake_case
def add_task(tasks: list[dict], title: str) -> int:
    pass

# Variables: snake_case
task_id = 1
user_input = "test"

# Constants: UPPER_SNAKE_CASE
MAX_TITLE_LENGTH = 200
DEFAULT_DESCRIPTION = ""

# Type aliases: PascalCase
Task = dict[str, int | str | bool]
TaskList = list[Task]
```

### Function Structure

```python
def function_name(arg1: Type1, arg2: Type2 = default) -> ReturnType:
    """
    Brief description of what function does.

    Args:
        arg1: Description of arg1
        arg2: Description of arg2

    Returns:
        Description of return value

    Raises:
        ValueError: When validation fails

    Examples:
        >>> function_name(val1, val2)
        expected_output
    """
    # Implementation here
    pass
```

### Error Handling

```python
# Use return values for expected failures
def get_task_by_id(tasks: list[dict], task_id: int) -> dict | None:
    # Return None if not found
    return None

# Use exceptions for validation errors
def add_task(tasks: list[dict], title: str) -> int:
    if not title.strip():
        raise ValueError("Title is required.")
    # ...
```

## Debugging Tips

### Common Issues

**Issue**: `KeyError` when accessing task fields
- **Cause**: Task dict missing required field
- **Fix**: Ensure all tasks have `id`, `title`, `description`, `completed`

**Issue**: ID collision after deletion
- **Cause**: Reusing deleted IDs
- **Fix**: Use `get_next_id()` which finds max + 1

**Issue**: Table layout breaks with long text
- **Cause**: Not truncating description
- **Fix**: Use `truncate_text()` in `print_task_table()`

**Issue**: Ctrl+C doesn't exit gracefully
- **Cause**: Missing KeyboardInterrupt handler
- **Fix**: Wrap main loop in try/except KeyboardInterrupt

### Debug Techniques

**Print tasks list**:
```python
import pprint
pprint.pprint(tasks)
```

**Check function return values**:
```python
result = add_task(tasks, "Test")
print(f"New task ID: {result}")
```

**Validate input parsing**:
```python
command, args = parse_command("update 5")
print(f"Command: '{command}', Args: '{args}'")
```

## Performance Considerations

### Expected Scale

- **Target**: Up to 100 tasks (< 1 second per operation)
- **Acceptable**: Up to 1000 tasks (< 10 seconds per operation)
- **Beyond Scope**: 10,000+ tasks (use database in future phase)

### Optimization Notes

- Linear search (O(n)) is acceptable for Phase I
- No indexing or caching needed
- Memory usage negligible (< 500 KB for 1000 tasks)
- Future optimization: hash map for O(1) lookup by ID

## Testing Strategy

### Manual Test Cases

**Add Task**:
- [ ] Add task with title only
- [ ] Add task with title and description
- [ ] Try add with empty title (should error)
- [ ] Try add with 201-char title (should error)

**List Tasks**:
- [ ] List when empty (should show "No tasks yet.")
- [ ] List with 1 task
- [ ] List with 10+ tasks
- [ ] List with very long description (should truncate)

**Update Task**:
- [ ] Update title only
- [ ] Update description only
- [ ] Update both fields
- [ ] Leave both blank (should keep existing)
- [ ] Try update invalid ID (should error)

**Delete Task**:
- [ ] Delete existing task
- [ ] Try delete invalid ID (should error)
- [ ] Verify list after deletion

**Complete/Uncomplete Task**:
- [ ] Mark task as complete
- [ ] Mark completed task as incomplete
- [ ] Try toggle invalid ID (should error)

**Quit**:
- [ ] Type "quit"
- [ ] Type "q"
- [ ] Press Ctrl+C

### Future Automated Tests (Phase II+)

```python
# Unit test example (for future)
import unittest

class TestAddTask(unittest.TestCase):
    def test_add_task_success(self):
        tasks = []
        task_id = add_task(tasks, "Test")
        self.assertEqual(task_id, 1)
        self.assertEqual(len(tasks), 1)

    def test_add_task_empty_title(self):
        tasks = []
        with self.assertRaises(ValueError):
            add_task(tasks, "")
```

## FAQs

**Q: Why no database?**
A: Phase I focuses on core logic without external dependencies. Persistence will be added in future phases.

**Q: Why single file?**
A: Simplicity for Phase I. Code is modular enough to extract into separate files later if needed.

**Q: Why not use argparse or cmd module?**
A: To minimize dependencies and keep code transparent. These modules may be considered in future phases.

**Q: Can I add features not in the spec?**
A: No - stick to constitution and spec requirements. Propose enhancements for future phases.

**Q: How do I contribute?**
A: Follow the constitution, implement according to spec, write clear code, test thoroughly.

## Next Steps

1. **For Implementation**: Run `/sp.tasks` to get detailed task breakdown
2. **For Understanding**: Read all docs in `specs/001-console-todo-app/` directory
3. **For Testing**: Follow manual test cases above after implementation
4. **For Questions**: Refer to spec, plan, and contracts docs first

## Resources

- **Spec**: `specs/001-console-todo-app/spec.md`
- **Plan**: `specs/001-console-todo-app/plan.md`
- **Data Model**: `specs/001-console-todo-app/data-model.md`
- **API Contracts**: `specs/001-console-todo-app/contracts/api.md`
- **Constitution**: `.specify/memory/constitution.md`
- **PEP 8**: https://pep8.org/
- **Python Type Hints**: https://docs.python.org/3/library/typing.html

## Summary

**Key Takeaways**:
- Simple, single-file console app with in-memory storage
- All code follows constitution (PEP 8, type hints, testable)
- Pure business logic separate from I/O functions
- Manual testing required before considering complete
- Ready for implementation via `/sp.tasks` command

**Time to Implement**: Estimated 2-4 hours for experienced Python developer

**Difficulty**: Beginner to Intermediate (straightforward logic, focus on code quality)
