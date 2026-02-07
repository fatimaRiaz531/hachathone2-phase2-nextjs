import asyncio
from settings import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    db_url = settings.database_url
    if not db_url:
        print("DATABASE_URL not set in settings")
        return

    print(f"Testing connection to: {db_url}")
    # Match the async_engine config from database.py
    engine = create_async_engine(
        db_url, 
        connect_args={
            "ssl": "require",
            "server_settings": {
                "tcp_user_timeout": "10000",
            }
        }
    )
    
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Success: {result.scalar()}")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
