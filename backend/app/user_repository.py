from sqlmodel import Session, select
from typing import Optional
from .models.user import User, UserBase
from datetime import datetime


class UserRepository:
    """
    Repository class for handling user-related database operations.
    """

    def create_user(self, session: Session, user_data: UserBase) -> User:
        """
        Create a new user.

        Args:
            session: Database session
            user_data: User data to create

        Returns:
            Created User object
        """
        user = User(
            external_id=user_data.external_id,
            email=user_data.email,
            name=user_data.name
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    def get_user_by_external_id(self, session: Session, external_id: str) -> Optional[User]:
        """
        Get a user by their external ID from Better Auth.

        Args:
            session: Database session
            external_id: External user ID from Better Auth

        Returns:
            User object if found, None otherwise
        """
        query = select(User).where(User.external_id == external_id)
        return session.exec(query).first()

    def get_user_by_email(self, session: Session, email: str) -> Optional[User]:
        """
        Get a user by their email address.

        Args:
            session: Database session
            email: User's email address

        Returns:
            User object if found, None otherwise
        """
        query = select(User).where(User.email == email)
        return session.exec(query).first()

    def update_user(self, session: Session, external_id: str, user_data: UserBase) -> Optional[User]:
        """
        Update a user's information.

        Args:
            session: Database session
            external_id: External user ID to identify the user
            user_data: Updated user data

        Returns:
            Updated User object if successful, None if user doesn't exist
        """
        existing_user = self.get_user_by_external_id(session, external_id)

        if existing_user:
            # Update only the fields that are provided
            for field, value in user_data.dict(exclude_unset=True).items():
                setattr(existing_user, field, value)

            existing_user.updated_at = datetime.utcnow()
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
            return existing_user

        return None

    def delete_user(self, session: Session, external_id: str) -> bool:
        """
        Delete a user.

        Args:
            session: Database session
            external_id: External user ID to identify the user

        Returns:
            True if user was deleted, False if user doesn't exist
        """
        existing_user = self.get_user_by_external_id(session, external_id)

        if existing_user:
            session.delete(existing_user)
            session.commit()
            return True

        return False