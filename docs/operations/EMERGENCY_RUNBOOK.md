# Emergency Runbook 🚨

## نظرة عامة (Overview)

هذا الدليل يوفر إجراءات الاستجابة السريعة لحالات الطوارئ الحرجة. استخدم هذا الدليل عند حدوث مشاكل حرجة تؤثر على توفر النظام.

This runbook provides rapid response procedures for critical emergencies affecting system availability.

---

## 📞 جهات الاتصال للطوارئ (Emergency Contacts)

### الفريق الأساسي (Primary Team)

| الدور (Role) | الاسم (Name) | الهاتف (Phone) | البريد الإلكتروني (Email) | التوفر (Availability) |
|--------------|--------------|----------------|---------------------------|----------------------|
| **SRE Team Lead** | [TBD] | [TBD] | [TBD] | 24/7 On-Call |
| **Backend Lead** | [TBD] | [TBD] | [TBD] | 24/7 On-Call |
| **DevOps Engineer** | [TBD] | [TBD] | [TBD] | Business Hours |
| **Database Admin** | [TBD] | [TBD] | [TBD] | Business Hours + On-Call |
| **Engineering Manager** | [TBD] | [TBD] | [TBD] | Business Hours |

### الفريق الاحتياطي (Backup Team)

| الدور (Role) | الاسم (Name) | الهاتف (Phone) | البريد الإلكتروني (Email) |
|--------------|--------------|----------------|---------------------------|
| **Backup SRE** | [TBD] | [TBD] | [TBD] |
| **Backup Backend** | [TBD] | [TBD] | [TBD] |
| **CTO** | [TBD] | [TBD] | [TBD] |

### جهات الاتصال الخارجية (External Contacts)

| الخدمة (Service) | جهة الاتصال (Contact) | رقم الدعم (Support) | بوابة الحالة (Status Page) |
|------------------|----------------------|---------------------|---------------------------|
| **Neon Database** | support@neon.tech | [Portal] | https://neon.tech/status |
| **MongoDB Atlas** | support@mongodb.com | [Portal] | https://status.cloud.mongodb.com |
| **Redis Cloud** | support@redis.com | [Portal] | https://status.redislabs.com |
| **Vercel** | support@vercel.com | [Portal] | https://www.vercel-status.com |

### قنوات الاتصال (Communication Channels)

- **Slack Emergency**: `#emergency-incidents`
- **Slack Status**: `#system-status`
- **PagerDuty**: [TBD - Setup Required]
- **Email Distribution List**: `emergency@company.com`

---

## 🔥 إجراءات الطوارئ السريعة (Quick Emergency Procedures)

### مستويات الحالات (Incident Severity Levels)

| المستوى (Level) | الوصف (Description) | وقت الاستجابة (Response Time) | التصعيد (Escalation) |
|-----------------|---------------------|------------------------------|----------------------|
| **P0 - Critical** | النظام معطل بالكامل (Complete system outage) | فوري (Immediate) | SRE Lead + Manager |
| **P1 - High** | خدمة رئيسية معطلة (Major service degradation) | <15 دقيقة (<15 min) | SRE Lead |
| **P2 - Medium** | تأثير جزئي (Partial impact) | <1 ساعة (<1 hour) | On-Call Engineer |
| **P3 - Low** | تأثير بسيط (Minor impact) | <4 ساعات (<4 hours) | Regular Support |

---

## 1️⃣ Database Failure Scenario

### 🔴 الأعراض (Symptoms)

- ❌ خطأ في الاتصال بقاعدة البيانات (Database connection errors)
- ❌ استعلامات بطيئة جداً أو متوقفة (Queries timeout or extremely slow)
- ❌ أخطاء "connection pool exhausted"
- ❌ API يعيد 500 Internal Server Error
- ❌ الرسائل في logs: `database unavailable`, `connection refused`

### ⚡ الإجراءات الفورية (Immediate Actions)

#### الخطوة 1: التحقق السريع (Quick Verification)

