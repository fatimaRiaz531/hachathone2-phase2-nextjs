"""
FastAPI Main Application for Todo Web App

This module sets up the FastAPI application with CORS middleware,
exception handlers, and registers all route modules.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file immediately
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from routes import tasks, users, chat
from middleware.auth import jwt_auth_middleware, debug_log
from database import async_engine as engine
from sqlmodel import SQLModel

debug_log("DEBUG AUTH: main.py loaded")


# Create FastAPI app instance
app = FastAPI(
    title="Todo Web App API",
    description="REST API for Todo Web App with authentication and task management",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

@app.get("/api/v1/debug/auth")
async def debug_auth():
    debug_log("DEBUG AUTH: Diagnostic route hit")
    return {"status": "ok", "message": "Auth system is reachable"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    error_trace = traceback.format_exc()
    log_msg = f"GLOBAL ERROR: {request.method} {request.url.path}\n{str(exc)}\n{error_trace}"
    print(log_msg)
    debug_log(log_msg)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


# Add CORS middleware
print(f"DEBUG: Initializing CORS with origins for localhost and 127.0.0.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://localhost:3000",
        "https://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    print(f"DEBUG: Incoming {request.method} request to {request.url.path} from {origin}")
    response = await call_next(request)
    return response


# Register JWT auth middleware (optional global hook; routes use Depends(get_current_user))
# This middleware provides a global place to add auth-related request processing/logging.
app.middleware("http")(jwt_auth_middleware)


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


# Generic handler removed, consolidated at top


# Include API routes
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
    print("BACKEND: Starting server on http://0.0.0.0:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
