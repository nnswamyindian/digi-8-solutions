# Digi8 Solutions - PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      DIGI8 SOLUTIONS - FULL STACK LAUNCHER" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

Write-Host "[1/3] Checking root frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Frontend dependencies found." -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Checking backend server dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Gray
    Push-Location server
    npm install
    Pop-Location
} else {
    Write-Host "Backend dependencies found." -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] Starting Frontend (Port 5173) and Backend (Port 3001)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Main Website:  http://localhost:5173" -ForegroundColor White
Write-Host "  Admin Portal:  http://localhost:5173/admin" -ForegroundColor White
Write-Host "  Staff Portal:  http://localhost:5173/admin/staff" -ForegroundColor White
Write-Host "  Backend API:   http://localhost:3001/api" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor DarkGray
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