```bash
# 1. Check database connectivity
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1

# 2. Check Neon status page
curl -s https://neon.tech/status | grep -i "operational"

# 3. Check connection pool
curl http://localhost:3001/health/db
```

#### الخطوة 2: التشخيص (Diagnosis)

```bash
# Check database connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
psql "$DATABASE_URL" -c "
SELECT pid, usename, state, query_start,
       now() - query_start as duration,
       left(query, 50) as query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC
LIMIT 10;"

# Check database size and limits
psql "$DATABASE_URL" -c "
SELECT pg_database.datname,
       pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;"
```

#### الخطوة 3: الحلول حسب السبب (Solutions by Root Cause)

##### السبب A: نفاد الاتصالات (Connection Pool Exhausted)

```bash
# Kill idle connections
psql "$DATABASE_URL" -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes';"

# Restart application (clears connection pool)
pm2 restart backend
# OR
docker-compose restart backend
```

**تحديث الإعدادات (Update Configuration):**
```typescript
// backend/src/db/index.ts
export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  connection: {
    max: 20,              // زيادة العدد الأقصى (increase max)
    idleTimeoutMillis: 30000,  // 30 ثانية (30 seconds)
    connectionTimeoutMillis: 10000, // 10 ثوانٍ (10 seconds)
  }
});
```

##### السبب B: قاعدة البيانات معطلة (Database Down)

```bash
# 1. Check Neon dashboard
open https://console.neon.tech

# 2. Try manual restart (Neon Console)
# Navigate to Project → Compute → Restart

# 3. If Neon is down, enable read-replica (if available)
export DATABASE_URL="$READ_REPLICA_URL"
pm2 restart backend

# 4. Contact Neon support
# Email: support@neon.tech
# Include: Project ID, Timestamp, Error logs
```

##### السبب C: استعلامات بطيئة (Slow Queries)

```bash
# Find slow queries
psql "$DATABASE_URL" -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Kill long-running query
psql "$DATABASE_URL" -c "
SELECT pg_terminate_backend([PID]);"

# Add missing index (example)
psql "$DATABASE_URL" -c "
CREATE INDEX CONCURRENTLY idx_scenes_project_id
ON scenes(project_id);"
```

##### السبب D: نفاد المساحة (Disk Space Full)

```bash
# Check database size
psql "$DATABASE_URL" -c "
SELECT pg_size_pretty(pg_database_size(current_database()));"

# Clean old data (example)
psql "$DATABASE_URL" -c "
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';"

# Vacuum to reclaim space
psql "$DATABASE_URL" -c "VACUUM FULL;"
```

#### الخطوة 4: الاستعادة من Backup (Restore from Backup)

**⚠️ استخدم فقط في حالة فقدان البيانات (Use only for data loss)**

```bash
# 1. List available backups (Neon)
neon-cli backup list --project-id [PROJECT_ID]

# 2. Restore to test environment first
neon-cli backup restore \
  --backup-id [BACKUP_ID] \
  --target-branch test-restore \
  --project-id [PROJECT_ID]

# 3. Verify data integrity
psql "$TEST_DATABASE_URL" -c "
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM scenes;"

# 4. If verified, restore to production (⚠️ CRITICAL)
# Contact SRE Lead before proceeding
neon-cli backup restore \
  --backup-id [BACKUP_ID] \
  --target-branch main \
  --project-id [PROJECT_ID]
```

#### الخطوة 5: التحقق من الاستعادة (Post-Recovery Verification)

```bash
# 1. Test database connectivity
curl http://localhost:3001/health/db

# 2. Test critical queries
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 hour';"

# 3. Test API endpoints
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/users/me

# 4. Monitor error logs
tail -f /var/log/backend.log | grep -i "database\|error"

# 5. Monitor performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"
```

### 📊 RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 15 دقيقة (15 minutes)
- **RPO (Recovery Point Objective)**: 5 دقائق (5 minutes)
- **Backup Frequency**: كل ساعة (Hourly)
- **Retention**: 30 يوم (30 days)

