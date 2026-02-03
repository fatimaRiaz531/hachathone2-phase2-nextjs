# Todo Web App with Authentication

A full-stack todo application featuring user authentication, task management, and a responsive UI.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Task Management**: Create, read, update, and delete tasks
- **User Isolation**: Each user sees only their own tasks
- **Responsive UI**: Mobile-first design with Next.js and Tailwind CSS
- **RESTful API**: FastAPI backend with async operations
- **Database**: PostgreSQL with Neon DB compatibility

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel (Pydantic + SQLAlchemy hybrid)
- **Database**: PostgreSQL-compatible (tested with Neon DB)
- **Authentication**: JWT with python-jose/cryptography
- **Validation**: Pydantic v2
- **Async**: asyncio, asyncpg for database connections

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS with responsive-first design
- **State Management**: React hooks, SWR/react-query for data fetching
- **Authentication**: JWT token management

## Project Structure

```
todo-web-app/
├── backend/                    # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── models.py              # SQLModel database models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── database.py            # DB connection/session management
│   ├── dependencies.py        # FastAPI dependency injection
│   ├── middleware/            # Authentication, logging, etc.
│   │   └── auth.py            # JWT authentication
│   └── routes/                # API route handlers
│       ├── auth.py            # Authentication endpoints
│       ├── tasks.py           # Task management endpoints
│       └── users.py           # User management endpoints
├── frontend/                   # Next.js frontend
│   ├── app/                   # App Router pages
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   ├── dashboard/page.tsx # Dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   │   ├── TaskCard.tsx       # Task display component
│   │   ├── TaskForm.tsx       # Task creation/editing form
│   │   └── AuthGuard.tsx      # Authentication wrapper
│   ├── lib/                   # Utility functions
│   │   ├── api/               # API client and requests
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Helper functions
│   └── public/                # Static assets
├── specs/                      # Specification files
│   ├── constitution.md        # Project constitution
│   ├── features/              # Feature specifications
│   ├── api/                   # API endpoint specs
│   ├── ui/                    # User interface specs
│   └── database/              # Database schema specs
├── requirements.txt           # Python dependencies
├── package.json               # Node.js dependencies
├── docker-compose.yml         # Container orchestration
└── README.md                  # Project documentation
```

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Or Python 3.8+ and Node.js 18+

### Option 1: Using Docker (Recommended)

1. Clone the repository
2. Create a `.env` file with the following variables:
   ```bash
   # Neon PostgreSQL Database Configuration
   NEON_DATABASE_URL=postgresql+asyncpg://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname

   # JWT Configuration
   SECRET_KEY=your_very_long_secret_key_here_replace_with_secure_random_string
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Better Auth Configuration (if using Better Auth)
   BETTER_AUTH_SECRET=your_better_auth_secret_here
   BETTER_AUTH_URL=http://localhost:8000

   # Frontend Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Run the application:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/api/v1/docs`
- Frontend: `http://localhost:3000`

### Option 2: Local Development

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set environment variables:
   ```bash
   export DATABASE_URL=postgresql+asyncpg://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname
   export SECRET_KEY=your_very_long_secret_key_here
   ```
5. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```bash
# Database Configuration (Neon PostgreSQL)
NEON_DATABASE_URL=postgresql+asyncpg://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname

# JWT Configuration
SECRET_KEY=your_very_long_secret_key_here_replace_with_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Development Settings
DEBUG=True

# Better Auth Configuration (if using Better Auth)
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:8000
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000

# Development Settings
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Token refresh

### User Management
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user

### Task Management
- `GET /api/v1/tasks` - Get all tasks (with filtering, sorting, pagination)
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/{task_id}` - Get a specific task
- `PUT /api/v1/tasks/{task_id}` - Update a task
- `PATCH /api/v1/tasks/{task_id}` - Partially update a task
- `DELETE /api/v1/tasks/{task_id}` - Delete a task
- `GET /api/v1/users/me/tasks/stats` - Get task statistics

## Security Features

- JWT stateless authentication
- Password hashing with bcrypt
- Input validation at all levels
- SQL injection prevention via ORM parameterization
- User data isolation (each user can only access their own data)

## Architecture Highlights

- **JWT Stateless Authentication**: All API endpoints require JWT tokens in Authorization header
- **User Isolation**: Every database query filters by authenticated user's ID
- **Async Patterns**: All route handlers use async/await with async SQLAlchemy
- **Clean Architecture**: Clear separation of concerns with models, schemas, routes, and middleware
- **Server Components**: Default to React Server Components unless client interaction required

## Deployment

### Neon PostgreSQL Setup
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the project dashboard
4. Use this as your `NEON_DATABASE_URL` environment variable

### Deploying to Render (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect to your GitHub account and select this repository
4. Choose the `backend` directory as the root directory
5. Environment: Python
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
8. Instance Type: Free
9. Add environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SECRET_KEY`: Generate a secure secret key (use `openssl rand -hex 32`)
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
   - `DEBUG`: `False`
10. Click "Create Web Service"

### Deploying to Vercel (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" → "Import Git Repository"
3. Select this GitHub repository
4. Choose the `frontend` directory as the root directory
5. Framework preset: Next.js (should auto-detect)
6. Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL from Render deployment (append `/api/v1`)
7. Build settings:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `out`
8. Click "Deploy"

### Alternative Deployment Methods
For detailed deployment instructions including troubleshooting and scaling considerations, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

### Production Docker Setup
For production deployment, update the docker-compose.yml with:
- SSL certificates
- Production database configuration
- Environment-specific settings
- Health checks and monitoring

## Development

This project follows a spec-driven development approach. All code is generated from specifications to ensure consistency and maintainability.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.