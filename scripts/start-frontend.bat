@echo off
echo ========================================
echo   Demarrage Frontend Meda
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/2] Installation des dependances...
call npm install

echo [2/2] Demarrage du serveur...
echo.
echo Frontend: http://localhost:3001
echo.
npm run dev
