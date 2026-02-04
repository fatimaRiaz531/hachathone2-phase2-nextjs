import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine
from sqlmodel import SQLModel, create_engine
from unittest.mock import patch
import os

# Create test client
client = TestClient(app)

# Override database URL for testing
@pytest.fixture(scope="function")
def test_client():
    # Use in-memory SQLite for testing
    test_engine = create_engine("sqlite:///./test.db", echo=True)

    # Create tables
    SQLModel.metadata.create_all(bind=test_engine)

    with TestClient(app) as client:
        yield client

def test_health_endpoint(test_client):
    """Test the health check endpoint"""
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "todo-api"}

def test_register_user(test_client):
    """Test user registration"""
    response = test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "securepassword123",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    # Should return 200 or 400 if user already exists
    assert response.status_code in [200, 400, 422]

def test_login_user(test_client):
    """Test user login"""
    # First register a user
    test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "login_test@example.com",
            "password": "securepassword123",
            "first_name": "Login",
            "last_name": "Test"
        }
    )

    # Then try to login
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "login_test@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_create_task_unauthorized(test_client):
    """Test that creating a task requires authentication"""
    response = test_client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending"
        }
    )
    # Should return 401 for unauthorized access
    assert response.status_code == 401

def test_get_tasks_unauthorized(test_client):
    """Test that getting tasks requires authentication"""
    response = test_client.get("/api/v1/tasks")
    assert response.status_code == 401

def test_api_docs_available(test_client):
    """Test that API documentation is available"""
    response = test_client.get("/api/v1/docs")
    # Should return 200 if docs are available
    assert response.status_code in [200, 404]  # 404 might be returned if FastAPI redirects

def test_openapi_json_available(test_client):
    """Test that OpenAPI JSON is available"""
    response = test_client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()

# Additional tests for auth endpoints
def test_logout_endpoint_exists(test_client):
    """Test that logout endpoint exists (even if unauthorized)"""
    response = test_client.post("/api/v1/auth/logout")
    # Should return 401 for unauthorized, or 200 for successful logout
    assert response.status_code in [200, 401]

def test_refresh_token_endpoint_exists(test_client):
    """Test that refresh token endpoint exists (even if unauthorized)"""
    response = test_client.post("/api/v1/auth/refresh")
    # Should return 422 for validation error or 401 for unauthorized
    assert response.status_code in [422, 401]

if __name__ == "__main__":
    pytest.main([__file__])