---

## 2️⃣ Redis Failure Scenario

### 🔴 الأعراض (Symptoms)

- ❌ خطأ في الاتصال بـ Redis (Redis connection errors)
- ❌ Queue لا يعمل (Queue not processing)
- ❌ Cache misses بنسبة 100% (100% cache miss rate)
- ❌ أخطاء: `ECONNREFUSED`, `Redis is unavailable`
- ❌ بطء في الأداء (Performance degradation)

### ⚡ الإجراءات الفورية (Immediate Actions)

#### الخطوة 1: التحقق السريع (Quick Verification)

```bash
# 1. Check Redis connectivity
redis-cli -u "$REDIS_URL" ping 2>&1

# 2. Check Redis Cloud status
curl -s https://status.redislabs.com | grep -i "operational"

# 3. Check Redis from application
curl http://localhost:3001/health/redis
```

#### الخطوة 2: التشخيص (Diagnosis)

```bash
# Check Redis info
redis-cli -u "$REDIS_URL" INFO

# Check memory usage
redis-cli -u "$REDIS_URL" INFO memory

# Check connected clients
redis-cli -u "$REDIS_URL" INFO clients

# Check keyspace
redis-cli -u "$REDIS_URL" INFO keyspace

# Check slow log
redis-cli -u "$REDIS_URL" SLOWLOG GET 10
```

#### الخطوة 3: الحلول حسب السبب (Solutions by Root Cause)

##### السبب A: Redis معطل (Redis Down)

```bash
# 1. Check Redis Cloud dashboard
open https://app.redislabs.com

# 2. Restart Redis instance (Redis Cloud Console)
# Navigate to Database → Configuration → Restart

# 3. If using local Redis (Development)
sudo systemctl restart redis
# OR
docker-compose restart redis

# 4. Switch to backup instance (if available)
export REDIS_URL="$REDIS_BACKUP_URL"
pm2 restart backend
```

##### السبب B: نفاد الذاكرة (Memory Exhausted)

```bash
# Check memory usage
redis-cli -u "$REDIS_URL" INFO memory | grep used_memory_human

# Clear old keys
redis-cli -u "$REDIS_URL" --scan --pattern "cache:*" |
  xargs -L 100 redis-cli -u "$REDIS_URL" DEL

# Set eviction policy (if not set)
redis-cli -u "$REDIS_URL" CONFIG SET maxmemory-policy allkeys-lru

# Increase memory limit (Redis Cloud Console)
# Navigate to Database → Configuration → Memory Limit
```

##### السبب C: عدد كبير من الاتصالات (Too Many Connections)

```bash
# Check connected clients
redis-cli -u "$REDIS_URL" CLIENT LIST | wc -l

# Kill idle connections
redis-cli -u "$REDIS_URL" CLIENT KILL TYPE normal SKIPME yes

# Restart application to reset connections
pm2 restart backend
```

##### السبب D: بطء في الأداء (Performance Issues)

```bash
# Check slow commands
redis-cli -u "$REDIS_URL" SLOWLOG GET 10

# Check key sizes
redis-cli -u "$REDIS_URL" --bigkeys

# Enable AOF persistence (if needed)
redis-cli -u "$REDIS_URL" CONFIG SET appendonly yes

# Optimize key patterns
# Remove large keys or split them
```

#### الخطوة 4: تشغيل بدون Redis (Graceful Degradation)

**⚠️ استخدم مؤقتاً إذا تعذرت الاستعادة (Use temporarily if recovery fails)**

```typescript
// backend/src/config/redis.config.ts
export const redisFallbackConfig = {
  enableGracefulDegradation: true,
  fallbackToMemory: true,
  disableQueue: false, // Keep queue but use in-memory
};

// backend/src/services/cache.service.ts
class CacheService {
  async get(key: string) {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.warn('Redis unavailable, using in-memory cache');
      return this.memoryCache.get(key);
    }
  }
}
```

