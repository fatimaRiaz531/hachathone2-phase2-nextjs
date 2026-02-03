"""
Task Management Routes for Todo Web App

This module implements task CRUD operations with user isolation and filtering.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from datetime import datetime
from typing import Optional, List
from uuid import UUID
import uuid
from ..models import Task, User
from ..schemas import (
    TaskCreateRequest, TaskUpdateRequest, TaskPartialUpdateRequest,
    TaskResponse, TaskListResponse, TaskStatsResponse
)
from ..database import get_async_session
from ..middleware.auth import get_current_user


router = APIRouter()


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Create a new task for the authenticated user.
    """
    # Create new task with current user as owner
    new_task = Task(
        id=str(uuid.uuid4()),
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        status=task_data.status.value if hasattr(task_data.status, 'value') else task_data.status,
        priority=task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # Return the created task
    task_response = TaskResponse(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        due_date=new_task.due_date,
        status=new_task.status,
        priority=new_task.priority,
        user_id=new_task.user_id,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at
    )

    return task_response


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    status_filter: Optional[str] = Query(None, description="Filter by task status"),
    priority_filter: Optional[str] = Query(None, description="Filter by task priority"),
    due_date_before: Optional[datetime] = Query(None, description="Filter tasks due before date"),
    due_date_after: Optional[datetime] = Query(None, description="Filter tasks due after date"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query("created_at", description="Sort field"),
    order: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    List tasks for authenticated user with optional filters and pagination.
    """
    # Build query with user isolation
    query = select(Task).where(Task.user_id == current_user.id)

    # Apply filters
    if status_filter:
        query = query.where(Task.status == status_filter)

    if priority_filter:
        query = query.where(Task.priority == priority_filter)

    if due_date_before:
        query = query.where(Task.due_date <= due_date_before)

    if due_date_after:
        query = query.where(Task.due_date >= due_date_after)

    if search:
        query = query.where(
            or_(
                Task.title.contains(search),
                Task.description.contains(search)
            )
        )

    # Handle sorting
    if sort == "created_at":
        sort_field = Task.created_at
    elif sort == "due_date":
        sort_field = Task.due_date
    elif sort == "priority":
        sort_field = Task.priority
    else:
        sort_field = Task.created_at

    # Apply ordering
    if order.lower() == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    # Get total count for pagination metadata
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar()

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    # Execute query
    result = await db.execute(query)
    tasks = result.scalars().all()

    # Prepare response data
    task_list = []
    for task in tasks:
        task_response = TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            status=task.status,
            priority=task.priority,
            user_id=task.user_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        task_list.append(task_response)

    # Calculate pagination metadata
    has_next = (page * limit) < total_count
    meta = {
        "total": total_count,
        "page": page,
        "limit": limit,
        "has_next": has_next
    }

    return TaskListResponse(data=task_list, meta=meta)


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get a specific task by ID for the authenticated user.
    """
    # Verify task exists and belongs to user
    query = select(Task).where(
        and_(Task.id == task_id, Task.user_id == current_user.id)
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return task
    task_response = TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        status=task.status,
        priority=task.priority,
        user_id=task.user_id,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return task_response


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Update a task completely (full replacement) for the authenticated user.
    """
    # Verify task exists and belongs to user
    query = select(Task).where(
        and_(Task.id == task_id, Task.user_id == current_user.id)
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update task fields
    task.title = task_data.title
    task.description = task_data.description
    task.due_date = task_data.due_date
    task.status = task_data.status.value if hasattr(task_data.status, 'value') else task_data.status
    task.priority = task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority
    task.updated_at = datetime.utcnow()

    # Commit changes
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Return updated task
    task_response = TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        status=task.status,
        priority=task.priority,
        user_id=task.user_id,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return task_response


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def partial_update_task(
    task_id: str,
    task_data: TaskPartialUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Partially update a task for the authenticated user.
    """
    # Verify task exists and belongs to user
    query = select(Task).where(
        and_(Task.id == task_id, Task.user_id == current_user.id)
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update only provided fields
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

    # Commit changes
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Return updated task
    task_response = TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        status=task.status,
        priority=task.priority,
        user_id=task.user_id,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return task_response


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Delete a task by ID for the authenticated user.
    """
    # Verify task exists and belongs to user
    query = select(Task).where(
        and_(Task.id == task_id, Task.user_id == current_user.id)
    )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete the task
    await db.delete(task)
    await db.commit()

    # Return 204 No Content
    return