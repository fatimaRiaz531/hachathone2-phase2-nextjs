
import asyncio
import os
import sys
from sqlalchemy.future import select

# Add backend directory to path
sys.path.append(os.getcwd())

from database import get_async_session, async_engine
from models import User
from utils.password import hash_password

async def reset_demo_user():
    async with async_engine.begin() as conn:
        print("Database connection established.")

    # Create a session
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        print("Checking for existing admin user...")
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        user = result.scalar_one_or_none()

        if user:
            print(f"Deleting existing user: {user.email}")
            await session.delete(user)
            await session.commit()
            print("User deleted.")
        else:
            print("User not found.")

        print("Creating new admin user...")
        from datetime import datetime
        import uuid
        
        new_user = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            password_hash=hash_password("Password123!"),
            first_name="Admin",
            last_name="User",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(new_user)
        await session.commit()
        print(f"User created successfully: {new_user.email} / Password123!")

if __name__ == "__main__":
    asyncio.run(reset_demo_user())
