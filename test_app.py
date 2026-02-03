"""
Test script to verify the Todo Web App structure and components
"""

import os
import sys
from pathlib import Path

def check_project_structure():
    """Verify that all required directories and files exist"""

    root_dir = Path(__file__).parent
    print(f"Checking project structure in: {root_dir}")

    # Check backend structure
    backend_checks = [
        root_dir / "backend" / "main.py",
        root_dir / "backend" / "models.py",
        root_dir / "backend" / "schemas.py",
        root_dir / "backend" / "database.py",
        root_dir / "backend" / "dependencies.py",
        root_dir / "backend" / "middleware" / "auth.py",
        root_dir / "backend" / "routes" / "auth.py",
        root_dir / "backend" / "routes" / "tasks.py",
        root_dir / "backend" / "routes" / "users.py",
    ]

    # Check frontend structure
    frontend_checks = [
        root_dir / "frontend" / "package.json",
        root_dir / "frontend" / "src" / "app" / "layout.tsx",
        root_dir / "frontend" / "src" / "app" / "login" / "page.tsx",
        root_dir / "frontend" / "src" / "app" / "register" / "page.tsx",
        root_dir / "frontend" / "src" / "app" / "dashboard" / "page.tsx",
        root_dir / "frontend" / "src" / "app" / "tasks" / "page.tsx",
        root_dir / "frontend" / "src" / "components" / "ui" / "Button.tsx",
        root_dir / "frontend" / "src" / "components" / "auth" / "LoginForm.tsx",
        root_dir / "frontend" / "src" / "components" / "tasks" / "TaskCard.tsx",
        root_dir / "frontend" / "src" / "contexts" / "AuthContext.tsx",
        root_dir / "frontend" / "src" / "lib" / "types.ts",
        root_dir / "frontend" / "src" / "lib" / "api" / "client.ts",
    ]

    # Check spec files
    spec_checks = [
        root_dir / "specs" / "constitution.md",
        root_dir / "specs" / "features" / "authentication.md",
        root_dir / "specs" / "features" / "task-crud.md",
        root_dir / "specs" / "api" / "rest-endpoints.md",
        root_dir / "specs" / "database" / "schema.md",
        root_dir / "specs" / "ui" / "pages.md",
        root_dir / "specs" / "tasks.md",
    ]

    # Check root files
    root_checks = [
        root_dir / "requirements.txt",
        root_dir / "README.md",
        root_dir / ".env.example",
        root_dir / "docker-compose.yml",
    ]

    all_checks = backend_checks + frontend_checks + spec_checks + root_checks

    print("\nChecking backend structure...")
    backend_ok = True
    for check in backend_checks:
        exists = check.exists()
        status = "OK" if exists else "MISSING"
        print(f"[{status}] {check.relative_to(root_dir)}")
        if not exists:
            backend_ok = False

    print("\nChecking frontend structure...")
    frontend_ok = True
    for check in frontend_checks:
        exists = check.exists()
        status = "OK" if exists else "MISSING"
        print(f"[{status}] {check.relative_to(root_dir)}")
        if not exists:
            frontend_ok = False

    print("\nChecking spec files...")
    specs_ok = True
    for check in spec_checks:
        exists = check.exists()
        status = "OK" if exists else "MISSING"
        print(f"[{status}] {check.relative_to(root_dir)}")
        if not exists:
            specs_ok = False

    print("\nChecking root files...")
    root_ok = True
    for check in root_checks:
        exists = check.exists()
        status = "OK" if exists else "MISSING"
        print(f"[{status}] {check.relative_to(root_dir)}")
        if not exists:
            root_ok = False

    print(f"\nSummary:")
    print(f"Backend: {'OK' if backend_ok else 'Issues'}")
    print(f"Frontend: {'OK' if frontend_ok else 'Issues'}")
    print(f"Specs: {'OK' if specs_ok else 'Issues'}")
    print(f"Root: {'OK' if root_ok else 'Issues'}")

    overall_ok = backend_ok and frontend_ok and specs_ok and root_ok
    print(f"\nOverall: {'All good!' if overall_ok else 'Some issues found'}")

    return overall_ok

def main():
    print("Todo Web App - Structure Verification")
    print("=" * 50)

    success = check_project_structure()

    if success:
        print("\nThe Todo Web App project structure is complete!")
        print("\nNext steps:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Set up environment variables in .env")
        print("   3. Run with Docker: docker-compose up --build")
        print("   4. Or run separately: start backend and frontend independently")
    else:
        print("\nSome files are missing. Please check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()