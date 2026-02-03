# Code Generation Skill

Generate implementation code from specifications following project guidelines.

## Input
$ARGUMENTS - Spec reference and target (e.g., "@specs/api/rest-endpoints.md for POST tasks")

## Instructions

Based on the provided spec reference: **$ARGUMENTS**

### 1. Parse Input

Extract from arguments:
- **Spec file path**: The referenced specification file
- **Target endpoint/feature**: Specific section to implement
- **Language**: Infer from project context (default: Python/FastAPI for Phase 2)

### 2. Read Specification

1. Load the referenced spec file
2. Identify the relevant section for the target feature
3. Extract:
   - API contracts (endpoints, methods, paths)
   - Request/response schemas
   - Validation rules
   - Error handling requirements
   - Authentication requirements

### 3. Generate Code

Produce implementation code with mandatory comment headers:

```python
# =============================================================================
# [Task]: T-XXX
# [From]: @specs/<feature>/spec.md#<section>
# [Description]: Brief description of what this code implements
# =============================================================================
```

### 4. Code Structure (Python/FastAPI)

```python
# =============================================================================
# [Task]: T-001
# [From]: @specs/api/rest-endpoints.md#post-tasks
# [Description]: Create new task endpoint
# =============================================================================

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api", tags=["tasks"])


# Request/Response Models
# [From]: @specs/api/rest-endpoints.md#schemas
class TaskCreate(BaseModel):
    """Task creation request schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Task response schema."""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    user_id: int


# Endpoint Implementation
# [From]: @specs/api/rest-endpoints.md#post-tasks
@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task"
)
async def create_task(
    user_id: int,
    task: TaskCreate,
    # current_user: User = Depends(get_current_user)  # Auth dependency
):
    """
    Create a new task for the authenticated user.

    - **title**: Task title (required)
    - **description**: Optional task description
    - **due_date**: Optional due date
    """
    # Implementation here
    pass
```

### 5. Comment Standards

Every code block MUST include:

| Comment Tag | Purpose | Example |
|-------------|---------|---------|
| `[Task]` | Task ID from tasks.md | `T-001`, `T-002` |
| `[From]` | Spec section reference | `@specs/api/rest-endpoints.md#post-tasks` |
| `[Description]` | Brief implementation note | `Create new task endpoint` |

### 6. CLAUDE.md Compliance

Follow these guidelines from CLAUDE.md:
- Smallest viable change
- No hardcoded secrets (use `.env`)
- Explicit error paths
- Testable code with clear acceptance criteria
- Code references with `file_path:line_number`

### 7. Output Format

```
## Generated Code

**Spec Source:** [spec file path]
**Target:** [endpoint/feature name]
**Language:** [Python/FastAPI | TypeScript/Next.js | etc.]

### Implementation

\`\`\`[language]
[generated code with task comments]
\`\`\`

### Files to Create/Modify

- `path/to/file.py` - [description]

### Dependencies

- [any new packages needed]

### Tests Required

- [ ] Test case 1
- [ ] Test case 2
```

## Example Usage

```
/CodeGenSkill @specs/api/rest-endpoints.md for POST /api/{user_id}/tasks
```

```
/CodeGenSkill @specs/auth/spec.md for login endpoint
```

## Supported Languages

| Stack | Use Case |
|-------|----------|
| Python/FastAPI | Backend API endpoints |
| Python/SQLModel | Database models |
| TypeScript/Next.js | Frontend pages/components |
| TypeScript/React | UI components |
