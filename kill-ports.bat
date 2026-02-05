@echo off
echo Killing processes on ports 3000, 4200, and 4201...
echo.

REM Find and kill process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a /T >nul 2>&1
)

REM Find and kill process on port 4200
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do (
    echo Killing process on port 4200 (PID: %%a)
    taskkill /F /PID %%a /T >nul 2>&1
)

REM Find and kill process on port 4201
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4201') do (
    echo Killing process on port 4201 (PID: %%a)
    taskkill /F /PID %%a /T >nul 2>&1
)

echo.
echo ✅ All ports cleared!
echo You can now run: npm run dev
