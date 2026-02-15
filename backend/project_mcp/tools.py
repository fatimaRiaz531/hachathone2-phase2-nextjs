
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid
from sqlmodel import select, or_, and_
from database import get_async_session, async_engine
from models import Task, TaskStatus, TaskPriority, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

# Utility to get session outside of FastAPI dependency
async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

# Helper wrapper to run async DB operations
async def _run_db_op(func, *args, **kwargs):
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        return await func(session, *args, **kwargs)

# --- MCP Tools ---

async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: str = "medium"
) -> Dict[str, Any]:
    """
    Create a new task for the user.
    
    Args:
        user_id: The ID of the user owning the task.
        title: Title of the task.
        description: Optional description.
        due_date: Optional due date in ISO format.
        priority: Priority level (low, medium, high).
    """
    async def _op(session: AsyncSession):
        # Validate input
        try:
            prio_enum = TaskPriority(priority.lower())
        except ValueError:
            prio_enum = TaskPriority.MEDIUM
            
        dt = None
        if due_date:
            try:
                dt = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except:
                pass
                
        new_task = Task(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            description=description,
            due_date=dt,
            priority=prio_enum,
            status=TaskStatus.PENDING,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)
        return new_task.dict()

    return await _run_db_op(_op)


async def list_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    List tasks for the user with optional filtering.
    
    Args:
        user_id: The ID of the user.
        status: Filter by status (pending, in_progress, completed).
        priority: Filter by priority (low, medium, high).
        search: Search term for title or description.
        limit: Max number of tasks to return.
    """
    async def _op(session: AsyncSession):
        query = select(Task).where(Task.user_id == user_id)
        
        if status:
            try:
                s_enum = TaskStatus(status.lower())
                query = query.where(Task.status == s_enum)
            except:
                pass
                
        if priority:
            try:
                p_enum = TaskPriority(priority.lower())
                query = query.where(Task.priority == p_enum)
            except:
                pass
                
        if search:
            query = query.where(
                or_(
                    Task.title.ilike(f"%{search}%"),
                    Task.description.ilike(f"%{search}%")
                )
            )
            
        query = query.order_by(Task.created_at.desc()).limit(limit)
        result = await session.execute(query)
        tasks = result.scalars().all()
        return [t.dict() for t in tasks]

    return await _run_db_op(_op)


async def complete_task(
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Mark a task as completed.
    
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task to complete.
    """
    async def _op(session: AsyncSession):
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return {"error": "Task not found"}
            
        task.status = TaskStatus.COMPLETED
        task.updated_at = datetime.now(timezone.utc)
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task.dict()

    return await _run_db_op(_op)


async def delete_task(
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Delete a task.
    
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task to delete.
    """
    async def _op(session: AsyncSession):
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return {"error": "Task not found"}
            
        await session.delete(task)
        await session.commit()
        return {"message": "Task deleted successfully", "id": task_id}

    return await _run_db_op(_op)


async def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update a task's details.
    
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task to update.
        title: New title.
        description: New description.
        status: New status.
        priority: New priority.
        due_date: New due date.
    """
    async def _op(session: AsyncSession):
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return {"error": "Task not found"}
            
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            try:
                task.status = TaskStatus(status.lower())
            except:
                pass
        if priority is not None:
            try:
                task.priority = TaskPriority(priority.lower())
            except:
                pass
        if due_date is not None:
            try:
                task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except:
                pass
                
        task.updated_at = datetime.now(timezone.utc)
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task.dict()

    return await _run_db_op(_op)
