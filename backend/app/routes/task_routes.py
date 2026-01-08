from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..services.task_service import TaskService
from ..core.auth_deps import get_current_user_id


router = APIRouter(tags=["tasks"])


@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task: TaskCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new task for the authenticated user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create tasks for yourself"
        )

    task_service = TaskService()
    return task_service.create_task(task, current_user_id)


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(
    user_id: str,
    completed: bool = None,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get all tasks for the specified user.
    Optionally filter by completion status.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

    task_service = TaskService()
    return task_service.get_tasks_for_user(current_user_id, completed)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: str,  # Changed to str to match UUID
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific task by ID for the specified user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

    task_service = TaskService()
    task = task_service.get_task_for_user(task_id, current_user_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to access it"
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: str,  # Changed to str to match UUID
    task_update: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update a specific task by ID for the specified user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own tasks"
        )

    task_service = TaskService()
    updated_task = task_service.update_task(task_id, current_user_id, task_update)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return updated_task


@router.patch("/{user_id}/tasks/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: str,
    task_id: str,  # Changed to str to match UUID
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Toggle the completion status of a specific task for the specified user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only toggle completion for your own tasks"
        )

    task_service = TaskService()
    updated_task = task_service.toggle_task_completion(task_id, current_user_id)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return updated_task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: str,  # Changed to str to match UUID
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete a specific task by ID for the specified user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tasks"
        )

    task_service = TaskService()
    success = task_service.delete_task(task_id, current_user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to delete it"
        )

    return