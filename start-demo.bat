@echo off
REM Spelklar Demo Start Script for Windows
REM This script starts both backend and frontend servers and seeds demo data

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Spelklar Demo...
echo.

REM Check if Node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

echo 📦 Installing and seeding backend...
cd spelklar-server
call npm install >nul 2>&1
call npm run seed

if errorlevel 1 (
    echo ❌ Backend setup failed
    pause
    exit /b 1
)

echo.
echo 📦 Installing frontend...
cd ..\spelklar-client
call npm install >nul 2>&1

if errorlevel 1 (
    echo ❌ Frontend setup failed
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo 🔧 Starting servers...
echo.
echo 📍 Backend will start on: http://localhost:3001
echo 📍 Frontend will start on: http://localhost:5173
echo.
echo Close this window or press Ctrl+C to stop servers
echo.

REM Start backend in new window
start "Spelklar Backend" cmd /k "cd spelklar-server && npm start"

REM Give backend time to start
timeout /t 2 /nobreak

REM Start frontend in new window
start "Spelklar Frontend" cmd /k "cd spelklar-client && npm run dev"

echo.
echo 🎉 Both servers started! Check the new windows.
echo.
pause
