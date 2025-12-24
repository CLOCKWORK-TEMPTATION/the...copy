
## ✅ Checklist - يجب إكمالها قبل أي إطلاق Production

### 🔴 الأولوية القصوى

- [ ] **1. تفعيل Database Automated Backups**
  - [ ] Neon: تفعيل PITR (Point-in-Time Recovery)
  - [ ] MongoDB Atlas: تفعيل Continuous Backup
  - [ ] Retention: 30 days minimum
  - [ ] المسؤول: DevOps Lead

- [ ] **2. اختبار Database Restore**
  - [ ] استعادة Backup الأخير إلى Test Environment
  - [ ] التحقق من سلامة البيانات
  - [ ] توثيق الخطوات في Runbook
  - [ ] المسؤول: DevOps + DBA
  -

- [ ] **3. تعقيم Logs من PII**
  - [ ] إضافة Log Sanitization Middleware
  - [ ] فحص Logs الحالية لوجود PII
  - [ ] حذف PII من Logs التاريخية
  - [ ] المسؤول: Backend Team
  - [ ]
  - [ ] الملف: `backend/src/middleware/index.ts`

- [ ] **4. تحديد RTO/RPO لكل Service**
  - [ ] User Auth: RTO <15min, RPO <5min
  - [ ] Projects: RTO <30min, RPO <15min
  - [ ] Cache: RTO <1h, RPO <24h
  - [ ] المسؤول: SRE/Tech Lead
  - [ ]

---

- [x] **5. إنشاء Emergency Runbook** ✅
  - [x] Database failure scenario
  - [x] Redis failure scenario
  - [x] API failure scenario
  - [x] جهات الاتصال للطوارئ
  - [x] المسؤول: SRE Team
  - [x] الملف: `docs/operations/EMERGENCY_RUNBOOK.md`

- [ ] **6. إضافة Gemini Cost Alerts**
  - [ ] تتبع Token Usage
  - [ ] Alert عند تجاوز $10/day
  - [ ] Alert عند 80% من Monthly Quota
  - [ ] المسؤول: Backend Team
  - [ ]
  - [ ] الملف: `backend/src/services/gemini.service.ts`

- [ ] **7. تطبيق Deep Health Checks**
  - [ ] `/health/live` endpoint
  - [ ] `/health/ready` endpoint
  - [ ] فحص Database connectivity
  - [ ] فحص Redis connectivity
  - [ ] فحص Disk space
  - [ ] المسؤول: Backend Team
  - [ ] الملف: `backend/src/server.ts`

- [ ] **8. CORS Strict Mode في Development**
  - [ ] إزالة `if (origin) return callback(null, true)`
  - [ ] استخدام Dev Whitelist محدد
  - [ ] المسؤول: Backend Team
  - [ ] الملف: `backend/src/middleware/index.ts`

---

## 📝 Verification Checklist

بعد إكمال جميع الإجراءات أعلاه، تأكد من:

### Database Backups

```bash
# Test restore command
neon-cli backup list
neon-cli backup restore --latest --target=test-db

# Verify data
psql test-db -c "SELECT COUNT(*) FROM users;"
psql test-db -c "SELECT COUNT(*) FROM projects;"
```

### Log Sanitization

```bash
# Check recent logs for PII
grep -i "email\|password\|token" /var/log/app.log
# Should return: No matches (or only [REDACTED])
```

### Health Checks

```bash
# Test liveness
curl http://localhost:3000/health/live
# Expected: {"status":"alive"}

# Test readiness
curl http://localhost:3000/health/ready
# Expected: {"status":"ready","checks":[...]}
```

### Cost Alerts

```bash
# Trigger test alert
curl -X POST http://localhost:3000/api/test/cost-alert
# Check email/Slack for alert notification
```

---

## 🎯 Success Criteria

قبل الموافقة على Production Release:

✅ **Database Resilience**

- Automated backups running
- Successful restore test completed
- RTO/RPO documented

✅ **Security & Compliance**

- No PII in logs (verified)
- CORS strict mode enabled
- Emergency runbook ready

✅ **Observability**

- Health checks operational
- Cost alerts configured
- Monitoring dashboard accessible

✅ **Team Readiness**

- On-call rotation defined
- Emergency contacts updated
- DR drill scheduled (within 1 week)

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| **CTO/Tech Lead** | [Name] | [Phone/Slack] |
| **DevOps Lead** | [Name] | [Phone/Slack] |
| **Backend Lead** | [Name] | [Phone/Slack] |
| **On-Call SRE** | [TBD - Hire Urgently] | [Phone/Slack] |

---

## 🔧 Quick Commands Reference

### Database Backup/Restore

```bash
# List backups
neon-cli backup list

# Create manual backup
neon-cli backup create --name="pre-release-$(date +%Y%m%d)"

# Restore from backup
neon-cli backup restore --id=<backup-id> --target=production
```

### Log Cleanup

```bash
# Rotate logs immediately
logrotate -f /etc/logrotate.conf

# Clear old logs with PII
find /var/log -name "*.log" -mtime +7 -delete
```

### Service Status Check

```bash
# Check all services
systemctl status app backend redis postgres

# Check resource usage
df -h  # Disk space
free -h  # Memory
top -b -n 1  # CPU
```

---
