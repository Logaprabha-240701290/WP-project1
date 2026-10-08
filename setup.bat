@echo off
echo ========================================================
echo        BookLoop - One-Click Environment Setup
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Setting up Python virtual environment...
if not exist "backend\venv" (
    python -m venv backend\venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python 3.10+ is installed and in PATH.
        pause
        exit /b 1
    )
)

echo [2/4] Installing backend Python dependencies...
call backend\venv\Scripts\pip install -r backend\requirements.txt
if errorlevel 1 (
    echo [ERROR] Pip installation failed.
    pause
    exit /b 1
)

echo [3/4] Initializing and seeding SQLite database...
call backend\venv\Scripts\python.exe backend\seed.py
if errorlevel 1 (
    echo [ERROR] Database seeding failed.
    pause
    exit /b 1
)

echo [4/4] Installing frontend npm packages...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend npm install failed. Ensure Node.js is installed.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================================
echo [SUCCESS] BookLoop setup completed successfully!
echo You can now run start.bat to launch both servers.
echo ========================================================
echo.
pause
