import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    url = os.getenv("DATABASE_URL")
    print(f"Testing URL: {url.split('@')[1] if '@' in url else 'INVALID URL FORMAT'}") 
    # masked password for safety
    
    try:
        engine = create_async_engine(url)
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        print("SUCCESS: Database connection established!")
        return 0
    except Exception as e:
        print(f"FAILURE: {e}")
        return 1

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_connection())
