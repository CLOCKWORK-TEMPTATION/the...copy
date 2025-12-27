# Setup Script for the Application
# This script initializes the development environment and installs all dependencies

Write-Host "🚀 Starting Application Setup..." -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
Write-Host "Checking for pnpm..." -ForegroundColor Cyan
$pnpmVersion = pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ pnpm is not installed. Installing pnpm globally..." -ForegroundColor Red
    npm install -g pnpm
} else {
    Write-Host "✓ pnpm is installed (version: $pnpmVersion)" -ForegroundColor Green
}

Write-Host ""

# Install dependencies for the monorepo
Write-Host "📦 Installing dependencies for all workspaces..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists in frontend, if not create from template
if (Test-Path "frontend/.env.example") {
    if (-not (Test-Path "frontend/.env.local")) {
        Write-Host "Creating frontend/.env.local from template..." -ForegroundColor Cyan
        Copy-Item "frontend/.env.example" "frontend/.env.local"
        Write-Host "✓ Created frontend/.env.local" -ForegroundColor Green
    }
}

# Check if .env exists in backend, if not create from template
if (Test-Path "backend/.env.example") {
    if (-not (Test-Path "backend/.env")) {
        Write-Host "Creating backend/.env from template..." -ForegroundColor Cyan
        Copy-Item "backend/.env.example" "backend/.env"
        Write-Host "✓ Created backend/.env" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✨ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env files with your configuration"
Write-Host "  2. Run 'pnpm run dev' to start the development server"
Write-Host ""
