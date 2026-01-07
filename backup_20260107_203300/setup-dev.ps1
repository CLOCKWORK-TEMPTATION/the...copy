# ===================================================================
# إعداد سريع للتطوير - The Copy
# ===================================================================

Write-Host "Setting up development environment..." -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not installed. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ pnpm غير مثبت. جاري التثبيت..." -ForegroundColor Yellow
    npm install -g pnpm
}

# تثبيت Dependencies
Write-Host "📦 تثبيت Dependencies..." -ForegroundColor Yellow
pnpm install

# إعداد قاعدة البيانات
Write-Host "🗄️ إعداد قاعدة البيانات..." -ForegroundColor Yellow
Set-Location backend
try {
    pnpm db:push
    Write-Host "✅ قاعدة البيانات جاهزة" -ForegroundColor Green
} catch {
    Write-Host "⚠️ فشل في إعداد قاعدة البيانات - سيتم استخدام SQLite" -ForegroundColor Yellow
}
Set-Location ..

# التحقق من Redis (اختياري)
Write-Host "🔄 التحقق من Redis..." -ForegroundColor Yellow
try {
    redis-cli ping | Out-Null
    Write-Host "✅ Redis متاح" -ForegroundColor Green
    
    # تفعيل Redis في ملف البيئة
    (Get-Content backend\.env) -replace 'REDIS_ENABLED=false', 'REDIS_ENABLED=true' | Set-Content backend\.env
    (Get-Content backend\.env) -replace 'QUEUE_ENABLED=false', 'QUEUE_ENABLED=true' | Set-Content backend\.env
    
} catch {
    Write-Host "⚠️ Redis غير متاح - سيعمل التطبيق بدون Redis" -ForegroundColor Yellow
    Write-Host "   لتثبيت Redis: docker run -d -p 6379:6379 redis:alpine" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 إعداد بيئة التطوير مكتمل!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. Backend: cd backend; pnpm dev" -ForegroundColor Cyan
Write-Host "2. Frontend: cd frontend; pnpm dev" -ForegroundColor Cyan
Write-Host "3. Access: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tools:" -ForegroundColor Yellow
Write-Host "- Bull Board: http://localhost:3001/admin/queues" -ForegroundColor Cyan
Write-Host "- Drizzle Studio: cd backend; pnpm db:studio" -ForegroundColor Cyan
Write-Host ""
Write-Host "Warning: Add real Gemini API keys in .env files" -ForegroundColor Red