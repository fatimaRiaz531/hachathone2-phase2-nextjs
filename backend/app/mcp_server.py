import asyncio
import json
from datetime import datetime, timezone
from typing import Optional, List
import uuid

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

from database import get_async_session
from models import Task, User, TaskStatus, TaskPriority, Conversation, Message
from sqlalchemy.future import select
from sqlalchemy import or_

# Initialize FastMCP server
mcp = FastMCP("TodoMCP")

# Pydantic models for tool arguments
class AddTaskArgs(BaseModel):
    user_id: str = Field(..., description="The ID of the user creating the task")
    title: str = Field(..., description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description of the task")
    due_date: Optional[datetime] = Field(None, description="Due date for the task")
    priority: Optional[str] = Field("medium", description="Priority: low, medium, high")

class ListTasksArgs(BaseModel):
    user_id: str = Field(..., description="The ID of the user fetching tasks")
    status: Optional[str] = Field(None, description="Filter by status: pending, in_progress, completed")
    search: Optional[str] = Field(None, description="Search term for title/description")

class CompleteTaskArgs(BaseModel):
    user_id: str = Field(..., description="The ID of the user owning the task")
    task_id: str = Field(..., description="The ID of the task to complete")

class DeleteTaskArgs(BaseModel):
    user_id: str = Field(..., description="The ID of the user owning the task")
    task_id: str = Field(..., description="The ID of the task to delete")

class UpdateTaskArgs(BaseModel):
    user_id: str = Field(..., description="The ID of the user owning the task")
    task_id: str = Field(..., description="The ID of the task to update")
    title: Optional[str] = Field(None, description="New title")
    description: Optional[str] = Field(None, description="New description")
    status: Optional[str] = Field(None, description="New status")
    priority: Optional[str] = Field(None, description="New priority")
    due_date: Optional[datetime] = Field(None, description="New due date")

# Helper to get DB session (since tools are async)
# We need to manually handle session context because FastMCP doesn't automatically inject FastAPI dependencies
# We will use the database.py's AsyncSession maker

from database import AsyncSessionLocal as async_session_maker

@mcp.tool(name="add_task", description="Create a new task for a user")
async def add_task(args: AddTaskArgs) -> str:
    async with async_session_maker() as db:
        new_task = Task(
            id=str(uuid.uuid4()),
            user_id=args.user_id,
            title=args.title,
            description=args.description,
            due_date=args.due_date,
            priority=args.priority if args.priority else "medium",
            status=TaskStatus.PENDING,
            completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        return json.dumps(new_task.model_dump(mode='json'), indent=2)

@mcp.tool(name="list_tasks", description="List tasks for a user with optional filtering")
async def list_tasks(args: ListTasksArgs) -> str:
    async with async_session_maker() as db:
        query = select(Task).where(Task.user_id == args.user_id)
        
        if args.status:
            if args.status == "completed":
                # Handle both status enum and completed boolean
                query = query.where(or_(Task.status == "completed", Task.completed == True))
            else:
                query = query.where(Task.status == args.status)
        
        if args.search:
            query = query.where(or_(Task.title.contains(args.search), Task.description.contains(args.search)))
            
        result = await db.execute(query)
        tasks = result.scalars().all()
        return json.dumps([t.model_dump(mode='json') for t in tasks], indent=2)

@mcp.tool(name="complete_task", description="Mark a task as completed")
async def complete_task(args: CompleteTaskArgs) -> str:
    async with async_session_maker() as db:
        query = select(Task).where(Task.id == args.task_id, Task.user_id == args.user_id)
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return json.dumps({"error": "Task not found"})
            
        task.status = TaskStatus.COMPLETED
        task.completed = True
        task.updated_at = datetime.utcnow()
        
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return json.dumps(task.model_dump(mode='json'), indent=2)

@mcp.tool(name="delete_task", description="Delete a task permanently")
async def delete_task(args: DeleteTaskArgs) -> str:
    async with async_session_maker() as db:
        query = select(Task).where(Task.id == args.task_id, Task.user_id == args.user_id)
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return json.dumps({"error": "Task not found"})
            
        await db.delete(task)
        await db.commit()
        return json.dumps({"status": "deleted", "task_id": args.task_id})

@mcp.tool(name="update_task", description="Update details of an existing task")
async def update_task(args: UpdateTaskArgs) -> str:
    async with async_session_maker() as db:
        query = select(Task).where(Task.id == args.task_id, Task.user_id == args.user_id)
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return json.dumps({"error": "Task not found"})
            
        if args.title is not None:
            task.title = args.title
        if args.description is not None:
            task.description = args.description
        if args.status is not None:
            task.status = args.status
            if args.status == "completed":
                task.completed = True
            elif args.status == "pending" or args.status == "in_progress":
                task.completed = False
        if args.priority is not None:
            task.priority = args.priority
        if args.due_date is not None:
            task.due_date = args.due_date
            
        task.updated_at = datetime.utcnow()
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return json.dumps(task.model_dump(mode='json'), indent=2)

if __name__ == "__main__":
    # Helper to run the MCP server if executed directly
    mcp.run()
