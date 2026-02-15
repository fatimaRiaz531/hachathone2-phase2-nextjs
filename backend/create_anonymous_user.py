"""
Create anonymous user for chatbot testing
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import select
from models import User
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://neondb_owner:npg_qTekoD9B6MiI@ep-lively-fire-aikmnfbs-pooler.c-4.us-east-1.aws.neon.tech/neondb?ssl=require")

async def create_anonymous_user():
    engine = create_async_engine(DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with AsyncSessionLocal() as session:
        # Check if anonymous user exists
        result = await session.execute(select(User).where(User.id == "anonymous"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("Anonymous user already exists")
            return
        
        # Create anonymous user
        anonymous_user = User(
            id="anonymous",
            email="anonymous@chatbot.local",
            password_hash="no-password-needed",
            first_name="Anonymous",
            last_name="User",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(anonymous_user)
        await session.commit()
        print("✅ Anonymous user created successfully!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_anonymous_user())
