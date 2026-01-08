@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Redis Sentinel Failover Test
echo ===================================

echo.
echo 1. Checking Sentinel status...
redis-cli -p 26379 PING >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Sentinel not running on port 26379
    exit /b 1
)
echo [OK] Sentinel is running

echo.
echo 2. Getting current master...
for /f "tokens=*" %%a in ('redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster') do (
    if not defined MASTER_HOST (
        set MASTER_HOST=%%a
    ) else (
        set MASTER_PORT=%%a
    )
)
echo [OK] Current master: !MASTER_HOST!:!MASTER_PORT!

echo.
echo 3. Setting test value on master...
redis-cli -h !MASTER_HOST! -p !MASTER_PORT! SET test:failover "before_failover" >nul
echo [OK] Test value set

echo.
echo 4. Simulating master failure (30 second sleep)...
start /B redis-cli -h !MASTER_HOST! -p !MASTER_PORT! DEBUG sleep 30

echo Waiting for Sentinel to detect failure (6 seconds)...
timeout /t 6 /nobreak >nul

echo.
echo 5. Checking for new master...
for /f "tokens=*" %%a in ('redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster') do (
    if not defined NEW_MASTER_HOST (
        set NEW_MASTER_HOST=%%a
    ) else (
        set NEW_MASTER_PORT=%%a
    )
)

if "!NEW_MASTER_HOST!:!NEW_MASTER_PORT!" neq "!MASTER_HOST!:!MASTER_PORT!" (
    echo [OK] Failover successful!
    echo     New master: !NEW_MASTER_HOST!:!NEW_MASTER_PORT!
) else (
    echo [ERROR] Failover did not occur
    exit /b 1
)

echo.
echo 6. Verifying data on new master...
for /f "tokens=*" %%a in ('redis-cli -h !NEW_MASTER_HOST! -p !NEW_MASTER_PORT! GET test:failover') do set TEST_VALUE=%%a
if "!TEST_VALUE!" equ "before_failover" (
    echo [OK] Data persisted after failover
) else (
    echo [ERROR] Data lost during failover
    exit /b 1
)

redis-cli -h !NEW_MASTER_HOST! -p !NEW_MASTER_PORT! DEL test:failover >nul

echo.
echo 7. Waiting for old master to recover...
timeout /t 30 /nobreak >nul

echo.
echo 8. Checking old master status...
redis-cli -p 26379 SENTINEL replicas mymaster | findstr /C:"!MASTER_HOST!" >nul
if not errorlevel 1 (
    echo [OK] Old master rejoined as replica
) else (
    echo [WARNING] Old master not yet rejoined (may take time)
)

echo.
echo ===================================
echo Failover test completed successfully!
echo ===================================
