from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Annotated, AsyncGenerator
import uvicorn
from settings import settings
from app.database import init_db

# Application lifespan for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    print("Starting up...")
    init_db()  # Initialize database tables
    yield
    # Shutdown
    print("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Task Management API",
    description="A simple task management API built with FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Task Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include API routes
from app.routes.task_routes import router as task_router
from app.routes.auth_routes import router as auth_router

app.include_router(auth_router, prefix="/api")
app.include_router(task_router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
