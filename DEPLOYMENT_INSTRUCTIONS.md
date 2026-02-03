# Deployment Instructions for Todo Web App

This document provides step-by-step instructions to deploy the Todo Web App with Authentication to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (https://vercel.com/signup)
- Render account (https://render.com/signup)
- Neon PostgreSQL account (https://neon.tech)

## Part 1: Deploy Backend to Render

### Step 1: Set up Neon Database
1. Create an account at https://neon.tech
2. Create a new project called "todo-app"
3. Note the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname`)
4. Keep this connection string ready for the next steps

### Step 2: Deploy to Render
1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect to your GitHub account and select the repository `fatimaRiaz531/hachathone2-phase2-nextjs`
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

### Step 3: Note your Backend URL
- After deployment completes, note the URL (e.g., `https://your-app.onrender.com`)
- This will be used in the frontend deployment

## Part 2: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project" → "Import Git Repository"
3. Select your GitHub repository `fatimaRiaz531/hachathone2-phase2-nextjs`
4. Choose the `frontend` directory as the root directory
5. Framework preset: Next.js (should auto-detect)
6. Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL from Step 1 (e.g., `https://your-backend.onrender.com/api/v1`)
7. Build settings:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `out`
8. Click "Deploy"

### Step 2: Configure Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add the following variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL from Part 1 (append `/api/v1`)

## Testing the Deployed Application

### 1. Test the Backend API First:
1. Visit your backend URL + `/api/v1/docs` to see the interactive API documentation
2. Test the health endpoint: `GET /health`
3. Verify the API is responding correctly

### 2. Test User Registration:
1. Go to the frontend application
2. Click "Register" or visit `/register`
3. Create a new account with email and password
4. Verify you can log in with the new account

### 3. Test Task Management:
1. Log in to the application
2. Navigate to the dashboard or tasks page
3. Create a new task
4. Verify you can view, edit, and delete tasks
5. Test filtering and sorting functionality

### 4. Test Authentication:
1. Verify JWT tokens are properly handled
2. Test that unauthenticated users are redirected to login
3. Verify user data isolation (users only see their own tasks)

## What You'll See When Running

### Frontend Features:
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Authentication Flow**: Register/Login/Logout functionality
- **Dashboard**: Shows task statistics and recent tasks
- **Task Management**: Create, read, update, delete tasks
- **Filtering & Sorting**: Filter by status, sort by date/title
- **User Profile**: View and update user information

### Backend Features:
- **RESTful API**: Well-documented endpoints
- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: Each user sees only their own data
- **Database Integration**: PostgreSQL with Neon DB
- **Error Handling**: Consistent error responses
- **Validation**: Input validation at all levels

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify your Neon PostgreSQL connection string
   - Check that the database is properly configured

2. **Environment Variable Issues**
   - Ensure all required environment variables are set
   - Check that `NEXT_PUBLIC_API_BASE_URL` points to the correct backend

3. **CORS Issues**
   - Make sure your backend allows requests from your frontend domain
   - Check the `ALLOWED_ORIGINS` environment variable

4. **JWT Authentication Issues**
   - Verify that `SECRET_KEY` is the same in both frontend and backend
   - Ensure the key is sufficiently long and secure

### Helpful Links:
- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/

## Scaling Considerations

For production use:
- Upgrade from free tier for better performance
- Set up monitoring and alerts
- Implement proper logging
- Consider CDN for static assets
- Set up automated backups for the database