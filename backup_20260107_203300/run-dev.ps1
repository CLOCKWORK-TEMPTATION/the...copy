# ===================================================================
# تشغيل التطبيق في وضع التطوير - The Copy
# ===================================================================

Write-Host "🚀 تشغيل التطبيق في وضع التطوير..." -ForegroundColor Green

# التحقق من الملفات المطلوبة
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ ملف backend\.env غير موجود" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "❌ ملف frontend\.env غير موجود" -ForegroundColor Red
    exit 1
}

# إنهاء العمليات السابقة
Write-Host "🛑 إنهاء العمليات السابقة..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

# تشغيل Backend
Write-Host "🔧 تشغيل Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Green; pnpm dev"

# انتظار قليل لبدء Backend
Start-Sleep -Seconds 3

# تشغيل Frontend
Write-Host "🎨 تشغيل Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; pnpm dev"

Write-Host ""
Write-Host "✅ تم تشغيل التطبيق!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 الروابط:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "- API Health: http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏹️ لإيقاف التطبيق: اضغط Ctrl+C في كل نافذة" -ForegroundColor Red