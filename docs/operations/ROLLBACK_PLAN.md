# Rollback Plan

## Overview

This document provides comprehensive rollback procedures for safely reverting system changes in case of issues during or after deployment. The plan includes rollback strategies for all system components with clear decision points and safety checkpoints.

---

## Table of Contents

1. [Quick Reference](#1-quick-reference)
2. [Rollback Decision Matrix](#2-rollback-decision-matrix)
3. [Pre-Rollback Checklist](#3-pre-rollback-checklist)
4. [Component Rollback Procedures](#4-component-rollback-procedures)
5. [Database Rollback](#5-database-rollback)
6. [Post-Rollback Verification](#6-post-rollback-verification)
7. [Communication Plan](#7-communication-plan)
8. [Lessons Learned](#8-lessons-learned)

---

## 1. Quick Reference

### Severity Levels

| Level | Description | Action | Timeline |
|-------|-------------|--------|----------|
| **P0** | Service down, data loss risk | Immediate rollback | <15 minutes |
| **P1** | Critical feature broken | Rollback within 30 min | <30 minutes |
| **P2** | Performance degraded >50% | Rollback within 1 hour | <1 hour |
| **P3** | Minor issues, workarounds available | Investigate, may not rollback | <4 hours |

### Emergency Rollback Command

```bash
# EMERGENCY: One-command rollback
./scripts/emergency-rollback.sh

# Or manual quick rollback
git checkout [PREVIOUS_STABLE_COMMIT]
npm install
npm run build
pm2 restart all
```

---

## 2. Rollback Decision Matrix

### When to Rollback

| Issue | Severity | Rollback? | Notes |
|-------|----------|-----------|-------|
| API completely down | P0 | ✅ Yes | Immediate |
| Database connection failed | P0 | ✅ Yes | Immediate |
| Data corruption detected | P0 | ✅ Yes | Stop all writes first |
| Error rate >10% | P1 | ✅ Yes | After quick fix attempt |
| Error rate 5-10% | P1 | ⚠️ Maybe | Investigate first |
| Response time >2x baseline | P2 | ⚠️ Maybe | Try optimization first |
| Single feature broken | P2 | ⚠️ Maybe | Feature flag if possible |
| Minor UI issue | P3 | ❌ No | Hot fix instead |
| Performance slightly degraded | P3 | ❌ No | Monitor and optimize |

### Decision Flowchart

```
Issue Detected
    ↓
Is service down or data at risk? → YES → Rollback immediately
    ↓ NO
Error rate >10%? → YES → Attempt quick fix (5 min) → Failed? → Rollback
    ↓ NO
Performance degraded >50%? → YES → Check if queue/cache issue → Not fixable? → Rollback
    ↓ NO
Single feature broken? → YES → Can disable feature? → NO → Rollback
    ↓ YES
Use feature flag, fix forward
```

---

## 3. Pre-Rollback Checklist

### Before Initiating Rollback

- [ ] Confirm the issue severity and impact
- [ ] Identify the stable version to rollback to
- [ ] Notify team and stakeholders
- [ ] Document the issue (symptoms, logs, metrics)
- [ ] Ensure backup is available
- [ ] Pause all queues to prevent new jobs
- [ ] Take snapshot of current state (for post-mortem)

### Information to Gather

```bash
# 1. Current deployment version
git rev-parse HEAD

# 2. Last stable version
git log --oneline -5

# 3. Current error rate
grep ERROR /var/log/app.log | wc -l

# 4. Queue status
curl http://localhost:3001/api/queue/stats

# 5. Database state
psql $DATABASE_URL -c "SELECT count(*) FROM projects;"

# 6. System resources
free -h && df -h
```

---

## 4. Component Rollback Procedures

### 4.1 Application Code Rollback

**Time Required**: 5-10 minutes

**Steps**:

```bash
# 1. Identify last stable commit
git log --oneline -10
# Or use tags: git tag -l

# 2. Pause queues (prevent new jobs)
curl -X POST http://localhost:3001/api/queue/pause-all

# 3. Checkout previous stable version
git checkout [STABLE_COMMIT_HASH]
# Or: git checkout v1.2.3

# 4. Install dependencies
npm install

# 5. Build application
npm run build

# 6. Restart services
pm2 restart all
# Or: docker-compose restart

# 7. Verify health
sleep 10
curl http://localhost:3001/health

# 8. Run smoke tests
npm run test:smoke

# 9. Resume queues if healthy
curl -X POST http://localhost:3001/api/queue/resume-all
```

**Verification**:
```bash
# Check running version
curl http://localhost:3001/api/version

# Check error logs
tail -n 100 /var/log/app.log | grep ERROR

# Monitor for 5 minutes
watch -n 5 'curl -s http://localhost:3001/health'
```

### 4.2 Queue System Rollback

**When**: Queue workers causing issues, infinite loops, high failure rates

```bash
# 1. Stop all workers
pm2 stop queue-worker
# Or programmatically:
```

```typescript
import { queueManager } from './queues/queue.config';

// Close all workers
await queueManager.close();
```

```bash
# 2. Drain active jobs (let them complete)
# Monitor Bull Board: http://localhost:3001/admin/queues

# 3. Pause all queues
curl -X POST http://localhost:3001/api/queue/pause-all

# 4. Clean failed jobs if needed
curl -X POST http://localhost:3001/api/queue/clean-all

# 5. Rollback queue code
git checkout [STABLE_COMMIT] -- backend/src/queues/

# 6. Rebuild
npm run build

# 7. Restart workers
pm2 restart queue-worker

# 8. Resume queues gradually
curl -X POST http://localhost:3001/api/queue/ai-analysis/resume
# Wait and monitor
curl -X POST http://localhost:3001/api/queue/document-processing/resume
```

### 4.3 Cache/Redis Rollback

**When**: Cache causing incorrect data, high memory usage

```bash
# 1. Clear all cache (nuclear option)
redis-cli FLUSHALL

# Or clear specific patterns
redis-cli KEYS "gemini:*" | xargs redis-cli DEL

# 2. Restart Redis if needed
sudo systemctl restart redis
# Or: docker-compose restart redis

# 3. Verify Redis health
redis-cli PING

# 4. Warm cache with correct data
curl -X POST http://localhost:3001/api/cache/warm
```

**Alternative: Gradual Cache Invalidation**
```bash
# Invalidate cache for specific entities
curl -X DELETE http://localhost:3001/api/cache/project/:id
curl -X DELETE http://localhost:3001/api/cache/analysis/:id
```

### 4.4 Frontend Rollback

**Time Required**: 3-5 minutes

```bash
# 1. Checkout previous stable version
cd frontend
git checkout [STABLE_COMMIT]

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Deploy (depends on hosting)
# Vercel:
vercel --prod

# Or static hosting:
cp -r .next/static/* /var/www/html/
pm2 restart frontend

# 5. Clear CDN cache if applicable
# (Cloudflare, etc.)
```

---

## 5. Database Rollback

### 5.1 Schema Rollback

**⚠️ WARNING**: Database rollbacks are high-risk operations

**Before Rollback**:
```bash
# 1. STOP all writes to database
curl -X POST http://localhost:3001/api/maintenance/enable

# 2. Pause all queues
curl -X POST http://localhost:3001/api/queue/pause-all

# 3. Backup current state
pg_dump $DATABASE_URL > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql
```

**Rollback Methods**:

#### Method 1: Drizzle Migration Rollback (Preferred)

```bash
# Check migration history
npm run db:studio

# Rollback last migration
# Note: Drizzle doesn't have built-in rollback
# Need to manually apply down migration

# Create down migration
cat > migrations/down_xxxx_rollback.sql << EOF
-- Reverse the changes from latest migration
DROP INDEX IF EXISTS idx_new_index;
ALTER TABLE projects DROP COLUMN IF EXISTS new_column;
-- etc.
EOF

# Apply manually
psql $DATABASE_URL < migrations/down_xxxx_rollback.sql
```

#### Method 2: Restore from Backup

```bash
# 1. Drop current database (DANGEROUS)
# Ensure you have backup!
dropdb your_database

# 2. Create new database
createdb your_database

# 3. Restore from backup
psql $DATABASE_URL < backup_pre_deploy_20251107.sql

# 4. Verify restoration
psql $DATABASE_URL -c "SELECT count(*) FROM projects;"
```

#### Method 3: Point-in-Time Recovery (if available)

```bash
# For managed databases (RDS, etc.)
# Use cloud provider's PITR feature
# Restore to timestamp before deployment
```

### 5.2 Data Rollback

**When**: Data corruption, incorrect updates

```bash
# 1. Identify affected records
psql $DATABASE_URL << EOF
SELECT * FROM projects
WHERE updated_at > '2025-11-07 10:00:00'
LIMIT 100;
EOF

# 2. Restore from backup for specific records
# Extract from backup:
pg_restore -t projects backup.sql | grep "specific_id"

# 3. Or restore specific records with SQL
psql $DATABASE_URL << EOF
-- Update specific records back to previous values
UPDATE projects
SET column = 'previous_value'
WHERE id IN ('id1', 'id2', 'id3');
EOF
```

### 5.3 Database Rollback Verification

```bash
# 1. Check schema
psql $DATABASE_URL -c "\d projects"

# 2. Check data integrity
psql $DATABASE_URL -c "SELECT count(*) FROM projects;"

# 3. Check relationships
psql $DATABASE_URL << EOF
SELECT
  p.id,
  COUNT(s.id) as scene_count
FROM projects p
LEFT JOIN scenes s ON p.id = s.project_id
GROUP BY p.id
LIMIT 10;
EOF

# 4. Run data validation queries
npm run db:validate
```

---

## 6. Post-Rollback Verification

### 6.1 Immediate Checks (0-5 minutes)

```bash
# 1. Health endpoint
curl http://localhost:3001/health
# Expected: 200 OK

# 2. API endpoints
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/analysis

# 3. Queue status
curl http://localhost:3001/api/queue/stats

# 4. Error logs
tail -n 50 /var/log/app.log | grep ERROR
# Expected: No new errors

# 5. Database connection
psql $DATABASE_URL -c "SELECT 1;"
# Expected: 1

# 6. Redis connection
redis-cli PING
# Expected: PONG
```

### 6.2 Extended Monitoring (5-30 minutes)

```bash
# Monitor error rate
watch -n 10 'grep ERROR /var/log/app.log | wc -l'

# Monitor response times
while true; do
  curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/projects
  sleep 5
done

# Monitor queue health
watch -n 30 'curl -s http://localhost:3001/api/queue/stats | jq'

# Monitor system resources
watch -n 10 'free -h && df -h'
```

### 6.3 Functional Testing

```bash
# Run smoke tests
npm run test:smoke

# Run critical E2E tests
npm run e2e -- --grep critical

# Manual testing checklist:
# - [ ] User can login
# - [ ] User can create project
# - [ ] User can analyze scene
# - [ ] User can view results
# - [ ] Queue processes jobs
```

### 6.4 Metrics Verification

After 30 minutes of rollback:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Error Rate | <1% | Check logs, Sentry |
| API Response Time (P95) | <300ms | Check metrics dashboard |
| Queue Length | <50 | Check Bull Board |
| Cache Hit Rate | >70% | Check Redis INFO |
| Database Query Time | <100ms | Check pg_stat_statements |

---

## 7. Communication Plan

### 7.1 Stakeholder Notification

**When Initiating Rollback**:
```
Subject: [ACTION] Initiating Rollback - [Issue Description]

We are initiating a rollback due to [issue description].

Issue Detected: [timestamp]
Severity: [P0/P1/P2]
Impact: [description]
Expected Rollback Duration: [X] minutes

We will provide updates every 15 minutes.

- [Your Name], On-Call Engineer
```

**During Rollback**:
```
Subject: [UPDATE] Rollback in Progress - [X]% Complete

Rollback Status: [X]% complete
Current Step: [description]
ETA: [X] minutes

Latest: [status update]

- [Your Name]
```

**After Rollback**:
```
Subject: [RESOLVED] Rollback Complete - Service Restored

Rollback completed successfully at [timestamp].

System Status: ✅ Healthy
Error Rate: [X]%
Response Time: [X]ms

Next Steps:
- Continue monitoring for [X] hours
- Root cause analysis scheduled for [date]
- Post-mortem meeting at [time]

Thank you for your patience.

- [Your Name]
```

### 7.2 Internal Communication

**Slack/Teams Message Template**:
```
🚨 ROLLBACK IN PROGRESS 🚨

Issue: [Description]
Severity: P[0/1/2]
Started: [timestamp]
ETA: [X] minutes

Status: [Current step]

Dashboard: [link]
Logs: [link]
```

---

## 8. Lessons Learned

### 8.1 Post-Rollback Review

Within 24 hours of rollback, conduct a review:

**Questions to Answer**:
1. What was the root cause?
2. How was it detected?
3. How long did rollback take?
4. Were there any complications?
5. Was documentation accurate?
6. What can be improved?

**Document Template**:
```markdown
# Rollback Post-Mortem: [Date]

## Incident Summary
- Date/Time:
- Duration:
- Severity:
- Impact:

## Root Cause
[Description]

## Timeline
- [HH:MM] Issue detected
- [HH:MM] Rollback initiated
- [HH:MM] Rollback completed
- [HH:MM] Service verified

## What Went Well
-

## What Went Wrong
-

## Action Items
- [ ]
- [ ]

## Preventive Measures
-
```

### 8.2 Continuous Improvement

After each rollback:

- [ ] Update rollback documentation
- [ ] Improve monitoring/alerts
- [ ] Add relevant tests
- [ ] Update deployment procedures
- [ ] Share learnings with team

---

## 9. Rollback Safety Checkpoints

### Checkpoint 1: Before Initiating Rollback

- [ ] Issue severity confirmed (P0/P1/P2)
- [ ] Stakeholders notified
- [ ] Backup verified available
- [ ] Last stable version identified
- [ ] Rollback plan reviewed
- [ ] Team ready to assist if needed

### Checkpoint 2: After Code Rollback

- [ ] Health endpoint responding
- [ ] No errors in logs
- [ ] Smoke tests passing
- [ ] Can connect to database
- [ ] Can connect to Redis

### Checkpoint 3: After Queue Resume

- [ ] Jobs processing successfully
- [ ] Failure rate normal (<2%)
- [ ] No stuck jobs
- [ ] Processing time normal

### Checkpoint 4: 30 Minutes After Rollback

- [ ] Error rate <1%
- [ ] Response times normal
- [ ] No new incidents
- [ ] User reports normal
- [ ] Metrics healthy

### Checkpoint 5: 24 Hours After Rollback

- [ ] System stable
- [ ] No degradation
- [ ] Post-mortem completed
- [ ] Action items created
- [ ] Documentation updated

---

## 10. Emergency Contacts (During Rollback)

| Role | Responsibility | Contact Method |
|------|---------------|---------------|
| On-Call Engineer | Execute rollback | Phone: [TBD] |
| Database Admin | Database rollback | Phone: [TBD] |
| DevOps Lead | Infrastructure issues | Phone: [TBD] |
| Engineering Manager | Escalation point | Phone: [TBD] |
| CTO | Executive decision | Phone: [TBD] |

---

## 11. Rollback Scripts

### 11.1 Emergency Rollback Script

Create: `/scripts/emergency-rollback.sh`

```bash
#!/bin/bash

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED 🚨"

# Configuration
STABLE_COMMIT=${1:-"HEAD~1"}
LOG_FILE="/var/log/rollback_$(date +%Y%m%d_%H%M%S).log"

# Log everything
exec > >(tee -a ${LOG_FILE})
exec 2>&1

echo "Rollback to: $STABLE_COMMIT"
echo "Started at: $(date)"

# 1. Pause queues
echo "1/8 Pausing queues..."
curl -X POST http://localhost:3001/api/queue/pause-all || echo "Warning: Could not pause queues"

# 2. Checkout code
echo "2/8 Checking out stable version..."
git fetch
git checkout $STABLE_COMMIT

# 3. Install dependencies
echo "3/8 Installing dependencies..."
npm install

# 4. Build
echo "4/8 Building..."
npm run build

# 5. Restart services
echo "5/8 Restarting services..."
pm2 restart all

# 6. Wait for services to start
echo "6/8 Waiting for services to start..."
sleep 15

# 7. Verify health
echo "7/8 Verifying health..."
if curl -f http://localhost:3001/health; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# 8. Resume queues
echo "8/8 Resuming queues..."
curl -X POST http://localhost:3001/api/queue/resume-all

echo "✅ ROLLBACK COMPLETED"
echo "Completed at: $(date)"
echo "Log file: $LOG_FILE"
```

### 11.2 Database Backup Script

Create: `/scripts/backup-database.sh`

```bash
#!/bin/bash

BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

echo "Creating database backup: $BACKUP_FILE"

pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully"
  echo "File: $BACKUP_FILE"
  echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
else
  echo "❌ Backup failed"
  exit 1
fi

# Clean up old backups (keep last 10)
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +11 | xargs rm -f
```

---

## Document Information

- **Version**: 1.0.0
- **Last Updated**: 2025-11-07
- **Author**: Testing & Documentation Engineer (worktree-7)
- **Review Cycle**: After each rollback or quarterly
- **Next Review**: 2025-12-07
- **Tested**: ❌ Not yet tested (test in staging environment)

---

## Quick Command Reference

```bash
# Emergency Rollback
./scripts/emergency-rollback.sh [commit-hash]

# Pause All Queues
curl -X POST http://localhost:3001/api/queue/pause-all

# Resume All Queues
curl -X POST http://localhost:3001/api/queue/resume-all

# Health Check
curl http://localhost:3001/health

# Backup Database
./scripts/backup-database.sh

# Check Logs
tail -f /var/log/app.log | grep ERROR

# Check Version
git rev-parse HEAD
curl http://localhost:3001/api/version
```
