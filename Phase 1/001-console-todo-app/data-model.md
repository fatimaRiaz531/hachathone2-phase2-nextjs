# Data Model: In-Memory Console Todo App (Phase I)

**Feature**: 001-console-todo-app
**Date**: 2025-12-12
**Status**: Complete

## Overview

This document defines the data structures and their relationships for the Todo App Phase I. The system uses in-memory storage with simple Python built-in types (list, dict) per constitution requirements.

## Core Entities

### Task

A task represents a single todo item with a unique identifier, descriptive content, and completion status.

#### Type Definition

```python
from typing import TypeAlias

# Type alias for documentation and type checking
Task: TypeAlias = dict[str, int | str | bool]

# Example task dictionary:
# {
#     'id': 1,
#     'title': 'Buy groceries',
#     'description': 'Milk, eggs, bread, and coffee',
#     'completed': False
# }
```

#### Field Specifications

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `id` | int | Yes | Auto-generated | > 0, unique | Auto-incrementing unique identifier starting from 1 |
| `title` | str | Yes | None | 1-200 chars, non-empty | Short task description, validated on creation |
| `description` | str | No | `""` | No limit | Optional detailed description, truncated to 30 chars in display |
| `completed` | bool | Yes | `False` | True/False | Task completion status, toggled by complete/uncomplete commands |

#### Field Details

**`id` (int)**
- **Purpose**: Unique identifier for task lookup and user reference
- **Generation**: Auto-incrementing based on max existing ID (see ID Generation Strategy)
- **Persistence**: Unique within session, not reused after deletion
- **Display**: Shown in all task listings and user feedback
- **Validation**: Must be positive integer

**`title` (str)**
- **Purpose**: Primary task description visible in list view
- **Constraints**:
  - Minimum length: 1 character
  - Maximum length: 200 characters
  - Must be non-empty (no whitespace-only strings)
- **Display**: Full text shown in task listings (may wrap in table)
- **Validation**: Checked on add and update operations
- **Error message**: "Title is required." (empty) or "Title must be 1-200 characters." (too long)

**`description` (str)**
- **Purpose**: Optional detailed information about the task
- **Constraints**: No length limit (truncated only for display)
- **Display**: Truncated to 30 characters with "..." in list view
- **Default**: Empty string `""` if not provided
- **Validation**: None (always valid)
- **Storage**: Full text stored in memory, never truncated

**`completed` (bool)**
- **Purpose**: Track task completion status
- **Values**: `True` (completed) or `False` (pending)
- **Default**: `False` when task is created
- **Display**: Shown as "Completed" or "Pending" in list view
- **Operations**: Toggled by `complete` and `uncomplete` commands

## Data Storage Structure

### Tasks Collection

**Type**: `list[dict]`

**Structure**:
```python
tasks: list[dict] = []

# Example with multiple tasks:
tasks = [
    {'id': 1, 'title': 'Buy groceries', 'description': 'Milk, eggs, bread', 'completed': False},
    {'id': 2, 'title': 'Finish report', 'description': '', 'completed': True},
    {'id': 5, 'title': 'Call dentist', 'description': 'Schedule checkup', 'completed': False},
]
```

**Characteristics**:
- **Order**: Tasks maintain insertion order (Python 3.7+ dict ordering guarantee)
- **Indexing**: No separate index structure (linear search acceptable for < 1000 tasks)
- **Uniqueness**: IDs are unique, enforced by ID generation logic
- **Gaps**: ID sequence may have gaps after deletions (e.g., 1, 2, 5 after deleting 3 and 4)

**Operations**:
- **Add**: Append new task dict to end of list
- **Read**: Iterate list to find task by ID
- **Update**: Find task dict by ID, modify fields in place
- **Delete**: Remove task dict from list by index

## ID Generation Strategy

### Algorithm

```python
def get_next_id(tasks: list[dict]) -> int:
    """
    Generate the next available task ID.

    Returns 1 for empty list, otherwise returns max existing ID + 1.
    Ensures IDs are never reused, even after deletions.
    """
    if not tasks:
        return 1
    return max(task['id'] for task in tasks) + 1
```