#### الخطوة 5: التحقق من الاستعادة (Post-Recovery Verification)

```bash
# 1. Test Redis connectivity
redis-cli -u "$REDIS_URL" ping

# 2. Test cache operations
curl -X POST http://localhost:3001/api/test/cache

# 3. Test queue operations
curl http://localhost:3001/api/queue/stats

# 4. Monitor queue processing
curl http://localhost:3001/admin/queues

# 5. Check error rate
tail -f /var/log/backend.log | grep -i "redis\|queue\|cache"
```

### 📊 RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 30 دقيقة (30 minutes)
- **RPO (Recovery Point Objective)**: 1 ساعة (1 hour) - للـ Queue فقط
- **Backup Frequency**: يومي (Daily) - للـ Configuration
- **Impact**: متوسط - النظام يعمل بأداء منخفض (Medium - degraded performance)

---

## 3️⃣ API Failure Scenario

### 🔴 الأعراض (Symptoms)

- ❌ API لا يستجيب (API not responding)
- ❌ خطأ 502/503/504 Gateway Timeout
- ❌ زمن استجابة طويل جداً (Very high response time >10s)
- ❌ معدل أخطاء مرتفع (High error rate >5%)
- ❌ Frontend لا يمكنه الاتصال بـ Backend

### ⚡ الإجراءات الفورية (Immediate Actions)

#### الخطوة 1: التحقق السريع (Quick Verification)

```bash
# 1. Check API health
curl -i http://localhost:3001/health

# 2. Check API from external
curl -i https://your-domain.com/api/health

# 3. Check process status
pm2 list
# OR
docker-compose ps

# 4. Check server logs
tail -n 100 /var/log/backend.log
# OR
pm2 logs backend --lines 100
```

#### الخطوة 2: التشخيص (Diagnosis)

```bash
# Check CPU and Memory usage
top -b -n 1 | head -20
htop

# Check process memory
ps aux | grep node | sort -k 4 -r

# Check network connections
netstat -tunlp | grep :3001

# Check disk space
df -h

# Check error logs
grep -i "error\|exception\|fatal" /var/log/backend.log | tail -50

# Check response times
curl -w "\nTotal time: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/projects
```

#### الخطوة 3: الحلول حسب السبب (Solutions by Root Cause)

##### السبب A: Process معطل أو Crashed (Process Crashed)

```bash
# 1. Check process status
pm2 list

# 2. Restart the application
pm2 restart backend
# OR
docker-compose restart backend

# 3. Check startup logs
pm2 logs backend --lines 50

# 4. If still failing, check port conflicts
lsof -i :3001

# 5. Kill conflicting process if needed
kill -9 [PID]

# 6. Start application
pm2 start backend
```

##### السبب B: نفاد الذاكرة (Out of Memory)

```bash
# 1. Check memory usage
free -h
ps aux | grep node

# 2. Restart with more memory
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart backend

# 3. Clear memory leaks
pm2 restart backend --update-env

# 4. Check for memory leaks in code
node --inspect backend/dist/server.js
# Use Chrome DevTools → Memory Profiler
```

##### السبب C: استعلامات بطيئة (Slow Queries/Operations)

```bash
# 1. Check slow endpoints
grep "took.*ms" /var/log/backend.log | sort -k3 -rn | head -20

# 2. Enable query logging
export DEBUG="drizzle:*"
pm2 restart backend

# 3. Check database performance
psql "$DATABASE_URL" -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;"

# 4. Scale API instances (if using containers)
docker-compose up -d --scale backend=3
```

##### السبب D: معدل طلبات مرتفع (High Traffic/Rate Limiting)

```bash
# 1. Check request rate
tail -f /var/log/nginx/access.log | pv -l -i 1 -r > /dev/null

# 2. Enable rate limiting
# Update nginx configuration
sudo nano /etc/nginx/sites-available/default

# Add rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

sudo nginx -t
sudo systemctl reload nginx

# 3. Scale horizontally (if needed)
pm2 scale backend 4
# OR
docker-compose up -d --scale backend=4

# 4. Enable CDN caching (Vercel/Cloudflare)
# Update headers for cacheable endpoints
```

