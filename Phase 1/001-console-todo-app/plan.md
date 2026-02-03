# Implementation Plan: In-Memory Console Todo App (Phase I)

**Branch**: `001-console-todo-app` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-console-todo-app/spec.md`

## Summary

Build a single-file Python console application for managing todo tasks in memory. The application provides an interactive command-line interface with commands to add, list, update, delete, and complete tasks. All data is stored in memory as a list of dictionaries, with no external dependencies beyond the Python standard library.

## Technical Context

**Language/Version**: Python 3.8+
**Primary Dependencies**: Python standard library only (no external packages)
**Storage**: In-memory list of dictionaries
**Testing**: Manual testing initially (tests to be added in later phases)
**Target Platform**: Cross-platform console (Windows, Linux, macOS)
**Project Type**: Single-file console application
**Performance Goals**: Instant response for up to 100 tasks (< 1 second)
**Constraints**: No external dependencies, no persistence, console I/O only
**Scale/Scope**: Single user, single session, up to 1000 tasks in memory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **Python Standard Library Only**: No external dependencies - PASS
✅ **Clean, Readable Code**: PEP 8, type hints, descriptive names - PASS
✅ **In-Memory Storage**: List of dicts with task structure - PASS
✅ **Console Interface Only**: Interactive menu with defined commands - PASS
✅ **Test-First Development**: Functions designed for testability - PASS
✅ **Proper Error Handling**: Validation, graceful failures, clear messages - PASS

### Code Quality Standards Compliance

✅ **Structure**: src/todo.py + README.md + CLAUDE.md - PASS
✅ **Function Design**: SRP, type hints, docstrings, clear contracts - PASS
✅ **Data Model**: Task dict with id, title, description, completed - PASS

### Technical Constraints Compliance

✅ **Python 3.8+ compatibility** - PASS
✅ **Standard library only** - PASS
✅ **No configuration files** - PASS
✅ **Console I/O only** - PASS

### Scope Limitations Compliance

✅ **No data persistence** - PASS
✅ **No multi-user support** - PASS
✅ **No advanced features** (priorities, dates, tags, etc.) - PASS

**Overall Gate Status**: ✅ PASS - All constitution requirements met

## Project Structure

### Documentation (this feature)

```text
specs/001-console-todo-app/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (data structures)
├── contracts/           # Phase 1 output (function signatures)
│   └── api.md           # Function contracts
├── quickstart.md        # Phase 1 output (getting started guide)
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
└── todo.py              # Main application (all code in one file)

tests/                   # Future: tests to be added later
└── (empty for Phase I)

README.md                # User documentation
CLAUDE.md                # Development guidelines (already exists)
```

**Structure Decision**: Single-file application as specified in constitution. All business logic, I/O handling, and main loop in `src/todo.py`. Modular function design allows future extraction into separate modules if needed in later phases.

## Complexity Tracking

> No violations - all constitution requirements are met without exceptions.

## High-Level Architecture

### System Overview

```text
┌─────────────────────────────────────────┐
│         Console Application             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Main Loop (Interactive)       │ │
│  │  - Display menu                   │ │
│  │  - Read command                   │ │
│  │  - Parse input                    │ │
│  │  - Route to handler               │ │
│  └───────────────────────────────────┘ │
│                │                        │
│                ▼                        │
│  ┌───────────────────────────────────┐ │
│  │     Command Handlers              │ │
│  │  - add_task()                     │ │
│  │  - list_tasks()                   │ │
│  │  - update_task()                  │ │
│  │  - delete_task()                  │ │
│  │  - toggle_complete()              │ │
│  └───────────────────────────────────┘ │
│                │                        │
│                ▼                        │
│  ┌───────────────────────────────────┐ │
│  │     Data Storage                  │ │
│  │  tasks: list[dict]                │ │
│  │  - In-memory only                 │ │
│  │  - Lost on exit                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Main loop receives command string
2. **Parsing** → Command and arguments extracted
3. **Validation** → Input validated (ID exists, title non-empty, etc.)
4. **Execution** → Appropriate handler function called
5. **State Update** → Tasks list modified (add/update/delete)
6. **Feedback** → Confirmation or error message printed
7. **Loop** → Return to step 1 until quit

### Key Design Decisions

