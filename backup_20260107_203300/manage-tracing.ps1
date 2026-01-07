# ============================================================================
# OpenTelemetry Tracing Management Script
# ============================================================================
# This script helps manage Jaeger and distributed tracing infrastructure
# ============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "ui", "help")]
    [string]$Action = "help"
)

$JaegerComposeFile = "docker-compose.tracing.yml"
$JaegerUI = "http://localhost:16686"
$JaegerHealth = "http://localhost:14269"

function Show-Help {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  OpenTelemetry Tracing Management" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\manage-tracing.ps1 [action]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Green
    Write-Host "  start      Start Jaeger tracing infrastructure" -ForegroundColor White
    Write-Host "  stop       Stop Jaeger containers" -ForegroundColor White
    Write-Host "  restart    Restart Jaeger services" -ForegroundColor White
    Write-Host "  status     Check Jaeger service status" -ForegroundColor White
    Write-Host "  logs       View Jaeger logs" -ForegroundColor White
    Write-Host "  ui         Open Jaeger UI in browser" -ForegroundColor White
    Write-Host "  help       Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\manage-tracing.ps1 start" -ForegroundColor Gray
    Write-Host "  .\manage-tracing.ps1 status" -ForegroundColor Gray
    Write-Host "  .\manage-tracing.ps1 ui" -ForegroundColor Gray
    Write-Host ""
}

function Start-Tracing {
    Write-Host "🚀 Starting Jaeger tracing infrastructure..." -ForegroundColor Green
    Write-Host ""
    
    # Check if Docker is running
    try {
        docker ps | Out-Null
    } catch {
        Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }
    
    # Start Jaeger
    Write-Host "📦 Starting Jaeger containers..." -ForegroundColor Cyan
    docker-compose -f $JaegerComposeFile up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Jaeger started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Jaeger UI: $JaegerUI" -ForegroundColor Cyan
        Write-Host "🏥 Health Check: $JaegerHealth" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⏳ Waiting for Jaeger to be healthy..." -ForegroundColor Yellow
        
        Start-Sleep -Seconds 5
        
        try {
            $response = Invoke-WebRequest -Uri $JaegerHealth -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Jaeger is healthy and ready!" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Jaeger is starting... (may take a few more seconds)" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Magenta
        Write-Host "1. Set TRACING_ENABLED=true in backend/.env" -ForegroundColor White
        Write-Host "2. Set NEXT_PUBLIC_TRACING_ENABLED=true in frontend/.env.local" -ForegroundColor White
        Write-Host "3. Start your backend and frontend services" -ForegroundColor White
        Write-Host "4. Open Jaeger UI: .\manage-tracing.ps1 ui" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ Failed to start Jaeger!" -ForegroundColor Red
        exit 1
    }
}

function Stop-Tracing {
    Write-Host "🛑 Stopping Jaeger tracing infrastructure..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $JaegerComposeFile down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Jaeger stopped successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Failed to stop Jaeger!" -ForegroundColor Red
        exit 1
    }
}

function Restart-Tracing {
    Write-Host "🔄 Restarting Jaeger..." -ForegroundColor Cyan
    Write-Host ""
    
    Stop-Tracing
    Start-Sleep -Seconds 2
    Start-Tracing
}

function Show-Status {
    Write-Host "📊 Jaeger Status" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if containers are running
    $containers = docker ps --filter "name=theeeecopy-jaeger" --format "{{.Names}}: {{.Status}}"
    
    if ($containers) {
        Write-Host "✅ Running Containers:" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
        Write-Host ""
        
        # Check health
        try {
            $response = Invoke-WebRequest -Uri $JaegerHealth -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Health: OK" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Health: Not responding" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "📊 Jaeger UI: $JaegerUI" -ForegroundColor Cyan
        Write-Host "🏥 Health Check: $JaegerHealth" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Jaeger is not running" -ForegroundColor Red
        Write-Host ""
        Write-Host "Start Jaeger with: .\manage-tracing.ps1 start" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Show-Logs {
    Write-Host "📋 Jaeger Logs (press Ctrl+C to exit)" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $JaegerComposeFile logs -f
}

function Open-UI {
    Write-Host "🌐 Opening Jaeger UI in browser..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if Jaeger is running
    $containers = docker ps --filter "name=theeeecopy-jaeger" --format "{{.Names}}"
    
    if (-not $containers) {
        Write-Host "❌ Jaeger is not running!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Start Jaeger first: .\manage-tracing.ps1 start" -ForegroundColor Yellow
        exit 1
    }
    
    # Open in default browser
    Start-Process $JaegerUI
    
    Write-Host "✅ Jaeger UI opened: $JaegerUI" -ForegroundColor Green
    Write-Host ""
}

# Main script execution
switch ($Action) {
    "start"   { Start-Tracing }
    "stop"    { Stop-Tracing }
    "restart" { Restart-Tracing }
    "status"  { Show-Status }
    "logs"    { Show-Logs }
    "ui"      { Open-UI }
    "help"    { Show-Help }
    default   { Show-Help }
}
