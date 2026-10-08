@echo off
echo ========================================================
echo        Starting BookLoop Full-Stack Platform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Flask Backend on http://localhost:5000 ...
start "BookLoop Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && ..\backend\venv\Scripts\python.exe app.py"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
start "BookLoop Frontend (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ========================================================
echo Both servers are launching in dedicated terminal windows!
echo - Frontend UI:    http://localhost:5173
echo - Backend API:    http://localhost:5000/api
echo.
echo Admin Login:      admin@bookloop.com / Admin@123
echo Sample User:      rahul@example.com / Password@123
echo ========================================================
echo.
timeout /t 5
