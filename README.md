# Evolution of Todo Project

## Project Overview

This project implements the "Evolution of Todo" application, following spec-driven development methodology. The project consists of two phases:

- **Phase I**: Console-based Todo application with in-memory storage
- **Phase II**: Full-stack web application with authentication and database persistence

## Phase I: Console App

The console application is located in the root directory and can be run with:

```bash
python todo_console.py
```

### Features
- Add, list, complete, edit, and delete tasks
- Save and load tasks to/from JSON files
- In-memory storage
- Console-based user interface

### Commands
- `add <title> [description]` - Add a new task
- `list` - List all tasks
- `complete <id>` - Mark task as completed
- `delete <id>` - Delete a task
- `edit <id> <title> [description]` - Edit a task
- `save <filename>` - Save tasks to file
- `load <filename>` - Load tasks from file
- `quit` - Exit the application

## Phase II: Web App

The web application consists of:
- **Frontend**: Next.js application in the `frontend/` directory
- **Backend**: FastAPI application in the `backend/` directory

### Backend Setup

1. Make sure you have `uv` installed
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `uv sync`
4. Run the application: `uv run python main.py`

#### Dependencies
- FastAPI: Modern, fast web framework
- Pydantic: Data validation and settings management
- SQLModel: SQL databases with Python
- psycopg2: PostgreSQL adapter
- python-dotenv: Environment variable management
- uvicorn: ASGI server

#### Environment Variables
Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
NEON_DATABASE_URL=your_neon_database_url
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=True
```

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

#### Dependencies
- Next.js 16+
- React 19+
- TypeScript
- Tailwind CSS
- Better Auth (for authentication)

## Architecture

The project follows clean architecture principles:
- Separation of concerns between business logic, data access, and presentation layers
- Security-first approach with authentication and authorization
- Spec-driven development methodology
- Testable business logic independent of frameworks

## Technologies

### Phase I:
- Python 3.9+
- In-memory storage

### Phase II:
- Frontend: Next.js 16+, React 19+, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLModel
- Database: PostgreSQL (Neon)
- Authentication: Better Auth, JWT