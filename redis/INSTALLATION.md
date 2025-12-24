# Redis Sentinel Setup - Installation Required

## ⚠️ Redis غير مثبت

يجب تثبيت Redis أولاً لاستخدام Sentinel.

## تثبيت Redis على Windows

### الطريقة 1: Memurai (موصى به)
```powershell
# تحميل من: https://www.memurai.com/get-memurai
# أو استخدام Chocolatey:
choco install memurai-developer
```

### الطريقة 2: Redis من Microsoft
```powershell
# تحميل من: https://github.com/microsoftarchive/redis/releases
# أو استخدام Chocolatey:
choco install redis-64
```

### الطريقة 3: WSL2 + Redis
```bash
# في WSL2:
sudo apt update
sudo apt install redis-server
```

## بعد التثبيت

### 1. تحقق من التثبيت
```powershell
redis-server --version
redis-cli --version
```

### 2. شغل Sentinel
```powershell
cd redis
.\start-sentinel.ps1
```

## البديل: استخدام Docker

```powershell
# تشغيل Redis Master
docker run -d --name redis-master -p 6379:6379 redis:7-alpine

# تشغيل Sentinel
docker run -d --name redis-sentinel-1 -p 26379:26379 redis:7-alpine redis-sentinel /etc/redis/sentinel.conf
docker run -d --name redis-sentinel-2 -p 26380:26380 redis:7-alpine redis-sentinel /etc/redis/sentinel.conf
docker run -d --name redis-sentinel-3 -p 26381:26381 redis:7-alpine redis-sentinel /etc/redis/sentinel.conf
```

## للإنتاج

استخدم Redis Cloud أو Upstash:
- [Redis Cloud](https://redis.com/try-free/)
- [Upstash](https://upstash.com/)

كلاهما يوفر Sentinel مدمج.
