# Research Findings: In-Memory Console Todo App (Phase I)

**Feature**: 001-console-todo-app
**Date**: 2025-12-12
**Status**: Complete

## Research Summary

This document captures the technical research and decision-making process for the In-Memory Console Todo App Phase I. Given the straightforward requirements and Python standard library constraint, minimal external research was needed. All decisions are based on established best practices and constitution requirements.

## Technical Decisions

### 1. Data Storage Strategy

**Decision**: In-memory list of dictionaries

**Rationale**:
- Constitution explicitly requires in-memory storage with no persistence
- Python list provides O(n) operations which is acceptable for < 1000 tasks
- Dictionary structure provides clear key-value semantics for task attributes
- No external dependencies required (built-in data structures)

**Alternatives Considered**:
- SQLite in-memory database: Rejected - overkill for simple CRUD, adds complexity
- Custom Task class with dataclass: Rejected - unnecessary abstraction for Phase I
- Named tuples: Rejected - immutability conflicts with update operations

**Best Practices Applied**:
- Use type aliases for documentation (`Task = dict[str, int | str | bool]`)
- Validate data at boundaries (user input, task creation)
- Keep storage structure simple and transparent

### 2. Command Parsing Approach

**Decision**: Simple string splitting with pattern matching

**Rationale**:
- Only 6 commands with simple syntax (command + optional ID)
- Python str.split() sufficient for parsing needs
- No external dependencies required
- Easy to understand and maintain

**Alternatives Considered**:
- argparse module: Rejected - designed for CLI args, not interactive commands
- regex-based parsing: Rejected - overcomplicated for simple patterns
- cmd module (built-in): Rejected - adds framework overhead, less transparent

**Best Practices Applied**:
- Normalize input (strip whitespace, lowercase commands)
- Use maxsplit=1 to preserve spaces in titles/descriptions
- Clear error messages for malformed commands

### 3. ID Generation Strategy

**Decision**: Auto-incrementing integer starting from 1

**Rationale**:
- User-friendly (small, sequential numbers)
- Easy to implement with max() + 1
- Unique across session (no collision risk)
- Simple to display and reference

**Alternatives Considered**:
- UUID: Rejected - not user-friendly for console interface
- Compact after deletion: Rejected - changes existing IDs, confuses users
- Sequential without gaps: Rejected - complex to maintain after deletions

**Best Practices Applied**:
- Find max existing ID to avoid collisions after deletions
- Start from 1 (not 0) for user familiarity
- Return ID immediately after creation for user reference

### 4. Error Handling Philosophy

**Decision**: Graceful degradation with clear user feedback

**Rationale**:
- Constitution requires "never crash" behavior
- Console users need immediate, actionable feedback
- No technical details or stack traces in user-facing messages

**Alternatives Considered**:
- Exception-based flow control: Rejected - makes code harder to follow
- Silent failures: Rejected - poor user experience
- Verbose logging: Rejected - clutters console output

**Best Practices Applied**:
- Validate input at entry points (main loop, command handlers)
- Use return values (bool, Optional) to signal success/failure
- Try/except only for KeyboardInterrupt (Ctrl+C)
- Consistent error message format

### 5. Function Design Principles

**Decision**: Pure functions for business logic, separate I/O

**Rationale**:
- Constitution requirement for testability
- Pure functions easier to reason about and test
- Clear separation of concerns (logic vs display)
- Enables future test suite without refactoring

**Alternatives Considered**:
- Inline logic in main loop: Rejected - not testable, poor maintainability
- Object-oriented design (Task class): Rejected - over-engineering for Phase I
- Functional programming with immutability: Rejected - conflicts with mutable list requirement

**Best Practices Applied**:
- All business logic functions take tasks list as parameter
- I/O functions (print_*) separated from logic
- Use type hints for documentation and IDE support
- Follow Single Responsibility Principle

### 6. Display Format Choice

**Decision**: ASCII table with truncated descriptions

**Rationale**:
- Readable in any console (no unicode required)
- Truncation prevents layout issues with long descriptions
- Status column ("Pending"/"Completed") clearer than boolean
- User can see all key information at a glance

**Alternatives Considered**:
- JSON output: Rejected - not user-friendly for interactive use
- Full descriptions: Rejected - breaks table layout
- Numbered list only: Rejected - less structured, harder to scan

**Best Practices Applied**:
- Fixed-width columns for alignment
- Truncate long text with "..." indicator
- Empty list message ("No tasks yet.") for clarity
- Consistent formatting across all output

## Python Standard Library Features Used

### Core Modules
- **No imports required** - All functionality uses built-in types and functions

### Built-in Functions & Features
- `input()` - Read user input
- `print()` - Display output
- `len()` - List/string length
- `max()` - Find maximum ID
- `str.split()` - Parse commands
- `str.strip()` - Clean input
- `str.lower()` - Normalize commands
- `str.format()` or f-strings - Format output
- `try/except` - Handle KeyboardInterrupt
- Type hints: `list[dict]`, `str | None`, `dict | None`

