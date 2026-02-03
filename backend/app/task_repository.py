from sqlmodel import Session, select
from typing import List, Optional
from .models.task import Task, TaskBase
from .models.user import User
from datetime import datetime


class TaskRepository:
    """
    Repository class for handling task-related database operations.
    All operations are user-scoped to ensure data isolation.
    """

    def create_task(self, session: Session, task_data: TaskBase, user_id: str) -> Task:
        """
        Create a new task for a specific user.

        Args:
            session: Database session
            task_data: Task data to create
            user_id: ID of the user creating the task

        Returns:
            Created Task object
        """
        task = Task(
            title=task_data.title,
            description=task_data.description,
            completed=task_data.completed,
            user_id=user_id
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    def get_tasks_by_user(self, session: Session, user_id: str,
                         completed: Optional[bool] = None) -> List[Task]:
        """
        Get all tasks for a specific user, with optional completion filter.

        Args:
            session: Database session
            user_id: ID of the user whose tasks to retrieve
            completed: Optional filter for completion status

        Returns:
            List of Task objects belonging to the user
        """
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        query = query.order_by(Task.created_at.desc())

        return session.exec(query).all()

    def get_task_by_id_and_user(self, session: Session, task_id: int, user_id: str) -> Optional[Task]:
        """
        Get a specific task by its ID and user ID to ensure user owns the task.

        Args:
            session: Database session
            task_id: ID of the task to retrieve
            user_id: ID of the user requesting the task

        Returns:
            Task object if it belongs to the user, None otherwise
        """
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return session.exec(query).first()

    def update_task(self, session: Session, task_id: int, user_id: str,
                   task_data: TaskBase) -> Optional[Task]:
        """
        Update a task if it belongs to the user.

        Args:
            session: Database session
            task_id: ID of the task to update
            user_id: ID of the user requesting the update
            task_data: Updated task data

        Returns:
            Updated Task object if successful, None if task doesn't belong to user
        """
        existing_task = self.get_task_by_id_and_user(session, task_id, user_id)

        if existing_task:
            # Update only the fields that are provided
            for field, value in task_data.dict(exclude_unset=True).items():
                setattr(existing_task, field, value)

            existing_task.updated_at = datetime.utcnow()
            session.add(existing_task)
            session.commit()
            session.refresh(existing_task)
            return existing_task

        return None

    def toggle_task_completion(self, session: Session, task_id: int, user_id: str) -> Optional[Task]:
        """
        Toggle the completion status of a task.

        Args:
            session: Database session
            task_id: ID of the task to update
            user_id: ID of the user requesting the update

        Returns:
            Updated Task object if successful, None if task doesn't belong to user
        """
        existing_task = self.get_task_by_id_and_user(session, task_id, user_id)

        if existing_task:
            existing_task.completed = not existing_task.completed
            existing_task.updated_at = datetime.utcnow()
            session.add(existing_task)
            session.commit()
            session.refresh(existing_task)
            return existing_task

        return None

    def delete_task(self, session: Session, task_id: int, user_id: str) -> bool:
        """
        Delete a task if it belongs to the user.

        Args:
            session: Database session
            task_id: ID of the task to delete
            user_id: ID of the user requesting the deletion

        Returns:
            True if task was deleted, False if task doesn't belong to user
        """
        existing_task = self.get_task_by_id_and_user(session, task_id, user_id)

        if existing_task:
            session.delete(existing_task)
            session.commit()
            return True

        return False