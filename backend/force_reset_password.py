
import asyncio
import os
import sys
from sqlalchemy.future import select
from datetime import datetime
import uuid

# Add backend directory to path
sys.path.append(os.getcwd())

# Need to mock the db setup slightly if running standalone or just use the existing logic
# simpler approach: directly insert using the engine if possible, or just ignore if it's too complex to import
# Let's try to just use the existing create_demo_user.py logic but force a password update if possible?
# Actually, the previous "SUCCESS: User created successfully" means the user was created.
# If they still can't login, maybe the password hash is wrong.

from database import async_engine
from models import User
from utils.password import hash_password

async def reset_password():
    print("Resetting password for admin@example.com...")
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        user = result.scalar_one_or_none()

        if user:
            print(f"User found: {user.id}")
            user.password_hash = hash_password("Password123!")
            await session.commit()
            print("Password updated to: Password123!")
        else:
            print("User not found! Creating...")
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
            print("User created with password: Password123!")

if __name__ == "__main__":
    asyncio.run(reset_password())
