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
- `tasks.md` - Implementation tasks

## Future Enhancements (Planned for Phase II+)

- Data persistence (save/load from file or database)
- Task priorities and categories
- Due dates and reminders
- Search and filtering
- Automated tests
- Export to various formats
- Web or GUI interface

## License

This project is created as a demonstration of Spec-Driven Development (SDD) methodology.

## Author

Created following the Specify framework specifications.