#### 1. Single-File Architecture
- **Decision**: All code in `src/todo.py`
- **Rationale**: Constitution requirement, simplicity for Phase I, easy to run
- **Alternatives Considered**: Multi-file modules (rejected - premature for Phase I)

#### 2. Pure Functions for Business Logic
- **Decision**: Separate pure functions from I/O
- **Rationale**: Testability, constitution requirement for test-first design
- **Alternatives Considered**: Inline logic in main loop (rejected - not testable)

#### 3. In-Memory List of Dicts
- **Decision**: `tasks: list[dict]` with no persistence
- **Rationale**: Constitution requirement, simplicity, no external dependencies
- **Alternatives Considered**: SQLite, JSON file (rejected - out of scope for Phase I)

#### 4. Type Hints Throughout
- **Decision**: All functions have complete type annotations
- **Rationale**: Constitution requirement (PEP 8), better IDE support, documentation
- **Alternatives Considered**: No type hints (rejected - violates constitution)

#### 5. Command Parsing Strategy
- **Decision**: Simple string parsing with split() and pattern matching
- **Rationale**: No external dependencies, sufficient for simple commands
- **Alternatives Considered**: argparse module (rejected - overkill for 6 commands)

## Component Details

### 1. Task Model

**Type Definition**:
```python
Task = dict[str, int | str | bool]
# Keys: 'id' (int), 'title' (str), 'description' (str), 'completed' (bool)
```

**Field Specifications**:
- `id`: Auto-incrementing integer starting from 1, unique across session
- `title`: Required string, 1-200 characters, validated on input
- `description`: Optional string, no length limit, truncated to 30 chars in list view
- `completed`: Boolean, default False, toggled by complete/uncomplete commands

### 2. Core Functions

#### Task Operations (Pure Functions)

**`add_task(tasks: list[dict], title: str, description: str = "") -> int`**
- Validates title (non-empty, 1-200 chars)
- Generates next available ID
- Creates task dict with completed=False
- Appends to tasks list
- Returns new task ID

**`get_task_by_id(tasks: list[dict], task_id: int) -> dict | None`**
- Searches tasks list for matching ID
- Returns task dict if found, None otherwise
- Used by all ID-based operations

**`update_task(tasks: list[dict], task_id: int, title: str | None = None, description: str | None = None) -> bool`**
- Finds task by ID
- Updates only provided fields (None = keep existing)
- Validates title if provided
- Returns True if successful, False if task not found

**`delete_task(tasks: list[dict], task_id: int) -> bool`**
- Finds task by ID
- Removes from tasks list
- Returns True if successful, False if task not found

**`toggle_complete(tasks: list[dict], task_id: int) -> bool`**
- Finds task by ID
- Flips completed boolean
- Returns True if successful, False if task not found

#### Display Functions (I/O)

**`print_menu() -> None`**
- Prints available commands
- Shows command syntax with examples

**`print_task_table(tasks: list[dict]) -> None`**
- Formats tasks as table with columns: ID | Title | Description | Status
- Truncates description to 30 chars
- Shows "Pending" or "Completed" status
- Handles empty list case ("No tasks yet.")

**`list_tasks(tasks: list[dict]) -> None`**
- Wrapper that calls print_task_table
- Provides consistent interface for main loop

#### Helper Functions

**`get_next_id(tasks: list[dict]) -> int`**
- Finds maximum ID in current tasks
- Returns max + 1, or 1 if empty
- Ensures unique IDs even after deletions

**`validate_title(title: str) -> bool`**
- Checks title is non-empty
- Checks length 1-200 characters
- Returns True if valid

**`truncate_text(text: str, max_length: int) -> str`**
- Truncates string to max_length
- Adds "..." if truncated
- Used for description display

### 3. Main Loop

**`main() -> None`**
- Initializes empty tasks list
- Wraps loop in try/except for KeyboardInterrupt
- Infinite loop:
  1. Print menu
  2. Read command input (strip, lowercase)
  3. Parse command and arguments
  4. Route to appropriate handler
  5. Handle errors gracefully
  6. Print feedback
- Exits on "quit", "q", or Ctrl+C with "Goodbye!"

**Command Parsing**:
```python
command_parts = input_str.strip().lower().split(maxsplit=1)
command = command_parts[0]
args = command_parts[1] if len(command_parts) > 1 else ""
```

