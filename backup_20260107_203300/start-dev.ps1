param(
  [string] $BackendPath = "$PSScriptRoot\backend",
  [string] $FrontendPath = "$PSScriptRoot\frontend",
  [int] $BackendPort = 3001,
  [int] $FrontendPort = 5000
)

Write-Host "Starting Redis server..." -ForegroundColor Cyan

# Start Redis server in minimized window
try {
  Start-Process -FilePath "$PSScriptRoot\redis\redis-server.exe" -WindowStyle Minimized -ErrorAction Stop
  Write-Host "Redis server started successfully" -ForegroundColor Green
} catch {
  Write-Host "Warning: Could not start Redis server - $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Application will continue without Redis (reduced functionality)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

Write-Host "Launching Backend and Frontend in separate PowerShell windows..." -ForegroundColor Yellow

# Backend window (auto-fallback from BackendPort implemented in server.ts)
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "Set-Location '$BackendPath'; $env:PORT=$BackendPort; pnpm run dev"
)

# Frontend window (auto-fallback implemented in scripts/dev-with-fallback.js)
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "Set-Location '$FrontendPath'; $env:PORT=$FrontendPort; pnpm run dev"
)

Write-Host "Backend starting from port $BackendPort; Frontend starting from port $FrontendPort" -ForegroundColor Green
