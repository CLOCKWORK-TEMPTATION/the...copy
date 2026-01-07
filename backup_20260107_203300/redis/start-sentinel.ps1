Write-Host "Starting Redis Sentinel Cluster..." -ForegroundColor Green

Start-Process -FilePath "redis-server" -ArgumentList "sentinel-26379.conf --sentinel" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process -FilePath "redis-server" -ArgumentList "sentinel-26380.conf --sentinel" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process -FilePath "redis-server" -ArgumentList "sentinel-26381.conf --sentinel" -WindowStyle Normal

Write-Host "Sentinel cluster started on ports 26379, 26380, 26381" -ForegroundColor Green
