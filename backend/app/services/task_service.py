from typing import List, Optional
from ..task_repository import TaskRepository
from ..models.task import Task, TaskBase
from ..database import get_session


class TaskService:
    """
    Service class for handling task business logic.
    All operations are user-scoped to ensure data isolation.
    """

    def __init__(self):
        self.task_repository = TaskRepository()

    def create_task(self, task_data: TaskBase, user_id: str) -> Task:
        """
        Create a new task for a specific user.

        Args:
            task_data: Task data to create
            user_id: ID of the user creating the task

        Returns:
            Created Task object
        """
        with get_session() as session:
            return self.task_repository.create_task(session, task_data, user_id)

    def get_tasks_for_user(self, user_id: str, completed: Optional[bool] = None) -> List[Task]:
        """
        Get all tasks for a specific user, with optional completion filter.

        Args:
            user_id: ID of the user whose tasks to retrieve
            completed: Optional filter for completion status

        Returns:
            List of Task objects belonging to the user
        """
        with get_session() as session:
            return self.task_repository.get_tasks_by_user(session, user_id, completed)

    def get_task_for_user(self, task_id: int, user_id: str) -> Optional[Task]:
        """
        Get a specific task by its ID and user ID to ensure user owns the task.

        Args:
            task_id: ID of the task to retrieve
            user_id: ID of the user requesting the task

        Returns:
            Task object if it belongs to the user, None otherwise
        """
        with get_session() as session:
            return self.task_repository.get_task_by_id_and_user(session, task_id, user_id)

    def update_task(self, task_id: int, user_id: str, task_data: TaskBase) -> Optional[Task]:
        """
        Update a task if it belongs to the user.

        Args:
            task_id: ID of the task to update
            user_id: ID of the user requesting the update
            task_data: Updated task data

        Returns:
            Updated Task object if successful, None if task doesn't belong to user
        """
        with get_session() as session:
            return self.task_repository.update_task(session, task_id, user_id, task_data)

    def toggle_task_completion(self, task_id: int, user_id: str) -> Optional[Task]:
        """
        Toggle the completion status of a task.

        Args:
            task_id: ID of the task to update
            user_id: ID of the user requesting the update

        Returns:
            Updated Task object if successful, None if task doesn't belong to user
        """
        with get_session() as session:
            return self.task_repository.toggle_task_completion(session, task_id, user_id)

    def delete_task(self, task_id: int, user_id: str) -> bool:
        """
        Delete a task if it belongs to the user.

        Args:
            task_id: ID of the task to delete
            user_id: ID of the user requesting the deletion

        Returns:
            True if task was deleted, False if task doesn't belong to user
        """
        with get_session() as session:
            return self.task_repository.delete_task(session, task_id, user_id)