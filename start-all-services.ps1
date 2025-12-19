# ============================================================================
# سكريبت بدء جميع الخدمات - The Copy
# Start All Services Script
# ============================================================================
# يقوم بتشغيل جميع الخدمات المطلوبة بالترتيب الصحيح
# ============================================================================

param(
    [switch]$SkipRedis,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipMonitoring
)

$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  بدء جميع الخدمات - Starting All Services" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# الخطوة 1: فحص المتطلبات
# ============================================================================
Write-Host "[1/6] فحص المتطلبات..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js غير مثبت!" -ForegroundColor Red
    Write-Host "  💡 قم بتثبيت Node.js من: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✅ pnpm: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pnpm غير مثبت!" -ForegroundColor Red
    Write-Host "  💡 قم بتثبيته: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check Docker (optional)
try {
    $dockerVersion = docker --version
    Write-Host "  ✅ Docker: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "  ⚠️  Docker غير متاح (اختياري)" -ForegroundColor Yellow
    $dockerAvailable = $false
}

Write-Host ""

# ============================================================================
# الخطوة 2: تشغيل Redis
# ============================================================================
if (-not $SkipRedis) {
    Write-Host "[2/6] تشغيل Redis..." -ForegroundColor Yellow
    
    # Check if Redis is already running
    try {
        $redisCheck = redis-cli PING 2>$null
        if ($redisCheck -eq "PONG") {
            Write-Host "  ✅ Redis يعمل بالفعل" -ForegroundColor Green
        }
    } catch {
        # Try to start Redis with Docker
        if ($dockerAvailable) {
            Write-Host "  🐳 محاولة تشغيل Redis في Docker..." -ForegroundColor Yellow
            
            # Check if container exists
            $containerExists = docker ps -a --filter "name=redis" --format "{{.Names}}" 2>$null
            
            if ($containerExists -eq "redis") {
                # Container exists, start it
                docker start redis 2>$null | Out-Null
                Write-Host "  ✅ Redis container تم تشغيله" -ForegroundColor Green
            } else {
                # Create and start new container
                docker run -d --name redis -p 6379:6379 --restart unless-stopped redis:alpine 2>$null | Out-Null
                Write-Host "  ✅ Redis container تم إنشاؤه وتشغيله" -ForegroundColor Green
            }
            
            # Wait for Redis to be ready
            Start-Sleep -Seconds 2
            
            # Verify
            try {
                $redisCheck = redis-cli PING 2>$null
                if ($redisCheck -eq "PONG") {
                    Write-Host "  ✅ Redis جاهز!" -ForegroundColor Green
                }
            } catch {
                Write-Host "  ⚠️  Redis قد لا يكون جاهزاً بعد" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠️  Redis غير متاح" -ForegroundColor Yellow
            Write-Host "  💡 راجع: REDIS_SETUP_GUIDE.md" -ForegroundColor Yellow
            Write-Host "  💡 أو استخدم: docker run -d --name redis -p 6379:6379 redis:alpine" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[2/6] تخطي Redis (--SkipRedis)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# الخطوة 3: تثبيت Dependencies (إذا لزم الأمر)
# ============================================================================
Write-Host "[3/6] فحص Dependencies..." -ForegroundColor Yellow

# Check backend node_modules
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "  📦 تثبيت Backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    pnpm install --silent
    Pop-Location
    Write-Host "  ✅ Backend dependencies مثبتة" -ForegroundColor Green
} else {
    Write-Host "  ✅ Backend dependencies موجودة" -ForegroundColor Green
}

# Check frontend node_modules
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  📦 تثبيت Frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    pnpm install --silent
    Pop-Location
    Write-Host "  ✅ Frontend dependencies مثبتة" -ForegroundColor Green
} else {
    Write-Host "  ✅ Frontend dependencies موجودة" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# الخطوة 4: تشغيل Backend
# ============================================================================
if (-not $SkipBackend) {
    Write-Host "[4/6] تشغيل Backend..." -ForegroundColor Yellow
    
    # Check if already running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Backend يعمل بالفعل" -ForegroundColor Green
        }
    } catch {
        Write-Host "  🚀 بدء Backend..." -ForegroundColor Yellow
        
        # Start Backend in new window
        $backendPath = Join-Path $PWD "backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server' -ForegroundColor Cyan; pnpm dev" -WindowStyle Normal
        
        Write-Host "  ⏳ انتظار Backend..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Verify
        $maxRetries = 10
        $retryCount = 0
        $backendReady = $false
        
        while ($retryCount -lt $maxRetries -and -not $backendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $backendReady = $true
                    Write-Host "  ✅ Backend جاهز!" -ForegroundColor Green
                }
            } catch {
                $retryCount++
                Start-Sleep -Seconds 2
            }
        }
        
        if (-not $backendReady) {
            Write-Host "  ⚠️  Backend قد يستغرق وقتاً أطول للبدء" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[4/6] تخطي Backend (--SkipBackend)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# الخطوة 5: تشغيل Frontend
# ============================================================================
if (-not $SkipFrontend) {
    Write-Host "[5/6] تشغيل Frontend..." -ForegroundColor Yellow
    
    # Check if already running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Frontend يعمل بالفعل" -ForegroundColor Green
        }
    } catch {
        Write-Host "  🚀 بدء Frontend..." -ForegroundColor Yellow
        
        # Start Frontend in new window
        $frontendPath = Join-Path $PWD "frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server' -ForegroundColor Cyan; pnpm dev" -WindowStyle Normal
        
        Write-Host "  ⏳ انتظار Frontend..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host "  ✅ Frontend بدأ (قد يستغرق دقيقة للتحميل)" -ForegroundColor Green
    }
} else {
    Write-Host "[5/6] تخطي Frontend (--SkipFrontend)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# الخطوة 6: تشغيل Monitoring (اختياري)
# ============================================================================
if (-not $SkipMonitoring) {
    Write-Host "[6/6] تشغيل Monitoring (اختياري)..." -ForegroundColor Yellow
    
    if ($dockerAvailable) {
        # Check if monitoring is already running
        $prometheusRunning = docker ps --filter "name=prometheus" --format "{{.Names}}" 2>$null
        $grafanaRunning = docker ps --filter "name=grafana" --format "{{.Names}}" 2>$null
        
        if ($prometheusRunning -and $grafanaRunning) {
            Write-Host "  ✅ Monitoring يعمل بالفعل" -ForegroundColor Green
        } else {
            Write-Host "  💡 لتشغيل Monitoring:" -ForegroundColor Yellow
            Write-Host "     cd monitoring" -ForegroundColor Gray
            Write-Host "     docker-compose up -d" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⏭️  تخطي (يحتاج Docker)" -ForegroundColor Gray
    }
} else {
    Write-Host "[6/6] تخطي Monitoring (--SkipMonitoring)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# ملخص النتائج
# ============================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ملخص الخدمات - Services Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check all services
$services = @()

# Redis
try {
    $redisCheck = redis-cli PING 2>$null
    $redisStatus = ($redisCheck -eq "PONG")
} catch {
    $redisStatus = $false
}
$services += @{Name="Redis"; Status=$redisStatus; URL="redis://localhost:6379"}

# Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendStatus = ($response.StatusCode -eq 200)
} catch {
    $backendStatus = $false
}
$services += @{Name="Backend API"; Status=$backendStatus; URL="http://localhost:3001"}

# BullMQ
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/admin/queues" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $bullStatus = ($response.StatusCode -eq 200)
} catch {
    $bullStatus = $false
}
$services += @{Name="BullMQ Dashboard"; Status=$bullStatus; URL="http://localhost:3001/admin/queues"}

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $frontendStatus = ($response.StatusCode -eq 200)
} catch {
    $frontendStatus = $false
}
$services += @{Name="Frontend"; Status=$frontendStatus; URL="http://localhost:5000"}

