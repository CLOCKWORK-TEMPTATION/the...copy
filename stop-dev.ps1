param(
  [switch] $Force
)

$ErrorActionPreference = "Continue"

Write-Host "=== Stopping The Copy Development Environment ===" -ForegroundColor Cyan
Write-Host ""

$processesKilled = 0
$errors = 0

# Stop Node.js processes (Backend & Frontend)
Write-Host "[1/2] Stopping Node.js servers..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
  foreach ($proc in $nodeProcesses) {
    try {
      $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
      # Check if it's our dev servers (contains 'pnpm' or 'next' or 'tsc-watch')
      if ($cmdLine -match "pnpm|next|tsc-watch|the-copy|backend|frontend") {
        if ($Force) {
          Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        } else {
          Stop-Process -Id $proc.Id -ErrorAction Stop
        }
        Write-Host "  ✓ Stopped Node.js process (PID: $($proc.Id))" -ForegroundColor Green
        $processesKilled++
      }
    } catch {
      Write-Host "  ⚠ Could not stop process $($proc.Id): $($_.Exception.Message)" -ForegroundColor Yellow
      $errors++
    }
  }
} else {
  Write-Host "  → No Node.js processes found" -ForegroundColor Gray
}

# Stop Redis server
Write-Host ""
Write-Host "[2/2] Stopping Redis server..." -ForegroundColor Cyan
$redisProcess = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue

if ($redisProcess) {
  try {
    if ($Force) {
      Stop-Process -Name "redis-server" -Force -ErrorAction Stop
    } else {
      Stop-Process -Name "redis-server" -ErrorAction Stop
    }
    Write-Host "  ✓ Redis server stopped (PID: $($redisProcess.Id))" -ForegroundColor Green
    $processesKilled++
  } catch {
    Write-Host "  ⚠ Could not stop Redis: $($_.Exception.Message)" -ForegroundColor Yellow
    $errors++
  }
} else {
  Write-Host "  → Redis not running" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Processes stopped: $processesKilled" -ForegroundColor $(if ($processesKilled -gt 0) { "Green" } else { "Gray" })
Write-Host "  Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Yellow" } else { "Green" })

if ($errors -gt 0 -and -not $Force) {
  Write-Host ""
  Write-Host "Tip: Use -Force flag to forcefully kill processes" -ForegroundColor Yellow
  Write-Host "  .\stop-dev.ps1 -Force" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Development environment stopped." -ForegroundColor Green
