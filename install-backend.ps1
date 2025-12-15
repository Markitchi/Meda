# Installation Manuelle des Dépendances Backend

Write-Host "Installation des dépendances Meda Backend..." -ForegroundColor Cyan

$BackendPath = Join-Path $PSScriptRoot "backend"
Set-Location -Path $BackendPath

$VenvPip = Join-Path $BackendPath "venv\Scripts\pip.exe"

if (-not (Test-Path $VenvPip)) {
    Write-Host "Erreur: Environnement virtuel non trouvé!" -ForegroundColor Red
    Write-Host "Créez-le avec: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installation en cours..." -ForegroundColor Yellow
& $VenvPip install -r requirements.txt

Write-Host ""
Write-Host "✅ Installation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer le backend:" -ForegroundColor Yellow
Write-Host "  .\start-backend.ps1" -ForegroundColor White