##### السبب E: مشكلة في Network/Firewall

```bash
# 1. Check firewall rules
sudo ufw status
sudo iptables -L

# 2. Check if port is open
telnet localhost 3001

# 3. Check nginx/reverse proxy
sudo systemctl status nginx
sudo nginx -t

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Check DNS resolution (for external access)
nslookup your-domain.com
dig your-domain.com
```

##### السبب F: Deployment Issues

```bash
# 1. Check git status
git status
git log -1

# 2. Rollback to previous version
git log --oneline -10
git checkout [PREVIOUS_COMMIT_HASH]
npm install
npm run build
pm2 restart backend

# 3. Or use PM2 ecosystem
pm2 save --force
pm2 resurrect

# 4. Verify deployment
curl http://localhost:3001/api/version
```

#### الخطوة 4: خطة Failover (Failover Plan)

**⚠️ إذا فشلت جميع المحاولات (If all attempts fail)**

```bash
# 1. Enable maintenance mode
# Create static maintenance page
cat > /var/www/maintenance.html << EOF
<!DOCTYPE html>
<html>
<head><title>Maintenance</title></head>
<body>
  <h1>نحن نعمل على إصلاح المشكلة</h1>
  <h2>We're working on fixing the issue</h2>
  <p>Expected recovery: 30 minutes</p>
</body>
</html>
EOF

# 2. Update nginx to serve maintenance page
sudo nano /etc/nginx/sites-available/default
# Add:
# return 503;
# error_page 503 /maintenance.html;

sudo nginx -t
sudo systemctl reload nginx

# 3. Notify stakeholders
# Send email/Slack notification
curl -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_TOKEN" \
  -d "channel=#incidents" \
  -d "text=🚨 API is down. Working on recovery. ETA: 30 min"

# 4. Restore from backup deployment
# Deploy known-good version
git checkout production-backup
./deploy.sh

# 5. Contact SRE Team Lead
```

#### الخطوة 5: التحقق من الاستعادة (Post-Recovery Verification)

```bash
# 1. Test health endpoint
curl -i http://localhost:3001/health
# Expected: 200 OK

# 2. Test critical endpoints
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/users/me
curl http://localhost:3001/api/analysis/status

# 3. Test from frontend
curl https://your-domain.com
# Check browser console for API errors

# 4. Monitor error rate
tail -f /var/log/backend.log | grep -i "error" &
# Should see <1 error per minute

# 5. Monitor response times
for i in {1..10}; do
  curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/projects
  sleep 1
done
# Should see <500ms

# 6. Check queue processing
curl http://localhost:3001/api/queue/stats
# Verify queues are processing

# 7. Disable maintenance mode (if enabled)
sudo nano /etc/nginx/sites-available/default
# Remove maintenance mode configuration
sudo systemctl reload nginx
```

### 📊 RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 15 دقيقة (15 minutes)
- **RPO (Recovery Point Objective)**: صفر - لا يوجد فقدان بيانات (Zero - no data loss)
- **Uptime Target**: 99.9% (43.2 minutes downtime/month)
- **Maximum Acceptable Downtime**: 1 ساعة/شهر (1 hour/month)

---

## 4️⃣ Complete System Failure (P0)

### 🔴 السيناريو الأسوأ (Worst Case Scenario)

جميع الخدمات معطلة: Database + Redis + API

All services down: Database + Redis + API

### ⚡ الإجراءات (Emergency Protocol)

#### الخطوة 1: التصعيد الفوري (Immediate Escalation)

```bash
# 1. Notify SRE Team Lead (Phone + Slack)
# 2. Notify Engineering Manager
# 3. Create incident in PagerDuty
# 4. Post in #emergency-incidents Slack channel
```

