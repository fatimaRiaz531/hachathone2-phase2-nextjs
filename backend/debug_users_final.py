import asyncio
from sqlalchemy.future import select
from database import get_async_session
from models import User

async def debug_users():
    async for session in get_async_session():
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"Total users found: {len(users)}")
        for user in users:
            print(f"ID: {user.id} | Email: '{user.email}' | Active: {user.is_active}")
        break # Only need one session

if __name__ == "__main__":
    asyncio.run(debug_users())
