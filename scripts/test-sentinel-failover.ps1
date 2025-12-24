Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Redis Sentinel Failover Test" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n1. Checking Sentinel status..." -ForegroundColor Yellow
$sentinelPing = redis-cli -p 26379 PING 2>$null
if ($sentinelPing -ne "PONG") {
    Write-Host "[ERROR] Sentinel not running on port 26379" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Sentinel is running" -ForegroundColor Green

Write-Host "`n2. Getting current master..." -ForegroundColor Yellow
$masterInfo = redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
$masterHost = $masterInfo[0]
$masterPort = $masterInfo[1]
Write-Host "[OK] Current master: ${masterHost}:${masterPort}" -ForegroundColor Green

Write-Host "`n3. Setting test value on master..." -ForegroundColor Yellow
redis-cli -h $masterHost -p $masterPort SET test:failover "before_failover" | Out-Null
Write-Host "[OK] Test value set" -ForegroundColor Green

Write-Host "`n4. Simulating master failure (30 second sleep)..." -ForegroundColor Yellow
Start-Job -ScriptBlock { param($h,$p) redis-cli -h $h -p $p DEBUG sleep 30 } -ArgumentList $masterHost,$masterPort | Out-Null
Write-Host "Waiting for Sentinel to detect failure (6 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

Write-Host "`n5. Checking for new master..." -ForegroundColor Yellow
$newMasterInfo = redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
$newMasterHost = $newMasterInfo[0]
$newMasterPort = $newMasterInfo[1]

if ("${newMasterHost}:${newMasterPort}" -ne "${masterHost}:${masterPort}") {
    Write-Host "[OK] Failover successful!" -ForegroundColor Green
    Write-Host "    New master: ${newMasterHost}:${newMasterPort}" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failover did not occur" -ForegroundColor Red
    exit 1
}

Write-Host "`n6. Verifying data on new master..." -ForegroundColor Yellow
$testValue = redis-cli -h $newMasterHost -p $newMasterPort GET test:failover
if ($testValue -eq "before_failover") {
    Write-Host "[OK] Data persisted after failover" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Data lost during failover" -ForegroundColor Red
    exit 1
}

redis-cli -h $newMasterHost -p $newMasterPort DEL test:failover | Out-Null

Write-Host "`n===================================" -ForegroundColor Cyan
Write-Host "Failover test completed successfully!" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
