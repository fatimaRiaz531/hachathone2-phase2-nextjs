# Deployment Guide for Todo Web App

This guide provides step-by-step instructions to deploy your Todo Web App to Vercel (frontend) and Render (backend).

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
3. Connect to your GitHub account and select the repository
4. Choose the `backend` directory
5. For the root directory, enter `backend`
6. Environment: Python
7. Build Command: `pip install -r requirements.txt`
8. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
9. Instance Type: Free
10. Add environment variables:
    - `DATABASE_URL`: Your Neon PostgreSQL connection string
    - `SECRET_KEY`: Generate a secure secret key (use `openssl rand -hex 32`)
    - `ALGORITHM`: `HS256`
    - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
    - `DEBUG`: `False`
11. Click "Create Web Service"

### Step 3: Note your Backend URL
- After deployment completes, note the URL (e.g., `https://your-app.onrender.com`)
- This will be used in the frontend deployment

## Part 2: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project" → "Import Git Repository"
3. Select your GitHub repository
4. Choose the `frontend` directory as the root directory
5. Framework preset: Next.js (should auto-detect)
6. Environment Variables:
    - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL from Step 1 (e.g., `https://your-backend.onrender.com/api/v1`)
7. Build settings:
    - Build Command: `cd frontend && npm run build`
    - Output Directory: `frontend/out` (or just `out` if using subdirectory)
    - Root Directory: `frontend`
8. Click "Deploy"

### Step 2: Configure Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add the following variables:
    - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL from Part 1 (append `/api/v1`)

## Alternative Method: Using Vercel CLI

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Set Environment Variables via CLI
```bash
vercel env add NEXT_PUBLIC_API_BASE_URL
# Enter your backend API URL (e.g., https://your-backend.onrender.com/api/v1)
```

## Alternative Method: Using Render CLI

### Install Render Blueprint
Render deployments can be managed through their blueprint file (`render.yaml`) which is already included in the backend directory.

## Configuration Notes

### For Backend (Render)
- The app expects environment variables as defined in the render.yaml
- Make sure to use a strong `SECRET_KEY` for JWT tokens
- The database connection will be handled by Neon

### For Frontend (Vercel)
- The `NEXT_PUBLIC_API_BASE_URL` should point to your deployed backend with `/api/v1` suffix
- Example: If your backend is `https://todo-backend.onrender.com`, then set `NEXT_PUBLIC_API_BASE_URL=https://todo-backend.onrender.com/api/v1`

## Post-Deployment Steps

### 1. Test the API
- Visit your backend URL + `/docs` to access the Swagger UI
- Example: `https://your-backend.onrender.com/docs`
- Test the `/health` endpoint to ensure the API is running

### 2. Test the Frontend
- Visit your frontend URL from Vercel
- Try registering a new user
- Test creating and managing tasks

### 3. Configure Custom Domains (Optional)
Both Vercel and Render allow custom domain configuration in their dashboards.

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