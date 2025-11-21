# Run The Copy in Development Mode
Write-Host "Starting The Copy in development mode..." -ForegroundColor Green

# Check required files
if (-not (Test-Path "backend\.env")) {
    Write-Host "backend\.env not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "frontend\.env not found" -ForegroundColor Red
    exit 1
}

# Kill previous processes
Write-Host "Stopping previous processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Green; pnpm dev"

# Wait for Backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server' -ForegroundColor Blue; pnpm dev"

Write-Host ""
Write-Host "Application started!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "- API Health: http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Press Ctrl+C in each window" -ForegroundColor Red