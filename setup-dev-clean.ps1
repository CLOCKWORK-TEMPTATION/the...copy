# Development Environment Setup - The Copy
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
    Write-Host "pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install Dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Setup Database
Write-Host "Setting up database..." -ForegroundColor Yellow
Set-Location backend
try {
    pnpm db:push
    Write-Host "Database ready" -ForegroundColor Green
} catch {
    Write-Host "Database setup failed - using SQLite fallback" -ForegroundColor Yellow
}
Set-Location ..

# Check Redis
Write-Host "Checking Redis..." -ForegroundColor Yellow
try {
    redis-cli ping | Out-Null
    Write-Host "Redis available" -ForegroundColor Green
    
    # Enable Redis in env file
    (Get-Content backend\.env) -replace 'REDIS_ENABLED=false', 'REDIS_ENABLED=true' | Set-Content backend\.env
    (Get-Content backend\.env) -replace 'QUEUE_ENABLED=false', 'QUEUE_ENABLED=true' | Set-Content backend\.env
    
} catch {
    Write-Host "Redis not available - app will work without Redis" -ForegroundColor Yellow
    Write-Host "To install Redis: docker run -d -p 6379:6379 redis:alpine" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Development environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Backend: cd backend; pnpm dev" -ForegroundColor Cyan
Write-Host "2. Frontend: cd frontend; pnpm dev" -ForegroundColor Cyan
Write-Host "3. Access: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tools:" -ForegroundColor Yellow
Write-Host "- Bull Board: http://localhost:3001/admin/queues" -ForegroundColor Cyan
Write-Host "- Drizzle Studio: cd backend; pnpm db:studio" -ForegroundColor Cyan
Write-Host ""
Write-Host "Warning: Add real Gemini API keys in .env files" -ForegroundColor Red