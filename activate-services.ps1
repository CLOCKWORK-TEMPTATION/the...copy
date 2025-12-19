# ============================================================================
# سكريبت تفعيل الخدمات المعطلة - The Copy
# Activate Disabled Services Script
# ============================================================================
# هذا السكريبت يقوم بتفعيل الخدمات الأساسية المعطلة في المشروع
# ============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  تفعيل الخدمات - The Copy Services Activation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. فحص Redis
# ============================================================================
Write-Host "[1/5] فحص Redis..." -ForegroundColor Yellow

$redisRunning = $false
try {
    $redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
    if ($redisProcess) {
        Write-Host "  ✅ Redis يعمل بالفعل" -ForegroundColor Green
        $redisRunning = $true
    }
} catch {
    # Redis not running
}

if (-not $redisRunning) {
    Write-Host "  ⚠️  Redis غير مفعّل" -ForegroundColor Red
    Write-Host "  📝 محاولة تشغيل Redis..." -ForegroundColor Yellow
    
    # Check if redis-server.exe exists
    $redisPath = ".\redis\redis-server.exe"
    if (Test-Path $redisPath) {
        Write-Host "  🚀 تشغيل Redis..." -ForegroundColor Yellow
        Start-Process -FilePath $redisPath -ArgumentList "redis\redis.windows.conf" -WindowStyle Minimized
        Start-Sleep -Seconds 2
        
        # Verify Redis started
        try {
            $redisCheck = redis-cli PING 2>$null
            if ($redisCheck -eq "PONG") {
                Write-Host "  ✅ Redis تم تشغيله بنجاح!" -ForegroundColor Green
                $redisRunning = $true
            }
        } catch {
            Write-Host "  ❌ فشل تشغيل Redis" -ForegroundColor Red
            Write-Host "  💡 الحل: قم بتشغيله يدوياً:" -ForegroundColor Yellow
            Write-Host "     cd redis" -ForegroundColor Gray
            Write-Host "     .\redis-server.exe redis.windows.conf" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ Redis غير مثبت" -ForegroundColor Red
        Write-Host "  💡 الحل: قم بتثبيت Redis أو استخدم Docker:" -ForegroundColor Yellow
        Write-Host "     docker run -d --name redis -p 6379:6379 redis:alpine" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================================================
# 2. فحص Backend
# ============================================================================
Write-Host "[2/5] فحص Backend..." -ForegroundColor Yellow

$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend يعمل" -ForegroundColor Green
        $backendRunning = $true
        
        # Check Redis connection in backend
        $healthData = $response.Content | ConvertFrom-Json
        if ($healthData.redis -eq "connected") {
            Write-Host "  ✅ Backend متصل بـ Redis" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Backend غير متصل بـ Redis" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ⚠️  Backend غير مفعّل" -ForegroundColor Red
    Write-Host "  💡 الحل: قم بتشغيله:" -ForegroundColor Yellow
    Write-Host "     cd backend" -ForegroundColor Gray
    Write-Host "     pnpm dev" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# 3. فحص BullMQ Dashboard
# ============================================================================
Write-Host "[3/5] فحص BullMQ Dashboard..." -ForegroundColor Yellow

if ($backendRunning -and $redisRunning) {
    try {
        $bullResponse = Invoke-WebRequest -Uri "http://localhost:3001/admin/queues" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($bullResponse.StatusCode -eq 200) {
            Write-Host "  ✅ BullMQ Dashboard متاح" -ForegroundColor Green
            Write-Host "  🌐 الرابط: http://localhost:3001/admin/queues" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  ⚠️  BullMQ Dashboard غير متاح" -ForegroundColor Yellow
        Write-Host "  💡 تأكد من تشغيل Backend و Redis" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⏭️  تخطي (يحتاج Backend و Redis)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# 4. فحص Monitoring (Prometheus/Grafana)
# ============================================================================
Write-Host "[4/5] فحص Monitoring..." -ForegroundColor Yellow

$prometheusRunning = $false
$grafanaRunning = $false

# Check Prometheus
try {
    $promResponse = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($promResponse.StatusCode -eq 200) {
        Write-Host "  ✅ Prometheus يعمل" -ForegroundColor Green
        $prometheusRunning = $true
    }
} catch {
    Write-Host "  ⚠️  Prometheus غير مفعّل" -ForegroundColor Yellow
}

# Check Grafana
try {
    $grafanaResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($grafanaResponse.StatusCode -eq 200) {
        Write-Host "  ✅ Grafana يعمل" -ForegroundColor Green
        $grafanaRunning = $true
    }
} catch {
    Write-Host "  ⚠️  Grafana غير مفعّل" -ForegroundColor Yellow
}

if (-not $prometheusRunning -or -not $grafanaRunning) {
    Write-Host "  💡 الحل: قم بتشغيل Monitoring:" -ForegroundColor Yellow
    Write-Host "     cd monitoring" -ForegroundColor Gray
    Write-Host "     docker-compose up -d" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# 5. فحص Frontend
# ============================================================================
Write-Host "[5/5] فحص Frontend..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend يعمل" -ForegroundColor Green
        Write-Host "  🌐 الرابط: http://localhost:5000" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ⚠️  Frontend غير مفعّل" -ForegroundColor Red
    Write-Host "  💡 الحل: قم بتشغيله:" -ForegroundColor Yellow
    Write-Host "     cd frontend" -ForegroundColor Gray
    Write-Host "     pnpm dev" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# ملخص النتائج
# ============================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ملخص الحالة - Status Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Redis"; Status=$redisRunning; Priority="🔴 حرج"},
    @{Name="Backend"; Status=$backendRunning; Priority="🔴 حرج"},
    @{Name="BullMQ"; Status=($backendRunning -and $redisRunning); Priority="🔴 حرج"},
    @{Name="Prometheus"; Status=$prometheusRunning; Priority="🟡 مهم"},
    @{Name="Grafana"; Status=$grafanaRunning; Priority="🟡 مهم"}
)

foreach ($service in $services) {
    $status = if ($service.Status) { "✅ يعمل" } else { "❌ معطّل" }
    $color = if ($service.Status) { "Green" } else { "Red" }
    Write-Host "  $($service.Name): " -NoNewline
    Write-Host $status -ForegroundColor $color -NoNewline
    Write-Host " ($($service.Priority))" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# الخطوات التالية
# ============================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  الخطوات التالية - Next Steps" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-not $redisRunning) {
    Write-Host "1. 🔴 تشغيل Redis (حرج):" -ForegroundColor Red
    Write-Host "   cd redis" -ForegroundColor Gray
    Write-Host "   .\redis-server.exe redis.windows.conf" -ForegroundColor Gray
    Write-Host ""
}

if (-not $backendRunning) {
    Write-Host "2. 🔴 تشغيل Backend (حرج):" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   pnpm dev" -ForegroundColor Gray
    Write-Host ""
}

if (-not $prometheusRunning -or -not $grafanaRunning) {
    Write-Host "3. 🟡 تشغيل Monitoring (مهم):" -ForegroundColor Yellow
    Write-Host "   cd monitoring" -ForegroundColor Gray
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📖 للمزيد من التفاصيل، راجع:" -ForegroundColor Cyan
Write-Host "   SERVICES_ANALYSIS_REPORT.md" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ انتهى الفحص!" -ForegroundColor Green
Write-Host ""
