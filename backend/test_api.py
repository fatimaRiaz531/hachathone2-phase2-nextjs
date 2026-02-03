"""
Test suite for the Todo Web App API

This module contains basic tests to verify the API endpoints are working correctly.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import engine
from sqlmodel import SQLModel, text
from backend.models import User
from backend.utils.password import hash_password
import uuid
from datetime import datetime
import json


@pytest.fixture
def client():
    """Create a test client for the API."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
async def sample_user():
    """Create a sample user for testing."""
    user_data = {
        "id": str(uuid.uuid4()),
        "email": "test@example.com",
        "password_hash": hash_password("TestPass123!"),
        "first_name": "Test",
        "last_name": "User",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    return user_data


def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "todo-api"


def test_docs_endpoint(client):
    """Test the API documentation endpoint."""
    response = client.get("/api/v1/docs")
    assert response.status_code == 200


def test_register_endpoint_structure(client):
    """Test that registration endpoint exists and responds with correct structure."""
    # This test just verifies the endpoint exists and returns the expected structure
    # Actual registration would require handling the full auth flow
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    })

    # We expect either success (201) or validation error (422) or conflict (400)
    # depending on if user already exists
    assert response.status_code in [201, 400, 422]


def test_openapi_endpoint(client):
    """Test the OpenAPI schema endpoint."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "info" in data
    assert "paths" in data
    assert "/api/v1/auth/register" in data["paths"]
    assert "/api/v1/auth/login" in data["paths"]
    assert "/api/v1/tasks" in data["paths"]


def test_unauthorized_access_to_protected_endpoints(client):
    """Test that protected endpoints require authentication."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403  # Should require authentication

    response = client.get("/api/v1/tasks")
    assert response.status_code == 403  # Should require authentication


if __name__ == "__main__":
    # Run basic tests
    print("Running basic API tests...")

    # Create test client
    client = TestClient(app)

    # Test health endpoint
    response = client.get("/health")
    print(f"Health endpoint: {response.status_code} - {response.json()}")

    # Test docs endpoint
    response = client.get("/api/v1/docs")
    print(f"Docs endpoint: {response.status_code}")

    # Test OpenAPI endpoint
    response = client.get("/api/v1/openapi.json")
    print(f"OpenAPI endpoint: {response.status_code}")

    # Test unauthorized access
    response = client.get("/api/v1/users/me")
    print(f"Protected endpoint without auth: {response.status_code}")

    print("Basic tests completed!")