#### الخطوة 2: التقييم السريع (Rapid Assessment)

```bash
# Check all services
echo "=== Database ==="
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1

echo "=== Redis ==="
redis-cli -u "$REDIS_URL" ping 2>&1

echo "=== API ==="
curl -i http://localhost:3001/health 2>&1

echo "=== System Resources ==="
df -h
free -h
top -b -n 1 | head -20
```

#### الخطوة 3: الاستعادة بالترتيب (Sequential Recovery)

```bash
# Priority 1: Database (critical)
# Follow "Database Failure Scenario" above

# Priority 2: Redis (medium)
# Follow "Redis Failure Scenario" above

# Priority 3: API (depends on DB + Redis)
# Follow "API Failure Scenario" above

# Priority 4: Frontend (depends on API)
pm2 restart frontend
# OR
vercel --prod
```

#### الخطوة 4: التحقق الكامل (Full System Verification)

```bash
#!/bin/bash
# emergency-verify.sh

echo "🔍 Full System Health Check"

# 1. Database
echo -n "Database: "
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAIL"

# 2. Redis
echo -n "Redis: "
redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAIL"

# 3. API Health
echo -n "API Health: "
curl -s http://localhost:3001/health | grep -q "ok" && echo "✅ OK" || echo "❌ FAIL"

# 4. Queue
echo -n "Queue: "
curl -s http://localhost:3001/api/queue/stats | grep -q "waiting" && echo "✅ OK" || echo "❌ FAIL"

# 5. Frontend
echo -n "Frontend: "
curl -s https://your-domain.com | grep -q "<!DOCTYPE html>" && echo "✅ OK" || echo "❌ FAIL"

# 6. E2E Test
echo -n "E2E Test: "
curl -s -X POST http://localhost:3001/api/test/e2e | grep -q "success" && echo "✅ OK" || echo "❌ FAIL"

echo ""
echo "📊 System Status Summary"
echo "Check complete at $(date)"
```

---

## 5️⃣ Communication Protocol

### خلال الحادث (During Incident)

#### تحديثات منتظمة (Regular Updates)

```markdown
**Incident Update #[N]**
🕐 Time: [HH:MM UTC]
🔴 Status: [Investigating / Identified / Fixing / Monitoring / Resolved]
📊 Impact: [Services affected]
⏱️ Duration: [Minutes since start]
🎯 ETA: [Expected resolution time]
👤 Led by: [Name]

**What we know:**
- [Finding 1]
- [Finding 2]

**What we're doing:**
- [Action 1]
- [Action 2]

**Next update:** [Time]
```

#### قالب الإشعار الأولي (Initial Notification Template)

```markdown
🚨 **INCIDENT ALERT - P[0/1/2]**

**Service:** [Database / Redis / API / All]
**Status:** DOWN / DEGRADED
**Started:** [HH:MM UTC]
**Impact:** [User-facing description]
**Team:** [Names]

**Immediate Actions:**
1. [Action]
2. [Action]

Updates every 15 minutes in #emergency-incidents
```

#### قالب الحل (Resolution Template)

```markdown
✅ **INCIDENT RESOLVED - P[0/1/2]**

**Service:** [Service name]
**Duration:** [Total minutes]
**Resolved:** [HH:MM UTC]

**Root Cause:**
[Explanation]

**Resolution:**
[What we did]

**Prevention:**
[Action items to prevent recurrence]

**Post-Mortem:** [Link to document]
**Follow-up Tasks:** [JIRA/GitHub links]
```

---

## 6️⃣ Post-Incident Actions

### فوراً بعد الحل (Immediately After Resolution)

