import asyncio
from typing import Optional, List
from mcp.server.fastmcp import FastMCP
from sqlmodel import select, Session
from database import sync_engine
from models import Task, TaskStatus, TaskPriority

# Initialize FastMCP server
mcp = FastMCP("Todo MCP Server")

@mcp.tool()
def add_task(user_id: str, title: str, description: Optional[str] = None) -> str:
    """Add a new task for a user."""
    with Session(sync_engine) as session:
        task = Task(user_id=user_id, title=title, description=description)
        session.add(task)
        session.commit()
        session.refresh(task)
        return f"Task '{task.title}' added with ID: {task.id}"

@mcp.tool()
def list_tasks(user_id: str, status: Optional[str] = None) -> str:
    """List tasks for a user, optionally filtered by status (pending, completed)."""
    with Session(sync_engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        if status:
            try:
                task_status = TaskStatus(status.lower())
                statement = statement.where(Task.status == task_status)
            except ValueError:
                return f"Invalid status: {status}. Use 'pending' or 'completed'."
        
        results = session.exec(statement).all()
        if not results:
            return "No tasks found."
        
        output = []
        for task in results:
            status_emoji = "✅" if task.status == TaskStatus.COMPLETED else "⏳"
            output.append(f"[{task.id[:8]}] {status_emoji} {task.title}")
        
        return "\n".join(output)

@mcp.tool()
def complete_task(user_id: str, task_id: str) -> str:
    """Mark a task as completed."""
    with Session(sync_engine) as session:
        # Try full ID first, then partial ID
        task = session.get(Task, task_id)
        if not task:
            statement = select(Task).where(Task.user_id == user_id, Task.id.startswith(task_id))
            task = session.exec(statement).first()
        
        if not task or task.user_id != user_id:
            return f"Task not found or not owned by user: {task_id}"
        
        task.status = TaskStatus.COMPLETED
        session.add(task)
        session.commit()
        return f"Task '{task.title}' marked as completed."

@mcp.tool()
def delete_task(user_id: str, task_id: str) -> str:
    """Delete a task."""
    with Session(sync_engine) as session:
        task = session.get(Task, task_id)
        if not task:
            statement = select(Task).where(Task.user_id == user_id, Task.id.startswith(task_id))
            task = session.exec(statement).first()
            
        if not task or task.user_id != user_id:
            return f"Task not found or not owned by user: {task_id}"
        
        title = task.title
        session.delete(task)
        session.commit()
        return f"Task '{title}' deleted successfully."

@mcp.tool()
def get_task_stats(user_id: str) -> str:
    """Get a summary of task statistics (total, pending, completed)."""
    with Session(sync_engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        results = session.exec(statement).all()
        
        total = len(results)
        pending = len([t for t in results if t.status == TaskStatus.PENDING])
        completed = len([t for t in results if t.status == TaskStatus.COMPLETED])
        
        return f"Task Statistics for {user_id}:\n- Total: {total}\n- Pending: {pending}\n- Completed: {completed}"

@mcp.tool()
def update_task(user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None) -> str:
    """Update a task's title or description."""
    with Session(sync_engine) as session:
        task = session.get(Task, task_id)
        if not task:
            statement = select(Task).where(Task.user_id == user_id, Task.id.startswith(task_id))
            task = session.exec(statement).first()
            
        if not task or task.user_id != user_id:
            return f"Task not found or not owned by user: {task_id}"
        
        if title:
            task.title = title
        if description:
            task.description = description
            
        session.add(task)
        session.commit()
        return f"Task '{task.id[:8]}' updated successfully."

if __name__ == "__main__":
    mcp.run()
