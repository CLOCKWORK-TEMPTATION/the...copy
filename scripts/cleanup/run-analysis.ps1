# Unused Code Analysis Script for Windows
# Code Cleanup Analysis Report

param(
    [switch]$Fix = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

function Write-SectionHeader {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-SubHeader {
    param([string]$Text)
    Write-Host ""
    Write-Host $Text -ForegroundColor Yellow
}

# Get to root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Split-Path -Parent (Split-Path -Parent $scriptPath))

Write-SectionHeader "Starting Unused Code Analysis..."

$report = @{
    timestamp = Get-Date -Format "o"
    unused_files = @()
    unused_exports = @()
    unused_dependencies = @()
    circular_dependencies = @()
    issues = @()
}

# ==================== Frontend Knip Analysis ====================
Write-SubHeader "Analyzing Frontend with Knip..."

Push-Location frontend
$knipOutput = pnpm knip 2>&1
$knipExitCode = $LASTEXITCODE

$section = $null
foreach ($line in $knipOutput -split "`n") {
    if ($line -match "Unused files") { $section = "files"; continue }
    if ($line -match "Unused exports") { $section = "exports"; continue }
    if ($line -match "Unused dependencies") { $section = "dependencies"; continue }
    if ($line -match "Unused devDependencies") { $section = "devDependencies"; continue }

    if ($section -eq "files" -and $line -match "^src/") {
        $report.unused_files += "[frontend] $line"
    }
    if ($section -eq "exports" -and $line -match "^\S") {
        $report.unused_exports += "[frontend] $line"
    }
    if ($section -eq "dependencies" -and $line -match "^\S") {
        $report.unused_dependencies += "[frontend] $line"
    }
}

if ($knipExitCode -eq 0) {
    Write-Host "  [OK] No unused files in frontend" -ForegroundColor Green
} else {
    Write-Host "  [!] Found $($report.unused_files.Count) unused files in frontend" -ForegroundColor Yellow
}
Pop-Location

# ==================== Backend Knip Analysis ====================
Write-SubHeader "Analyzing Backend with Knip..."

if (Test-Path "backend") {
    Push-Location backend
    $knipOutputBackend = pnpm knip 2>&1
    $knipExitCodeBackend = $LASTEXITCODE

    $section = $null
    foreach ($line in $knipOutputBackend -split "`n") {
        if ($line -match "Unused files") { $section = "files"; continue }
        if ($line -match "Unused exports") { $section = "exports"; continue }

        if ($section -eq "files" -and $line -match "^src/") {
            $report.unused_files += "[backend] $line"
        }
    }

    if ($knipExitCodeBackend -eq 0) {
        Write-Host "  [OK] No unused files in backend" -ForegroundColor Green
    } else {
        Write-Host "  [!] Found unused files in backend" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "  [SKIP] Backend not found" -ForegroundColor Gray
}

# ==================== Depcheck Analysis ====================
Write-SubHeader "Analyzing Frontend dependencies with depcheck..."

Push-Location frontend
$depcheckOutput = pnpm depcheck 2>&1

if ($depcheckOutput -match "Unused dependencies") {
    $inSection = $false
    foreach ($line in $depcheckOutput -split "`n") {
        if ($line -match "Unused dependencies") { $inSection = $true; continue }
        if ($line -match "Unused devDependencies") { continue }
        if ($line -match "Missing dependencies") { $inSection = $false; continue }
        if ($inSection -and $line -match "^\*") {
            $dep = $line -replace "^\*\s*", ""
            if ($dep -notin $report.unused_dependencies) {
                $report.unused_dependencies += "[frontend-depcheck] $dep"
            }
        }
    }
}
Pop-Location

# ==================== Dependency Cruiser Analysis ====================
Write-SubHeader "Analyzing dependencies with dependency-cruiser..."

Push-Location frontend
$depcruiseOutput = npx depcruise --no-config src 2>&1

if ($depcruiseOutput -match "no dependency violations found") {
    Write-Host "  [OK] No dependency violations" -ForegroundColor Green
} else {
    Write-Host "  [!] Found dependency violations" -ForegroundColor Yellow
    $depcruiseOutput -split "`n" | Where-Object { $_ -match "error|warning" } | ForEach-Object {
        $report.issues += "[depcruise] $_"
    }
}
Pop-Location

# ==================== Final Report ====================
Write-SectionHeader "Analysis Report"

Write-Host ""
Write-Host "Unused Files: $($report.unused_files.Count)" -ForegroundColor $(if ($report.unused_files.Count -eq 0) { "Green" } else { "Yellow" })
if ($report.unused_files.Count -gt 0) {
    $report.unused_files | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor DarkYellow
    }
    if ($report.unused_files.Count -gt 10) {
        Write-Host "  ... and $($report.unused_files.Count - 10) more files" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Unused Exports: $($report.unused_exports.Count)" -ForegroundColor $(if ($report.unused_exports.Count -eq 0) { "Green" } else { "Yellow" })
if ($report.unused_exports.Count -gt 0) {
    $report.unused_exports | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor DarkYellow
    }
    if ($report.unused_exports.Count -gt 10) {
        Write-Host "  ... and $($report.unused_exports.Count - 10) more exports" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Unused Dependencies: $($report.unused_dependencies.Count)" -ForegroundColor $(if ($report.unused_dependencies.Count -eq 0) { "Green" } else { "Yellow" })
if ($report.unused_dependencies.Count -gt 0) {
    $report.unused_dependencies | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor DarkYellow
    }
    if ($report.unused_dependencies.Count -gt 10) {
        Write-Host "  ... and $($report.unused_dependencies.Count - 10) more dependencies" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Issues: $($report.issues.Count)" -ForegroundColor $(if ($report.issues.Count -eq 0) { "Green" } else { "Red" })

# Save report
$reportPath = Join-Path $PWD "cleanup-analysis-report.json"
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-SectionHeader "Analysis Complete!"
Write-Host "Report saved to: $reportPath" -ForegroundColor Cyan

if ($report.unused_files.Count -gt 0 -or $report.unused_dependencies.Count -gt 0) {
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  pnpm analyze:knip    - Run knip manually" -ForegroundColor White
    Write-Host "  pnpm analyze:deps    - Run dependency-cruiser" -ForegroundColor White
    Write-Host "  pnpm analyze:all     - Run full analysis" -ForegroundColor White
}
