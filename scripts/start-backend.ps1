# Démarrage Backend Meda
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Démarrage Backend Meda" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BackendPath = Join-Path $PSScriptRoot "backend"
Set-Location -Path $BackendPath

Write-Host "[1/3] Vérification environnement virtuel..." -ForegroundColor Yellow
$VenvPython = Join-Path $BackendPath "venv\Scripts\python.exe"
$VenvPip = Join-Path $BackendPath "venv\Scripts\pip.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Erreur: Environnement virtuel non trouvé!" -ForegroundColor Red
    Write-Host "Créez-le avec: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "[2/3] Installation des dépendances..." -ForegroundColor Yellow
& $VenvPip install -q -r requirements.txt

Write-Host "[3/3] Démarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend API: " -NoNewline
Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host "Documentation: " -NoNewline
Write-Host "http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

& $VenvPython -m uvicorn app.main:app --reload
