@echo off
echo Starting Redis Sentinel Cluster...

start "Sentinel-26379" redis-server sentinel-26379.conf --sentinel
timeout /t 2 /nobreak >nul

start "Sentinel-26380" redis-server sentinel-26380.conf --sentinel
timeout /t 2 /nobreak >nul

start "Sentinel-26381" redis-server sentinel-26381.conf --sentinel

echo Sentinel cluster started on ports 26379, 26380, 26381
