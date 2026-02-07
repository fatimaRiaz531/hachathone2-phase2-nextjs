import asyncio
from sqlmodel import SQLModel
from database import async_engine
from models import User, Task, RefreshToken, Conversation, Message

async def init_db():
    async with async_engine.begin() as conn:
        print("Creating all tables...")
        await conn.run_sync(SQLModel.metadata.create_all)
        print("All tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
