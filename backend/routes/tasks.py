"""
Task Management Routes for Todo Web App (Simplified for Phase II)

This module implements simplified task CRUD operations without authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from datetime import datetime, timezone
from typing import Optional, List
import uuid
from models import Task, User
from schemas import (
    TaskCreateRequest, TaskUpdateRequest, TaskPartialUpdateRequest,
    TaskResponse, TaskListResponse
)
from database import get_async_session
from middleware.auth import get_current_user, debug_log

# Create router for task endpoints
router = APIRouter()

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Create a new task."""
    new_task = Task(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        status=task_data.status.value if hasattr(task_data.status, 'value') else task_data.status,
        priority=task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    return new_task

@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    status_filter: Optional[str] = Query(None, description="Filter by task status"),
    priority_filter: Optional[str] = Query(None, description="Filter by task priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """List all tasks with optional filters."""
    query = select(Task).where(Task.user_id == current_user.id)

    if status_filter:
        query = query.where(Task.status == status_filter)
    if priority_filter:
        query = query.where(Task.priority == priority_filter)
    if search:
        query = query.where(or_(Task.title.contains(search), Task.description.contains(search)))

    # Pagination metadata
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar()

    offset = (page - 1) * limit
    query = query.order_by(Task.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    tasks = result.scalars().all()

    meta = {
        "total": total_count,
        "page": page,
        "limit": limit,
        "has_next": (page * limit) < total_count
    }

    return TaskListResponse(data=tasks, meta=meta)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get a specific task."""
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    debug_log(f"DEBUG TASK: PUT /tasks/{task_id} for user {current_user.id}")
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        # Check if task exists for ANY user to debug ownership
        all_query = select(Task).where(Task.id == task_id)
        all_result = await db.execute(all_query)
        any_task = all_result.scalar_one_or_none()
        if any_task:
            debug_log(f"DEBUG TASK: Task {task_id} exists but belongs to user {any_task.user_id}")
        else:
            debug_log(f"DEBUG TASK: Task {task_id} NOT FOUND in database at all")
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = task_data.title
    task.description = task_data.description
    task.due_date = task_data.due_date
    task.status = task_data.status.value if hasattr(task_data.status, 'value') else task_data.status
    task.priority = task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority
    task.updated_at = datetime.utcnow()

    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def partial_update_task(
    task_id: str,
    task_data: TaskPartialUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Partial update of a task."""
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.status is not None:
        task.status = task_data.status.value if hasattr(task_data.status, 'value') else task_data.status
    if task_data.priority is not None:
        task.priority = task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority

    task.updated_at = datetime.utcnow()
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    debug_log(f"DEBUG TASK: DELETE /tasks/{task_id} for user {current_user.id}")
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        debug_log(f"DEBUG TASK: DELETE 404 for {task_id}")
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return

@router.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Quickly mark a task as complete."""
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "completed"
    task.updated_at = datetime.utcnow()
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task