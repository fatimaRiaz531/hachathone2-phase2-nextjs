"""
Simple test script to verify backend API endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

def test_docs():
    """Test if docs are accessible"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/docs")
        print(f"Docs endpoint: {response.status_code}")
    except Exception as e:
        print(f"Docs check failed: {e}")

def test_api_root():
    """Test the root API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint: {response.status_code}")
        print(f"Response: {response.json() if response.content else 'No content'}")
    except Exception as e:
        print(f"Root check failed: {e}")

if __name__ == "__main__":
    print("Testing backend endpoints...")
    test_health()
    test_docs()
    test_api_root()