**Routing Logic**:
- `add` → Prompt for title/description, call add_task()
- `list` or empty → Call list_tasks()
- `update <id>` → Prompt for new values, call update_task()
- `delete <id>` → Call delete_task()
- `complete <id>` → Call toggle_complete() to mark complete
- `uncomplete <id>` → Call toggle_complete() to mark incomplete
- `quit` or `q` → Exit loop
- Unknown → Print error with available commands

### 4. Error Handling Strategy

**Input Validation**:
- Empty title → "Title is required."
- Title too long → "Title must be 1-200 characters."
- Invalid ID format → "Invalid task ID."
- Task not found → "Task not found."
- Unknown command → "Unknown command. Try: add, list, update, delete, complete, quit"

**Exception Handling**:
- `KeyboardInterrupt` (Ctrl+C) → Caught in main(), graceful exit
- `ValueError` (ID parsing) → Caught and converted to user-friendly error
- No other exceptions expected (pure functions, no I/O errors in memory operations)

**Error Message Principles**:
- Clear and actionable
- No technical jargon or stack traces
- Suggest next steps when appropriate

## Non-Functional Requirements

### Performance

- **Target**: < 1 second response for all operations with 100 tasks
- **Strategy**: Linear search acceptable for Phase I (no indexing needed)
- **Measurement**: Manual timing during testing

### Code Quality

- **PEP 8 Compliance**: Use `pycodestyle` or IDE linter
- **Type Coverage**: 100% of function signatures
- **Function Length**: Target < 20 lines per function
- **Docstrings**: All public functions documented

### Usability

- **Prompts**: Clear, concise, with examples
- **Feedback**: Confirmation message for every action
- **Error Messages**: User-friendly, no crashes
- **Menu**: Always visible, easy to reference

## Implementation Order

### Phase 0: Research & Planning ✅ (Complete)

All technical decisions made, no unknowns remaining. Python standard library documentation sufficient for implementation.

### Phase 1: Design & Contracts (Current)

1. Define task data structure and type aliases → `data-model.md`
2. Document all function signatures and contracts → `contracts/api.md`
3. Create quickstart guide → `quickstart.md`

### Phase 2: Implementation (Next - via /sp.tasks)

Will be defined in `tasks.md` after /sp.plan completes:

1. Set up project structure (create src/todo.py)
2. Implement task model and helper functions
3. Implement core CRUD operations
4. Implement display functions
5. Implement main loop and command routing
6. Add error handling throughout
7. Manual testing and refinement
8. Create README.md with usage instructions

## Testing Strategy

### Phase I (Manual)

- Test each command with valid inputs
- Test error cases (invalid IDs, empty titles, etc.)
- Test edge cases (empty list, 100+ tasks, long descriptions)
- Test quit methods (quit, q, Ctrl+C)

### Future Phases (Automated)

- Unit tests for pure functions (add_task, update_task, etc.)
- Integration tests for command flow
- Test fixtures for sample task data
- Mocking for I/O operations

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| ID collision after deletions | Medium | Use get_next_id() to find max existing ID |
| Long titles break table layout | Low | Truncate in display, store full value |
| Memory usage with many tasks | Low | Accept for Phase I, document limit of ~1000 tasks |
| Input parsing edge cases | Medium | Comprehensive manual testing of various inputs |
| Ctrl+C handling varies by OS | Low | Use try/except KeyboardInterrupt, test on target platforms |

## Open Questions

None - all requirements clear from specification and constitution.

## Dependencies

None - Python 3.8+ standard library only.

## Deployment

Run directly with: `python src/todo.py`

No build step, no packaging, no distribution needed for Phase I.

## Success Criteria

Implementation complete when:

1. ✅ All commands work as specified
2. ✅ All error cases handled gracefully
3. ✅ Code passes PEP 8 linting
4. ✅ All functions have type hints
5. ✅ Manual testing scenarios pass
6. ✅ README.md documents usage
7. ✅ No external dependencies

## Next Steps

1. Generate `research.md` (Phase 0 - no research needed, document rationale)
2. Generate `data-model.md` (Phase 1)
3. Generate `contracts/api.md` (Phase 1)
4. Generate `quickstart.md` (Phase 1)
5. Run `/sp.tasks` to create implementation tasks
