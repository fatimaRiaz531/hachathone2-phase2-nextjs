@echo off
REM Script to run the Todo Web App locally on Windows

echo Starting Todo Web App...

REM Start the backend in a new window
echo Starting backend...
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

REM Start the frontend in a new window
echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo Applications started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Press Ctrl+C in each window to stop

pause