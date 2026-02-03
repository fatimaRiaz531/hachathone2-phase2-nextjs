# Constitution – Phase I: In-Memory Python Console Todo App

## Core Principles
- Use only the Python standard library (no external dependencies).
- Follow PEP 8 style and use type hints everywhere.
- Clean, readable, maintainable code.
- All functions must be testable (pure functions where possible).
- Proper error handling with clear user messages.
- In-memory storage only (list of dictionaries).
- No persistent storage (no files, no database).

## Required Features (Basic Level)
1. Add a new task (title + optional description)
2. View all tasks (with ID, title, description, status)
3. Update task title or description
4. Delete a task by ID
5. Mark a task as complete or incomplete
6. Quit the application

## User Interface Rules
- Simple text-based menu loop
- Commands: add, list, update, delete, complete, quit
- Clear prompts and error messages
- Show task ID when listing tasks

## Task Data Structure
Each task is a dict with:
- id: int (auto-incrementing, starting at 1)
- title: str (required, 1–200 characters)
- description: str (optional, max 1000 characters)
- completed: bool (default False)
- created_at: str (ISO format, e.g., "2025-12-12T10:15:30")

## Project Structure
todo-phase1/
├── src/
│   └── todo.py          # Main application
├── README.md
├── CLAUDE.md
├── AGENTS.md
├── constitution.md
├── speckit.specify
├── speckit.plan
├── speckit.tasks
└── .spec-kit/