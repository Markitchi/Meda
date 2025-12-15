@echo off
echo ========================================
echo   Demarrage Backend Meda
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Activation environnement virtuel...
call venv\Scripts\activate.bat

echo [2/3] Installation des dependances...
pip install -q -r requirements.txt

echo [3/3] Demarrage du serveur...
echo.
echo Backend API: http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload
