# Todo Web App Backend

This is the backend API for the Todo Web App built with FastAPI, SQLModel, and PostgreSQL/Neon DB.

## Features

- JWT-based authentication and authorization
- User registration and login
- Task management (CRUD operations)
- User isolation (each user can only access their own data)
- Filtering, sorting, and pagination for tasks
- Task statistics endpoint
- Refresh token support
- Password hashing with bcrypt
- Comprehensive input validation

## Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/logout` - Logout and invalidate session
- `POST /api/v1/auth/refresh` - Refresh access token

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/me/tasks/stats` - Get task statistics

### Task Management
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks` - List tasks with filters and pagination
- `GET /api/v1/tasks/{task_id}` - Get a specific task
- `PUT /api/v1/tasks/{task_id}` - Update a task completely
- `PATCH /api/v1/tasks/{task_id}` - Partially update a task
- `DELETE /api/v1/tasks/{task_id}` - Delete a task

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and secret key
```

3. Run the application:
```bash
python backend/run.py
```

Or with uvicorn directly:
```bash
uvicorn backend.main:app --reload
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL/Neon DB connection string
- `SECRET_KEY`: Secret key for JWT signing (should be 32+ characters)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time (default: 7)

## Security

- All endpoints except health checks and auth endpoints require JWT authentication
- Passwords are hashed using bcrypt
- User isolation ensures users can only access their own data
- Input validation is performed on all requests
- Refresh tokens are securely stored with hash values
- Token expiration is properly validated

## Architecture

The backend follows these principles:
- JWT stateless authentication
- User isolation at the database and application layers
- Async patterns throughout using FastAPI and async SQLAlchemy
- Clean separation of concerns with models, schemas, routes, and middleware
- Comprehensive error handling with consistent response formats