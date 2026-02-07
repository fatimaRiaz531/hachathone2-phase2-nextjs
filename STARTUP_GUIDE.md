# Todo Web App Startup Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- PostgreSQL or access to Neon DB

## Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your database URL and secret key:
   ```env
   DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/todo_app
   SECRET_KEY=your-super-secret-key-change-this-in-production
   ```

5. Start the backend server:
   ```bash
   python run.py
   ```
   The backend will start on `http://localhost:8000`

## Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Make sure the `.env.local` file has:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

## API Documentation
Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## Testing the Application
1. Visit `http://localhost:3000` in your browser
2. Click "Sign up" to create a new account
3. Log in with your credentials
4. Add, update, delete, and mark tasks as complete

## Troubleshooting
- If you get "Not Found" errors, make sure the backend server is running on port 8000
- Check that your environment variables are set correctly
- Verify that your database connection is working
- Look at browser console and backend logs for error details