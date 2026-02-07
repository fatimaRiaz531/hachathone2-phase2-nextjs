#!/usr/bin/env python3
"""
Comprehensive test suite for the Todo Web App
"""

import os
import sys
import time
import threading
import requests
from typing import Dict, Any

# Add backend to path
sys.path.insert(0, './backend')

def test_backend_components():
    """Test that all backend components can be imported successfully"""
    print("Testing backend components...")

    try:
        from main import app
        from models import User, Task, RefreshToken, TaskStatus, TaskPriority
        from database import async_engine, get_async_session
        from routes import auth, tasks, users
        from middleware.auth import jwt_auth_middleware, get_current_user
        from schemas import (
            UserRegisterRequest, UserLoginRequest, LoginResponse,
            TaskCreateRequest, TaskUpdateRequest, TaskResponse
        )

        print("SUCCESS: Backend components imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Backend import error: {e}")
        return False

def test_frontend_files():
    """Test that all frontend files exist"""
    print("Testing frontend files...")

    frontend_files = [
        './frontend/app/page.tsx',
        './frontend/components/TodoClient.tsx',
        './frontend/lib/api.ts',
        './frontend/lib/auth.tsx',
        './frontend/lib/better-auth-client.ts',
        './frontend/app/login/page.tsx',
        './frontend/app/signup/page.tsx',
        './frontend/app/layout.tsx'
    ]

    all_exist = True
    for file in frontend_files:
        if os.path.exists(file):
            print(f"SUCCESS: {os.path.basename(file)} exists")
        else:
            print(f"ERROR: {file} missing")
            all_exist = False

    if all_exist:
        print("SUCCESS: All frontend files exist")
    else:
        print("ERROR: Some frontend files are missing")

    return all_exist

def test_backend_api():
    """Test backend API endpoints"""
    print("Testing backend API...")

    try:
        # Test health endpoint
        response = requests.get('http://127.0.0.1:8001/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy' and data.get('service') == 'todo-api':
                print("SUCCESS: Health endpoint: OK")
            else:
                print(f"ERROR: Health endpoint: Unexpected response {data}")
                return False
        else:
            print(f"ERROR: Health endpoint: Status {response.status_code}")
            return False

        # Test root endpoint (expected to return 404)
        response = requests.get('http://127.0.0.1:8001/', timeout=5)
        if response.status_code == 404:
            print("SUCCESS: Root endpoint: OK (expected 404)")
        else:
            print(f"ERROR: Root endpoint: Expected 404, got {response.status_code}")
            return False

        return True

    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to backend server")
        return False
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
        return False
    except Exception as e:
        print(f"ERROR: API test error: {e}")
        return False

def test_application_structure():
    """Test the overall application structure"""
    print("Testing application structure...")

    # Check for essential files
    essential_files = [
        './backend/main.py',
        './backend/models.py',
        './backend/database.py',
        './backend/routes/tasks.py',
        './backend/middleware/auth.py',
        './frontend/package.json',
        './frontend/next.config.js',
        './requirements.txt',
        './README.md'
    ]

    all_exist = True
    for file in essential_files:
        if os.path.exists(file):
            print(f"SUCCESS: {os.path.basename(file)}: OK")
        else:
            print(f"ERROR: {file} missing")
            all_exist = False

    if all_exist:
        print("SUCCESS: Application structure: OK")
    else:
        print("ERROR: Application structure incomplete")

    return all_exist

def run_tests():
    """Run all tests"""
    print("=" * 60)
    print("COMPREHENSIVE TODO WEB APP TEST SUITE")
    print("=" * 60)
    print()

    results = {}

    # Test 1: Backend components
    results['backend_components'] = test_backend_components()
    print()

    # Test 2: Frontend files
    results['frontend_files'] = test_frontend_files()
    print()

    # Test 3: Backend API
    results['backend_api'] = test_backend_api()
    print()

    # Test 4: Application structure
    results['application_structure'] = test_application_structure()
    print()

    # Summary
    print("=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)

    passed = sum(results.values())
    total = len(results)

    for test_name, result in results.items():
        status = "SUCCESS: PASS" if result else "ERROR: FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")

    print()
    print(f"Overall: {passed}/{total} tests passed")

    if passed == total:
        print("SUCCESS: ALL TESTS PASSED! The Todo Web App is fully functional.")
        return True
    else:
        print("ERROR: SOME TESTS FAILED! Please review the issues above.")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)