"""
User Management Routes for Todo Web App

This module implements user profile endpoints for viewing and updating user information.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from models import User
from schemas import UserProfileResponse, UserProfileUpdateRequest, TaskStatsResponse
from database import get_async_session
from middleware.auth import get_current_user
from typing import List


router = APIRouter()


@router.get("/users/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get current authenticated user profile.
    """
    # The current user is already verified by the get_current_user dependency
    user_response = UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

    return user_response


@router.put("/users/me", response_model=UserProfileResponse)
async def update_current_user_profile(
    user_update: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Update current user profile.
    """
    # Update user fields
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name

    # Update the updated_at timestamp
    current_user.updated_at = datetime.utcnow()

    # Commit changes
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    # Return updated user
    user_response = UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

    return user_response


@router.get("/users/me/tasks/stats", response_model=TaskStatsResponse)
async def get_task_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get task statistics for current user.
    """
    from models import Task
    from sqlalchemy import func, and_

    # Base query for user's tasks
    base_query = select(Task).where(Task.user_id == current_user.id)

    # Count total tasks
    total_query = await db.execute(base_query)
    total_tasks = len(total_query.scalars().all())

    # Count tasks by status
    pending_query = await db.execute(base_query.where(Task.status == "pending"))
    pending_tasks = len(pending_query.scalars().all())

    in_progress_query = await db.execute(base_query.where(Task.status == "in_progress"))
    in_progress_tasks = len(in_progress_query.scalars().all())

    completed_query = await db.execute(base_query.where(Task.status == "completed"))
    completed_tasks = len(completed_query.scalars().all())

    # Count overdue tasks (due date is in the past and status is not completed)
    overdue_query = await db.execute(
        base_query.where(
            and_(Task.due_date < datetime.utcnow(), Task.status != "completed")
        )
    )
    overdue_tasks = len(overdue_query.scalars().all())

    # Count high priority tasks
    high_priority_query = await db.execute(
        base_query.where(Task.priority == "high")
    )
    high_priority_tasks = len(high_priority_query.scalars().all())

    return TaskStatsResponse(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        high_priority_tasks=high_priority_tasks
    )