# Display services
foreach ($service in $services) {
    $status = if ($service.Status) { "✅ يعمل" } else { "❌ معطّل" }
    $color = if ($service.Status) { "Green" } else { "Red" }
    
    Write-Host "  $($service.Name): " -NoNewline
    Write-Host $status -ForegroundColor $color
    if ($service.Status) {
        Write-Host "    🌐 $($service.URL)" -ForegroundColor Cyan
    }
}

Write-Host ""

# ============================================================================
# الروابط المفيدة
# ============================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  روابط مفيدة - Useful Links" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($backendStatus) {
    Write-Host "  📊 API Health: http://localhost:3001/api/health" -ForegroundColor Cyan
}

if ($bullStatus) {
    Write-Host "  📋 Queue Dashboard: http://localhost:3001/admin/queues" -ForegroundColor Cyan
}

if ($frontendStatus) {
    Write-Host "  🌐 Application: http://localhost:5000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "  📖 التوثيق:" -ForegroundColor Cyan
Write-Host "     - SERVICES_ANALYSIS_REPORT.md" -ForegroundColor Gray
Write-Host "     - SERVICES_QUICK_FIX_AR.md" -ForegroundColor Gray
Write-Host "     - REDIS_SETUP_GUIDE.md" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ اكتمل!" -ForegroundColor Green
Write-Host ""
