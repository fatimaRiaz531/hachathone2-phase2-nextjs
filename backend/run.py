#!/usr/bin/env python3
"""
Development server runner for the Todo Web App backend.

This script starts the FastAPI application using uvicorn with development settings.
"""

import uvicorn
import os


def run_dev_server():
    """Run the development server."""
    print("Starting Todo Web App backend server...")
    print("Visit http://localhost:8000/api/v1/docs for API documentation")

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,  # Enable auto-reload for development
        debug=True,
        log_level="info"
    )


if __name__ == "__main__":
    run_dev_server()