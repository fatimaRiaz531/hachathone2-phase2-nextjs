from typing import Optional
from ..user_repository import UserRepository
from ..models.user import User, UserBase
from ..database import get_session


class UserService:
    """
    Service class for handling user business logic.
    """

    def __init__(self):
        self.user_repository = UserRepository()

    def create_user(self, user_data: UserBase) -> User:
        """
        Create a new user.

        Args:
            user_data: User data to create

        Returns:
            Created User object
        """
        with get_session() as session:
            return self.user_repository.create_user(session, user_data)

    def get_user_by_external_id(self, external_id: str) -> Optional[User]:
        """
        Get a user by their external ID from Better Auth.

        Args:
            external_id: External user ID from Better Auth

        Returns:
            User object if found, None otherwise
        """
        with get_session() as session:
            return self.user_repository.get_user_by_external_id(session, external_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by their email address.

        Args:
            email: User's email address

        Returns:
            User object if found, None otherwise
        """
        with get_session() as session:
            return self.user_repository.get_user_by_email(session, email)

    def update_user(self, external_id: str, user_data: UserBase) -> Optional[User]:
        """
        Update a user's information.

        Args:
            external_id: External user ID to identify the user
            user_data: Updated user data

        Returns:
            Updated User object if successful, None if user doesn't exist
        """
        with get_session() as session:
            return self.user_repository.update_user(session, external_id, user_data)

    def delete_user(self, external_id: str) -> bool:
        """
        Delete a user.

        Args:
            external_id: External user ID to identify the user

        Returns:
            True if user was deleted, False if user doesn't exist
        """
        with get_session() as session:
            return self.user_repository.delete_user(session, external_id)