```bash
# 1. Document timeline
# Create incident report in docs/incidents/

# 2. Save all logs
mkdir -p /var/log/incidents/$(date +%Y%m%d_%H%M%S)
cp /var/log/backend.log /var/log/incidents/$(date +%Y%m%d_%H%M%S)/
cp /var/log/nginx/access.log /var/log/incidents/$(date +%Y%m%d_%H%M%S)/
cp /var/log/nginx/error.log /var/log/incidents/$(date +%Y%m%d_%H%M%S)/

# 3. Capture system state
df -h > /var/log/incidents/$(date +%Y%m%d_%H%M%S)/disk_usage.txt
free -h > /var/log/incidents/$(date +%Y%m%d_%H%M%S)/memory.txt
pm2 list > /var/log/incidents/$(date +%Y%m%d_%H%M%S)/pm2_status.txt

# 4. Database snapshot
psql "$DATABASE_URL" -c "
SELECT * FROM pg_stat_activity;" > /var/log/incidents/$(date +%Y%m%d_%H%M%S)/db_connections.txt
```

### خلال 24 ساعة (Within 24 Hours)

- [ ] كتابة Post-Mortem Report
- [ ] مراجعة مع الفريق (Team Review)
- [ ] تحديد الأسباب الجذرية (Root Cause Analysis)
- [ ] إنشاء مهام المتابعة (Create Follow-up Tasks)

### خلال أسبوع (Within 1 Week)

- [ ] تنفيذ التحسينات (Implement Improvements)
- [ ] تحديث الوثائق (Update Documentation)
- [ ] إجراء Drill Test (تدريب الفريق)
- [ ] مراجعة جهات الاتصال (Review Contact List)

---

## 7️⃣ Monitoring & Alerts

### الإنذارات المطلوبة (Required Alerts)

```typescript
// monitoring/alerts.config.ts

export const criticalAlerts = {
  database: {
    connectionFailure: {
      threshold: 3, // failures in 1 minute
      severity: 'P0',
      channels: ['pagerduty', 'slack-emergency', 'sms'],
    },
    slowQuery: {
      threshold: 5000, // ms
      severity: 'P1',
      channels: ['slack-alerts'],
    },
    connectionPoolExhausted: {
      threshold: 90, // % of pool used
      severity: 'P1',
      channels: ['slack-alerts', 'email'],
    },
  },
  redis: {
    connectionFailure: {
      threshold: 5, // failures in 2 minutes
      severity: 'P1',
      channels: ['slack-emergency', 'email'],
    },
    memoryUsage: {
      threshold: 90, // %
      severity: 'P2',
      channels: ['slack-alerts'],
    },
  },
  api: {
    downtime: {
      threshold: 2, // failed health checks
      severity: 'P0',
      channels: ['pagerduty', 'slack-emergency', 'sms'],
    },
    errorRate: {
      threshold: 5, // %
      severity: 'P1',
      channels: ['slack-alerts', 'email'],
    },
    responseTime: {
      threshold: 2000, // ms (P95)
      severity: 'P2',
      channels: ['slack-alerts'],
    },
  },
};
```

### Dashboard للمراقبة (Monitoring Dashboard)

**يجب إعداد (Must Setup):**

- [ ] Grafana Dashboard للمقاييس (for metrics)
- [ ] Sentry لتتبع الأخطاء (for error tracking)
- [ ] UptimeRobot أو Pingdom (uptime monitoring)
- [ ] PagerDuty للتنبيهات (for alerting)
- [ ] Logs aggregation (Datadog/ELK)

---

## 8️⃣ Disaster Recovery Checklist

### الاستعداد (Preparation)

- [ ] تأكد من تفعيل Automated Backups
  ```bash
  # Verify Neon backups
  neon-cli backup list --project-id [ID]
  ```

- [ ] اختبر Restore من Backup
  ```bash
  # Test restore monthly
  neon-cli backup restore --backup-id [ID] --target-branch test
  ```

- [ ] وثّق RTO/RPO لكل خدمة
  - Database: RTO=15min, RPO=5min
  - Redis: RTO=30min, RPO=1h
  - API: RTO=15min, RPO=0

- [ ] احتفظ بنسخة من جهات الاتصال (offline copy)
  ```bash
  # Print and keep physical copy
  cat EMERGENCY_RUNBOOK.md | grep -A 20 "Emergency Contacts" > contacts.txt
  ```