### Characteristics

- **Starting Point**: IDs begin at 1 (not 0) for user familiarity
- **Increment**: Always increment by 1 from current maximum
- **Gaps**: Allow gaps in sequence after deletions (intentional)
- **Uniqueness**: Guaranteed unique within session
- **Simplicity**: O(n) operation acceptable for task count < 1000

### Examples

| State | Tasks | Next ID | Rationale |
|-------|-------|---------|-----------|
| Empty list | `[]` | 1 | Default starting point |
| Initial tasks | `[{id:1}, {id:2}]` | 3 | Max is 2, return 3 |
| After deletion | `[{id:1}, {id:3}]` | 4 | Max is 3, return 4 (not 2) |
| Non-sequential | `[{id:5}, {id:2}]` | 6 | Max is 5, return 6 |

### Design Rationale

**Why Not Reuse IDs?**
- Avoids user confusion (deleted task 2 doesn't become new task 2)
- Simplifies logic (no need to track "available" IDs)
- Matches user expectations (IDs feel permanent)

**Why Not Fill Gaps?**
- Adds complexity (need to track gaps)
- Negligible benefit (IDs are cheap)
- Harder to test and reason about

**Why Start at 1?**
- User-friendly (common convention)
- Avoids confusion with zero-indexing
- Matches other task management tools

## Data Validation Rules

### Creation Validation (add_task)

```python
# Title validation
if not title or len(title.strip()) == 0:
    raise ValueError("Title is required.")
if len(title) > 200:
    raise ValueError("Title must be 1-200 characters.")

# Description validation (always valid)
# No validation needed - any string accepted

# ID generation (automatic)
task_id = get_next_id(tasks)

# Completed status (default)
completed = False
```

### Update Validation (update_task)

```python
# Task existence
if task_id not in [t['id'] for t in tasks]:
    return False  # Task not found

# Title validation (if provided)
if title is not None:
    if not title or len(title.strip()) == 0:
        raise ValueError("Title is required.")
    if len(title) > 200:
        raise ValueError("Title must be 1-200 characters.")

# Description validation (if provided)
# No validation needed - any string accepted
```

### ID Validation (all ID-based operations)

```python
# Must be integer
try:
    task_id = int(id_str)
except ValueError:
    return False  # Invalid ID format

# Must exist in tasks list
if task_id not in [t['id'] for t in tasks]:
    return False  # Task not found
```

## Display Formatting

### List View Format

**Table Structure**:
```text
ID | Title                  | Description (truncated) | Status
---+------------------------+-------------------------+-----------
1  | Buy groceries          | Milk, eggs, bread       | Pending
2  | Finish report          |                         | Completed
5  | Call dentist           | Schedule checkup        | Pending
```

**Column Specifications**:

| Column | Width | Alignment | Truncation | Source Field |
|--------|-------|-----------|------------|--------------|
| ID | 3-5 chars | Right | None | task['id'] |
| Title | 20-30 chars | Left | No (may wrap) | task['title'] |
| Description | 30 chars | Left | Yes, with "..." | task['description'][:27] + "..." |
| Status | 10 chars | Left | None | "Completed" if task['completed'] else "Pending" |

### Truncation Logic

```python
def truncate_text(text: str, max_length: int) -> str:
    """
    Truncate text to max_length, adding "..." if truncated.

    Examples:
        truncate_text("Short", 30) -> "Short"
        truncate_text("This is a very long description", 30) -> "This is a very long descri..."
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."
```

### Empty List Case

```text
No tasks yet.
```

## State Transitions

### Task Lifecycle

```text
┌─────────────┐
│   Created   │
│ (add_task)  │
│ completed:  │
│   False     │
└──────┬──────┘
       │
       ├────────────────────────────────┐
       │                                │
       ▼                                ▼
┌─────────────┐                  ┌─────────────┐
│   Pending   │                  │  Completed  │
│ completed:  │◄─────────────────┤ completed:  │
│   False     │  (uncomplete)    │   True      │
└──────┬──────┘                  └──────┬──────┘
       │          (complete)            │
       └────────────────────────────────┘
       │                                │
       ▼                                ▼
┌─────────────┐                  ┌─────────────┐
│   Deleted   │                  │   Deleted   │
│ (delete_    │                  │ (delete_    │
│    task)    │                  │    task)    │
└─────────────┘                  └─────────────┘
```

### Valid Transitions

| From State | To State | Command | Effect |
|-----------|----------|---------|--------|
| (none) | Pending | `add` | Create new task with completed=False |
| Pending | Completed | `complete` | Set completed=True |
| Completed | Pending | `uncomplete` | Set completed=False |
| Pending | Pending | `update` | Modify title/description, keep completed=False |
| Completed | Completed | `update` | Modify title/description, keep completed=True |
| Pending | (deleted) | `delete` | Remove from tasks list |
| Completed | (deleted) | `delete` | Remove from tasks list |

## Data Integrity Constraints

### Invariants (must always be true)

1. **Unique IDs**: No two tasks have the same ID
2. **Positive IDs**: All task IDs are positive integers (> 0)
3. **Non-empty titles**: All tasks have non-empty titles (length > 0)
4. **Valid completed flag**: All tasks have boolean completed field
5. **All fields present**: Every task dict has all 4 required keys

### Enforcement Strategy

- **At Creation**: Validation in `add_task()` ensures new tasks meet constraints
- **At Update**: Validation in `update_task()` prevents invalid modifications
- **At Runtime**: Type hints guide correct usage, IDE catches type errors early
- **No Enforcement Needed**: ID uniqueness guaranteed by generation algorithm

## Memory Footprint Estimation

### Per-Task Memory

```python
# Approximate memory per task (Python 3.8+)
sizeof(dict) = 232 bytes (base dict object)
sizeof(int) = 28 bytes (id field)
sizeof(str) = 50 + len(title) + len(description) bytes
sizeof(bool) = 28 bytes (completed field)

# Average task (20 char title, 50 char description):
Average = 232 + 28 + (50 + 20 + 50) + 28 = 408 bytes

# Range:
Minimum = ~350 bytes (shortest title, no description)
Maximum = ~500 bytes (max title, long description)
```

### Total Memory Usage

| Task Count | Estimated Memory | Notes |
|-----------|------------------|-------|
| 10 tasks | ~4 KB | Typical small session |
| 100 tasks | ~40 KB | Target performance threshold |
| 1000 tasks | ~400 KB | Upper limit for Phase I |
| 10000 tasks | ~4 MB | Beyond intended scope, still manageable |

**Conclusion**: Memory usage negligible for intended scale (< 1000 tasks). No optimization needed.

## Future Considerations (Out of Scope for Phase I)

### Potential Enhancements
- **Created timestamp**: Add `created_at` field with ISO datetime string
- **Updated timestamp**: Add `updated_at` field, updated on each modification
- **Priority levels**: Add `priority` field (low, medium, high)
- **Tags/categories**: Add `tags` field as list of strings
- **Due dates**: Add `due_date` field with date string
- **Subtasks**: Add `subtasks` field as list of child task IDs

### Migration Strategy
- All future fields would be **optional** to maintain backward compatibility
- Existing task dicts would receive default values for new fields
- Core structure (id, title, description, completed) remains unchanged

## Summary

**Key Points**:
- Simple, transparent data model using Python built-in types
- Task represented as dict with 4 fields: id, title, description, completed
- ID generation ensures uniqueness via max + 1 strategy
- Validation at boundaries (add, update) ensures data integrity
- Memory footprint negligible for intended scale (< 1000 tasks)
- Design ready for future enhancement without breaking changes

**Next Steps**:
- Define function contracts in `contracts/api.md`
- Create developer quickstart guide in `quickstart.md`
- Generate implementation tasks with `/sp.tasks`
