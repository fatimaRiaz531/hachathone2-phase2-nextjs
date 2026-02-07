"""
FastAPI Main Application for Todo Web App

This module sets up the FastAPI application with CORS middleware,
exception handlers, and registers all route modules.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from routes import auth, tasks, users, chat
from database import async_engine as engine
from sqlmodel import SQLModel


# Create FastAPI app instance
app = FastAPI(
    title="Todo Web App API",
    description="REST API for Todo Web App with authentication and task management",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors with consistent format."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error['loc']),
            "message": error['msg']
        })

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    # Log the full exception for debugging
    import traceback
    print("Generic Exception Handler triggered:")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )


# Include API routes
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint to indicate API is running."""
    return {"message": "Todo Backend API running – Phase II Simplified"}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify API status."""
    return {"status": "healthy", "service": "todo-api"}


# Initialize database tables on startup
@app.on_event("startup")
async def on_startup():
    """Initialize database tables on startup."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
    except Exception as e:
        print(f"Database initialization error: {e}")


if __name__ == "__main__":
    import uvicorn
    # Use string import format for reload support
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