### التدريبات (Drills)

- [ ] تدريب شهري (Monthly Drill)
  - محاكاة Database failure
  - قياس وقت الاستعادة (measure RTO)
  - تحديث الوثائق (update docs)

- [ ] مراجعة ربع سنوية (Quarterly Review)
  - مراجعة جميع السيناريوهات
  - تحديث جهات الاتصال
  - اختبار الـ Failover

---

## 9️⃣ Prevention Measures

### التدابير الوقائية (Preventive Measures)

#### Database
- [ ] تفعيل Connection Pooling
- [ ] إعداد Read Replicas
- [ ] تفعيل Query Monitoring
- [ ] جدولة Vacuum و Analyze

#### Redis
- [ ] إعداد Redis Cluster/Sentinel
- [ ] تفعيل Persistence (AOF)
- [ ] مراقبة Memory Usage
- [ ] إعداد Eviction Policy

#### API
- [ ] إعداد Load Balancer
- [ ] تفعيل Auto-scaling
- [ ] إعداد Rate Limiting
- [ ] تفعيل Circuit Breaker Pattern

#### Monitoring
- [ ] إعداد Health Checks
- [ ] تفعيل Alerting
- [ ] إعداد Log Aggregation
- [ ] مراقبة Business Metrics

---

## 📚 الموارد الإضافية (Additional Resources)

### الوثائق الداخلية (Internal Documentation)

- [RUNBOOKS.md](./RUNBOOKS.md) - Operational runbooks
- [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) - Deployment rollback procedures
- [TODO.md](../../TODO.md) - Production readiness checklist

### الموارد الخارجية (External Resources)

- [Neon Documentation](https://neon.tech/docs)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [Incident Response Best Practices](https://response.pagerduty.com/)

---

## 📝 Document Information

- **الإصدار (Version)**: 1.0.0
- **آخر تحديث (Last Updated)**: 2025-12-24
- **المسؤول (Owner)**: SRE Team
- **المراجعة (Review Cycle)**: شهري (Monthly)
- **المراجعة القادمة (Next Review)**: 2026-01-24

---

## ✅ Quick Reference Card

**يُطبع ويُحفظ بجانب جهاز العمل (Print and keep near workstation)**

```
╔══════════════════════════════════════════════════════════════╗
║              EMERGENCY QUICK REFERENCE                        ║
╠══════════════════════════════════════════════════════════════╣
║ Database Down:                                                ║
║   psql "$DATABASE_URL" -c "SELECT 1;"                        ║
║   → Check Neon Console                                        ║
║   → Restart app to reset connections                          ║
║                                                               ║
║ Redis Down:                                                   ║
║   redis-cli -u "$REDIS_URL" ping                             ║
║   → Check Redis Cloud Console                                 ║
║   → System continues with degraded performance                ║
║                                                               ║
║ API Down:                                                     ║
║   curl http://localhost:3001/health                          ║
║   → pm2 restart backend                                       ║
║   → Check logs: pm2 logs backend                             ║
║                                                               ║
║ Emergency Contacts:                                           ║
║   SRE Lead: [PHONE]                                          ║
║   Backend Lead: [PHONE]                                       ║
║   Slack: #emergency-incidents                                 ║
║                                                               ║
║ Escalation:                                                   ║
║   P0: Call SRE Lead immediately                              ║
║   P1: Slack #emergency-incidents                             ║
║   P2: Create ticket, notify in #alerts                       ║
╚══════════════════════════════════════════════════════════════╝
```

---

**🚨 تذكّر (Remember):**
- الهدوء والتركيز (Stay calm and focused)
- التواصل المبكر والمتكرر (Communicate early and often)
- التوثيق أثناء العمل (Document as you go)
- طلب المساعدة عند الحاجة (Ask for help when needed)
- المتابعة بعد الحل (Follow up after resolution)
