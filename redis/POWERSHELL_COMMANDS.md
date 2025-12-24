# Redis Sentinel - PowerShell Commands

## تشغيل Sentinel

```powershell
cd redis
.\start-sentinel.ps1
```

## تحديث .env

افتح `backend\.env` وأضف:

```env
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINELS=127.0.0.1:26379,127.0.0.1:26380,127.0.0.1:26381
REDIS_MASTER_NAME=mymaster
```

## اختبار Failover

```powershell
cd scripts
.\test-sentinel-failover.ps1
```

## فحص الحالة

```powershell
# فحص Sentinel
redis-cli -p 26379 PING

# عرض Master
redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster

# عرض Replicas
redis-cli -p 26379 SENTINEL replicas mymaster

# عرض Sentinels
redis-cli -p 26379 SENTINEL sentinels mymaster
```

## إيقاف Sentinel

```powershell
# إيقاف جميع عمليات Redis Sentinel
Get-Process redis-server | Where-Object {$_.MainWindowTitle -like "*sentinel*"} | Stop-Process
```