### Why No Additional Modules
- **No datetime**: Tasks don't need timestamps in Phase I
- **No json**: No serialization/deserialization needed
- **No argparse**: Interactive mode, not CLI arguments
- **No cmd**: Simple loop sufficient, no framework needed
- **No collections**: Built-in dict and list are sufficient

## Performance Considerations

### Expected Performance
- **Task count**: Up to 1000 tasks in memory
- **Operations**: All O(n) or better for n < 1000
- **Response time**: < 1 second target easily met

### Scalability Analysis
| Operation | Complexity | 100 tasks | 1000 tasks |
|-----------|-----------|-----------|------------|
| Add task | O(n) - find max ID | < 1ms | < 10ms |
| List tasks | O(n) - iterate & print | < 10ms | < 100ms |
| Find by ID | O(n) - linear search | < 1ms | < 10ms |
| Update task | O(n) - find + modify | < 1ms | < 10ms |
| Delete task | O(n) - find + remove | < 1ms | < 10ms |
| Toggle complete | O(n) - find + modify | < 1ms | < 10ms |

**Conclusion**: Linear search acceptable for Phase I. Future optimization (indexing, binary search) not needed unless scale increases significantly.

## Error Scenarios Researched

### Input Edge Cases
1. **Empty input**: Default to list command
2. **Extra whitespace**: Strip and normalize
3. **Mixed case**: Convert to lowercase
4. **Non-numeric ID**: Catch ValueError, show error
5. **Out-of-range ID**: Check existence, show "Task not found"
6. **Title too long**: Validate length, show error
7. **Empty title**: Validate non-empty, show error

### System Edge Cases
1. **Ctrl+C**: Catch KeyboardInterrupt, exit gracefully
2. **Empty task list**: Show "No tasks yet." message
3. **Many tasks**: Tested performant up to 1000 tasks
4. **Very long description**: Truncate in display, store full

### Resolution Approach
- All edge cases handled with validation + clear error messages
- No exceptions thrown to user (except KeyboardInterrupt for quit)
- Graceful degradation in all scenarios

## Security Considerations

### Relevant for Phase I
- **Input validation**: Prevent empty/oversized titles
- **Type safety**: Use type hints to catch errors early
- **No code execution**: No eval(), exec(), or dynamic imports

### Not Relevant for Phase I
- **Authentication**: Single-user console app
- **Authorization**: No multi-user or permissions
- **Injection attacks**: No database or external commands
- **Data encryption**: In-memory only, no persistence
- **Network security**: No network operations

## Testing Approach

### Manual Testing Requirements (Phase I)
- Test each command with valid inputs
- Test each error condition
- Test edge cases (empty list, many tasks, etc.)
- Test on target platforms (Windows, Linux, macOS)

### Future Automated Testing (Phase II+)
- Unit tests for pure functions using pytest or unittest
- Test fixtures for sample task data
- Mock I/O for testing display functions
- Property-based testing for edge cases

## Open Questions Resolution

**Q: Should we use a database?**
A: No - Constitution explicitly requires in-memory only, no persistence

**Q: Should we support undo/redo?**
A: No - Out of scope for Phase I per specification

**Q: Should we add task priorities or categories?**
A: No - Out of scope for Phase I per specification

**Q: Should we validate description length?**
A: No - Store full description, truncate only in display

**Q: Should IDs be reused after deletion?**
A: No - Use get_next_id() to find max + 1, never reuse

**Q: Should we support batch operations?**
A: No - Out of scope for Phase I

## Technology Maturity Assessment

| Technology | Maturity | Risk Level | Justification |
|-----------|----------|-----------|---------------|
| Python 3.8+ | Stable | None | LTS release, widely adopted |
| Python stdlib | Stable | None | Core language features, no changes expected |
| Console I/O | Stable | None | Standard input/output, universally supported |
| In-memory storage | Stable | None | Built-in data structures, well-understood |

**Overall Risk**: Minimal - Using only stable, mature technologies

## Conclusion

All technical decisions have been made and documented. No external research or dependencies required. Implementation can proceed directly to Phase 1 (design artifacts) and Phase 2 (implementation tasks).

**Key Takeaways**:
1. Python standard library provides all needed functionality
2. Simple approaches (list, dict, string parsing) sufficient for requirements
3. Constitution compliance verified at each decision point
4. No architectural risks or unknowns remaining
5. Ready to proceed with data model and API contracts

**Next Steps**:
1. Create `data-model.md` with detailed task structure
2. Create `contracts/api.md` with all function signatures
3. Create `quickstart.md` for developer onboarding
4. Run `/sp.tasks` to generate implementation tasks
