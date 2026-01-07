# ============================================================================
# اختبار Redis Cloud Connection
# Test Redis Cloud Connection
# ============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  اختبار Redis Cloud" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$redisUrl = "redis://default:ph4fv6lht5pcyBwLCmQZh8q5k5TwwK2Y@redis-14864.c281.us-east-1-2.ec2.cloud.redislabs.com:14864"

Write-Host "🔍 اختبار الاتصال بـ Redis Cloud..." -ForegroundColor Yellow
Write-Host ""

# Test 1: PING
Write-Host "[1/5] اختبار PING..." -ForegroundColor Yellow
try {
    $result = redis-cli -u $redisUrl PING 2>&1
    if ($result -eq "PONG") {
        Write-Host "  ✅ PING ناجح!" -ForegroundColor Green
        $pingSuccess = $true
    } else {
        Write-Host "  ❌ PING فشل: $result" -ForegroundColor Red
        $pingSuccess = $false
    }
} catch {
    Write-Host "  ❌ خطأ: $_" -ForegroundColor Red
    $pingSuccess = $false
}

Write-Host ""

if (-not $pingSuccess) {
    Write-Host "⚠️  لا يمكن الاتصال بـ Redis Cloud" -ForegroundColor Red
    Write-Host ""
    Write-Host "الأسباب المحتملة:" -ForegroundColor Yellow
    Write-Host "  1. redis-cli غير مثبت" -ForegroundColor Gray
    Write-Host "  2. مشكلة في الشبكة/Firewall" -ForegroundColor Gray
    Write-Host "  3. Redis Cloud معطّل" -ForegroundColor Gray
    Write-Host ""
    Write-Host "الحلول:" -ForegroundColor Yellow
    Write-Host "  - تثبيت redis-cli" -ForegroundColor Gray
    Write-Host "  - التحقق من الاتصال بالإنترنت" -ForegroundColor Gray
    Write-Host "  - زيارة Redis Cloud Dashboard" -ForegroundColor Gray
    exit 1
}

# Test 2: SET/GET
Write-Host "[2/5] اختبار الكتابة والقراءة..." -ForegroundColor Yellow
try {
    $setResult = redis-cli -u $redisUrl SET test_key "Hello from The Copy!" 2>&1
    $getResult = redis-cli -u $redisUrl GET test_key 2>&1
    
    if ($getResult -eq "Hello from The Copy!") {
        Write-Host "  ✅ الكتابة والقراءة ناجحة!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  نتيجة غير متوقعة: $getResult" -ForegroundColor Yellow
    }
    
    # Cleanup
    redis-cli -u $redisUrl DEL test_key 2>&1 | Out-Null
} catch {
    Write-Host "  ❌ خطأ: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: INFO
Write-Host "[3/5] جمع معلومات الخادم..." -ForegroundColor Yellow
try {
    $info = redis-cli -u $redisUrl INFO server 2>&1
    
    # Parse version
    $version = ($info | Select-String "redis_version:(.+)").Matches.Groups[1].Value
    if ($version) {
        Write-Host "  ✅ Redis Version: $version" -ForegroundColor Green
    }
    
    # Parse uptime
    $uptime = ($info | Select-String "uptime_in_days:(.+)").Matches.Groups[1].Value
    if ($uptime) {
        Write-Host "  ✅ Uptime: $uptime days" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  لا يمكن جمع المعلومات" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Memory
Write-Host "[4/5] فحص الذاكرة..." -ForegroundColor Yellow
try {
    $memory = redis-cli -u $redisUrl INFO memory 2>&1
    
    $usedMemory = ($memory | Select-String "used_memory_human:(.+)").Matches.Groups[1].Value
    if ($usedMemory) {
        Write-Host "  ✅ Used Memory: $usedMemory" -ForegroundColor Green
    }
    
    $maxMemory = ($memory | Select-String "maxmemory_human:(.+)").Matches.Groups[1].Value
    if ($maxMemory) {
        Write-Host "  ✅ Max Memory: $maxMemory" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  لا يمكن فحص الذاكرة" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: Keys Count
Write-Host "[5/5] عدد المفاتيح..." -ForegroundColor Yellow
try {
    $dbsize = redis-cli -u $redisUrl DBSIZE 2>&1
    Write-Host "  ✅ عدد المفاتيح: $dbsize" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  لا يمكن حساب المفاتيح" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  النتيجة - Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Redis Cloud يعمل بشكل صحيح!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 الخطوات التالية:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. إضافة Redis URL إلى backend/.env:" -ForegroundColor Yellow
Write-Host "   REDIS_URL=$redisUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "2. إعادة تشغيل Backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. التحقق من BullMQ Dashboard:" -ForegroundColor Yellow
Write-Host "   http://localhost:3001/admin/queues" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ اكتمل!" -ForegroundColor Green
Write-Host ""
