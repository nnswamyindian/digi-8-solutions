@echo off
title Digi8 Solutions - Full Stack Launcher
color 0b

echo ===================================================
echo       DIGI8 SOLUTIONS - FULL STACK LAUNCHER
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking root frontend dependencies...
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies are already installed.
)

echo.
echo [2/3] Checking backend server dependencies...
if not exist "server\node_modules\" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
) else (
    echo Backend dependencies are already installed.
)

echo.
echo [3/3] Starting Frontend (Port 5173) and Backend (Port 3001)...
echo.
echo - Web Application: http://localhost:5173
echo - Admin Portal:    http://localhost:5173/admin
echo - Backend API:     http://localhost:3001/api
echo.
echo Press Ctrl+C in this terminal window to stop all services.
echo ===================================================
echo.

call npm run dev
pause
