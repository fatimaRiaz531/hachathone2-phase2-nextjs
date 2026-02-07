# Todo Web App - Complete Full-Stack Application

A comprehensive todo web application with authentication, built using a modern tech stack featuring Next.js 16+, FastAPI, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Complete JWT-based authentication system
- **Task Management**: Full CRUD operations for todos with filtering and sorting
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Modern Tech Stack**: Next.js 16+ with App Router, FastAPI, PostgreSQL
- **Real-time Updates**: Live task management experience
- **Secure**: Industry-standard security practices

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks and SWR/react-query

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL (compatible with Neon DB)
- **ORM**: SQLModel (Pydantic + SQLAlchemy hybrid)
- **Authentication**: JWT with python-jose
- **Validation**: Pydantic v2

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Neon DB (serverless PostgreSQL)
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+ for frontend
- Python 3.8+ for backend
- PostgreSQL (or Neon DB account)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd todo-web-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secret keys

# Run the backend
python run.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Run the frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏗️ Project Structure

```
todo-web-app/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # SQLModel database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # DB connection/session management
│   ├── middleware/
│   │   └── auth.py          # JWT authentication middleware
│   └── routes/
│       ├── auth.py          # Authentication endpoints
│       ├── tasks.py         # Task management endpoints
│       └── users.py         # User management endpoints
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── login/page.tsx   # Login page
│   │   ├── register/page.tsx # Registration page
│   │   ├── dashboard/page.tsx # Dashboard page
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions
│   └── next.config.js       # Next.js configuration
├── docker-compose.yml       # Container orchestration
├── requirements.txt         # Python dependencies
├── package.json             # Node.js dependencies
└── README.md
```

## 🐳 Docker Setup

Build and run with Docker Compose:

```bash
# Build and start both services
docker-compose up --build

# Backend will be available at http://localhost:8000
# Frontend will be available at http://localhost:3000
```

## 🚢 Deployment

### Backend to Render
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the root directory to `/backend`
4. Add environment variables from `.env`
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend to Vercel
1. Create a new project on Vercel
2. Connect to your GitHub repository
3. Set the root directory to `/frontend`
4. Add environment variables from `.env.local`
5. Vercel will automatically detect and configure Next.js

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔧 API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## 🤖 Phase III (AI-Powered Todo Chatbot)

Phase III introduces a conversational AI assistant that allows you to manage tasks using natural language.

### How to run Phase III Chatbot

1. **Environment Setup**:
   Ensure you have the following environment variables set:
   - **Backend (.env)**:
     ```env
     OPENAI_API_KEY=your-openai-api-key
     ```
   - **Frontend (.env.local)**:
     ```env
     NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-openai-domain-key
     ```

2. **Start the MCP Server**:
   The chatbot uses an MCP server for task management tools.
   ```bash
   cd backend
   python mcp_server.py
   ```

3. **Start the Backend**:
   In a separate terminal:
   ```bash
   cd backend
   python main.py
   ```

4. **Start the Frontend**:
   In another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Interact with the Chatbot**:
   - Open `http://localhost:3000/dashboard` in your browser.
   - Click the floating chat icon in the bottom-right corner.
   - Try commands like:
     - "Add a task to buy groceries tonight"
     - "Show me my pending tasks"
     - "Mark task [id] as complete"
     - "Delete task [id]"

### Tech Stack (Phase III)
- **OpenAI ChatKit**: Modern UI for conversational AI.
- **OpenAI Agents SDK**: Intelligent tool orchestration.
- **Official MCP SDK**: Stateless protocol for exposing Python tools to AI agents.
- **Conversation State**: History persisted in PostgreSQL via `Conversation` and `Message` models.

---

Built with ❤️ using Next.js, FastAPI, and PostgreSQL

