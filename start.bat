@echo off
echo Starting YAMI OPS...

start cmd /k "cd backend && npm install && npm run dev"
timeout /t 2
start cmd /k "cd frontend && npm install && npm run dev"

echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
