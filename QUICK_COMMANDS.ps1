# Quick Commands for The Copy Development
# Source this file: . .\QUICK_COMMANDS.ps1

# Start everything
function Start-Dev {
  .\start-dev.ps1
}

# Stop everything
function Stop-Dev {
  param([switch]$Force)
  if ($Force) {
    .\stop-dev.ps1 -Force
  } else {
    .\stop-dev.ps1
  }
}

# Restart everything
function Restart-Dev {
  param([switch]$Force)
  Write-Host "Restarting development environment..." -ForegroundColor Cyan
  Stop-Dev -Force:$Force
  Start-Sleep -Seconds 2
  Start-Dev
}

# Check what's running
function Check-Dev {
  Write-Host "=== Development Environment Status ===" -ForegroundColor Cyan
  Write-Host ""
  
  Write-Host "Node.js Processes:" -ForegroundColor Yellow
  $node = Get-Process -Name "node" -ErrorAction SilentlyContinue
  if ($node) {
    $node | Format-Table Id, ProcessName, CPU, WorkingSet -AutoSize
  } else {
    Write-Host "  No Node.js processes running" -ForegroundColor Gray
  }
  
  Write-Host ""
  Write-Host "Redis:" -ForegroundColor Yellow
  $redis = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
  if ($redis) {
    Write-Host "  ✓ Running (PID: $($redis.Id))" -ForegroundColor Green
  } else {
    Write-Host "  ✗ Not running" -ForegroundColor Red
  }
  
  Write-Host ""
  Write-Host "Ports:" -ForegroundColor Yellow
  $ports = @(3001, 5000, 6379)
  foreach ($port in $ports) {
    $connection = netstat -ano | Select-String ":$port " | Select-Object -First 1
    if ($connection) {
      Write-Host "  Port $port : IN USE" -ForegroundColor Green
    } else {
      Write-Host "  Port $port : FREE" -ForegroundColor Gray
    }
  }
}

# Open URLs
function Open-Dev {
  Start-Process "http://localhost:5000"
  Start-Process "http://localhost:3001/admin/queues"
}

# Logs
function Show-Logs {
  param(
    [ValidateSet("backend", "frontend", "redis")]
    [string]$Service = "backend"
  )
  
  switch ($Service) {
    "backend" {
      Get-Content ".\backend\logs\combined.log" -Tail 50 -Wait
    }
    "frontend" {
      Write-Host "Frontend logs are in the dev server window" -ForegroundColor Yellow
    }
    "redis" {
      Write-Host "Redis logs are in the redis-server window" -ForegroundColor Yellow
    }
  }
}

# Clean
function Clean-Dev {
  Write-Host "Cleaning development artifacts..." -ForegroundColor Cyan
  
  # Stop everything first
  Stop-Dev -Force
  
  # Clean node_modules (optional)
  $cleanModules = Read-Host "Clean node_modules? (y/N)"
  if ($cleanModules -eq "y") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item ".\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item ".\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
  }
  
  # Clean build artifacts
  Write-Host "Removing build artifacts..." -ForegroundColor Yellow
  Remove-Item ".\backend\dist" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item ".\frontend\.next" -Recurse -Force -ErrorAction SilentlyContinue
  
  Write-Host "✓ Cleanup complete" -ForegroundColor Green
}

# Help
function Help-Dev {
  Write-Host @"
=== The Copy Development Commands ===

Start-Dev           Start all services
Stop-Dev [-Force]   Stop all services
Restart-Dev         Restart all services
Check-Dev           Check status of all services
Open-Dev            Open frontend and admin in browser
Show-Logs [Service] Show logs (backend/frontend/redis)
Clean-Dev           Clean build artifacts
Help-Dev            Show this help

Examples:
  Start-Dev
  Stop-Dev -Force
  Restart-Dev
  Check-Dev
  Show-Logs backend

"@ -ForegroundColor Cyan
}

Write-Host "✓ Development commands loaded. Type 'Help-Dev' for usage." -ForegroundColor Green
