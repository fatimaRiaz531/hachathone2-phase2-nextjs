import asyncio
from sqlalchemy import text
from database import async_engine

async def make_user_id_nullable():
    async with async_engine.begin() as conn:
        print("Altering tasks table to make user_id nullable...")
        await conn.execute(text("ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL"))
        print("Successfully made user_id nullable.")

if __name__ == "__main__":
    asyncio.run(make_user_id_nullable())
