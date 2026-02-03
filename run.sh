#!/bin/bash

# Script to run the Todo Web App locally

echo "Starting Todo Web App..."

# Start the backend in the background
echo "Starting backend..."
cd backend &
uvicorn main:app --reload --port 8000 &

# Start the frontend in the background
echo "Starting frontend..."
cd ../frontend &
npm run dev &

echo "Applications started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop"

# Wait for both processes
wait