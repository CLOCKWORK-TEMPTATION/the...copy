# Operations Runbooks

## Overview

This document provides step-by-step procedures for common operational tasks, troubleshooting, and incident response.

---

## Table of Contents

1. [System Health Checks](#1-system-health-checks)
2. [Queue Management](#2-queue-management)
3. [Cache Management](#3-cache-management)
4. [Database Maintenance](#4-database-maintenance)
5. [Troubleshooting](#5-troubleshooting)
6. [Incident Response](#6-incident-response)
7. [Monitoring](#7-monitoring)
8. [Deployment Procedures](#8-deployment-procedures)

---

## 1. System Health Checks

### Daily Health Check

Run this checklist daily to ensure system health:

```bash
# 1. Check API Health
curl http://localhost:3001/health

# 2. Check Queue Status
curl http://localhost:3001/api/queue/stats

# 3. Check Redis Connection
redis-cli ping
# Expected: PONG

# 4. Check Database Connection
psql $DATABASE_URL -c "SELECT 1;"
# Expected: 1

# 5. Check Running Processes
pm2 list  # or docker ps

# 6. Check Disk Space
df -h

# 7. Check Memory Usage
free -h

# 8. Check Logs for Errors
tail -n 100 /var/log/app.log | grep -i error
```

### Expected Results

- API Health: Status 200, response time <100ms
- Queue Stats: All queues operational
- Redis: PONG response
- Database: Connection successful
- Disk Usage: <80%
- Memory Usage: <80%
- Recent Errors: <10 in last hour

---

## 2. Queue Management

### 2.1 Monitor Queue Health

```bash
# Access Bull Board Dashboard
http://localhost:3001/admin/queues

# Or via API
curl http://localhost:3001/api/queue/stats
```

### 2.2 Pause Queue

**When to use**: Deploying updates, maintenance, investigating issues

```bash
# Via API
curl -X POST http://localhost:3001/api/queue/ai-analysis/pause

# Or programmatically
```

```typescript
import { queueManager, QueueName } from './queues/queue.config';

await queueManager.pauseQueue(QueueName.AI_ANALYSIS);
```

### 2.3 Resume Queue

```bash
# Via API
curl -X POST http://localhost:3001/api/queue/ai-analysis/resume
```

```typescript
await queueManager.resumeQueue(QueueName.AI_ANALYSIS);
```

### 2.4 Clean Failed Jobs

**When to use**: After fixing issues, clearing old failed jobs

```bash
# Clean jobs older than 24 hours
curl -X POST http://localhost:3001/api/queue/ai-analysis/clean
```

```typescript
// Clean with 24 hour grace period
await queueManager.cleanQueue(QueueName.AI_ANALYSIS, 24 * 3600 * 1000);
```

### 2.5 Retry Failed Jobs

```typescript
// Retry specific failed job
const queue = queueManager.getQueue(QueueName.AI_ANALYSIS);
const failedJobs = await queue.getFailed();

for (const job of failedJobs) {
  await job.retry();
}
```

### 2.6 Remove Stuck Jobs

**Warning**: Only use when jobs are confirmed stuck

```typescript
const queue = queueManager.getQueue(QueueName.AI_ANALYSIS);
const stuckJob = await queue.getJob('job-id');

if (stuckJob) {
  await stuckJob.remove();
}
```

### 2.7 Queue Metrics

```typescript
// Get detailed queue statistics
const stats = await queueManager.getQueueStats(QueueName.AI_ANALYSIS);

console.log(`
Waiting: ${stats.waiting}
Active: ${stats.active}
Completed: ${stats.completed}
Failed: ${stats.failed}
Total: ${stats.total}
`);
```

---

## 3. Cache Management

### 3.1 Check Cache Health

```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# Check hit rate
INFO stats

# Check key count
DBSIZE

# Check specific key
GET gemini:analysis:scene:123
```

### 3.2 Clear Cache

**Warning**: This will clear all cached data

```bash
# Clear all cache
redis-cli FLUSHALL

# Clear specific database
redis-cli -n 0 FLUSHDB

# Clear specific pattern
redis-cli KEYS "gemini:*" | xargs redis-cli DEL
```

### 3.3 Cache Warm-up

After clearing cache or deployment:

```bash
# Trigger cache warming via API
curl -X POST http://localhost:3001/api/cache/warm
```

```typescript
// Warm critical data
const criticalProjects = await db.select().from(projects).limit(100);

for (const project of criticalProjects) {
  await cacheService.set(
    `project:${project.id}`,
    project,
    15 * 60 // 15 minutes
  );
}
```

### 3.4 Monitor Cache Performance

```bash
# Get cache statistics
redis-cli INFO stats

# Monitor in real-time
redis-cli MONITOR

# Check hit rate
redis-cli INFO stats | grep hit
```

### 3.5 Cache Key Patterns

```bash
# List all keys matching pattern
redis-cli KEYS "gemini:*"

# Count keys by pattern
redis-cli KEYS "project:*" | wc -l

# Check TTL
redis-cli TTL "gemini:analysis:scene:123"
```

---

## 4. Database Maintenance

### 4.1 Check Database Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC
LIMIT 20;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 4.2 Analyze Tables

```sql
-- Analyze all tables
ANALYZE;

-- Analyze specific table
ANALYZE projects;

-- Vacuum and analyze
VACUUM ANALYZE projects;
```

### 4.3 Reindex

**When to use**: After large data changes, performance degradation

```sql
-- Reindex specific index
REINDEX INDEX idx_scenes_project_id;

-- Reindex table
REINDEX TABLE scenes;

-- Reindex database (maintenance window required)
REINDEX DATABASE your_database;
```

### 4.4 Check Connections

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connections by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;

-- Kill long-running queries (>5 minutes)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 minutes';
```

### 4.5 Backup Database

```bash
# Full backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
pg_dump --schema-only $DATABASE_URL > schema_backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### 4.6 Database Restore Testing

**Purpose**: Regularly test database restore procedures to ensure backups are valid and can be restored in case of disaster.

**Frequency**: Weekly or after significant data changes

**Responsible**: DevOps + DBA

#### 4.6.1 Quick Restore Test

Use the automated scripts for testing:

```bash
# Navigate to database scripts directory
cd scripts/database

# Step 1: Run restore test
./test-restore.sh

# Step 2: Verify data integrity
./verify-data-integrity.sh

# Step 3: Clean up test databases
./cleanup-test-dbs.sh
```

#### 4.6.2 Manual PostgreSQL Restore Test

```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_test_$(date +%Y%m%d_%H%M%S).sql

# 2. Extract database name
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
TEST_DB="${DB_NAME}_test_restore"

# 3. Create test database
psql $DATABASE_URL -c "CREATE DATABASE ${TEST_DB};"

# 4. Restore to test database
BASE_URL=$(echo $DATABASE_URL | sed 's/\/[^\/]*$//')
psql "${BASE_URL}/${TEST_DB}" < backup_test_*.sql

# 5. Verify data
psql "${BASE_URL}/${TEST_DB}" -c "SELECT COUNT(*) FROM users;"
psql "${BASE_URL}/${TEST_DB}" -c "SELECT COUNT(*) FROM projects;"

# 6. Clean up
psql $DATABASE_URL -c "DROP DATABASE ${TEST_DB};"
```

#### 4.6.3 Neon PITR (Point-in-Time Recovery) Test

**Prerequisites**: Ensure Neon PITR is enabled in your Neon Console

```bash
# Install Neon CLI (if not installed)
npm install -g neonctl

# Authenticate
neonctl auth

# List available backups/branches
neonctl branches list

# Create a test branch from a specific point in time
neonctl branches create \
  --name test-restore-$(date +%Y%m%d) \
  --parent main \
  --type read_only

# Get the new branch connection string
neonctl connection-string test-restore-$(date +%Y%m%d)

# Verify data in the restored branch
psql <new-branch-connection-string> -c "SELECT COUNT(*) FROM users;"

# Delete test branch when done
neonctl branches delete test-restore-$(date +%Y%m%d)
```

#### 4.6.4 MongoDB Atlas Restore Test

**Prerequisites**: Ensure MongoDB Atlas Continuous Backup is enabled

```bash
# Using MongoDB Atlas UI:
# 1. Navigate to Database Deployments
# 2. Click on "Backup" tab
# 3. Select latest backup
# 4. Click "Restore"
# 5. Choose "Download" or "Restore to cluster"
# 6. For testing, use "Download" option

# Manual restore using mongodump/mongorestore:

# 1. Create backup
mongodump --uri="${MONGODB_URI}" --out=./mongodb_backup_$(date +%Y%m%d)

# 2. Extract database name
MONGO_DB=$(echo $MONGODB_URI | sed -n 's/.*\/\([^?]*\).*/\1/p')
TEST_MONGO_DB="${MONGO_DB}_test_restore"

# 3. Create test database URI
TEST_MONGO_URI=$(echo $MONGODB_URI | sed "s/${MONGO_DB}/${TEST_MONGO_DB}/")

# 4. Restore to test database
mongorestore --uri="${TEST_MONGO_URI}" ./mongodb_backup_*/

# 5. Verify data
mongosh "${TEST_MONGO_URI}" --eval "db.stats()"
mongosh "${TEST_MONGO_URI}" --eval "db.getCollectionNames()"

# 6. Clean up
mongosh "${TEST_MONGO_URI}" --eval "db.dropDatabase()"
```

#### 4.6.5 Data Integrity Verification Checklist

After restore, verify the following:

**PostgreSQL**:
- [ ] All tables present
- [ ] Record counts match source database
- [ ] Foreign key constraints intact
- [ ] Indexes present and functional
- [ ] No NULL values in critical columns
- [ ] Sequences reset correctly

**MongoDB**:
- [ ] All collections present
- [ ] Document counts match source database
- [ ] Indexes present
- [ ] No data corruption

**Cross-Database**:
- [ ] User counts consistent between PostgreSQL and MongoDB
- [ ] Reference integrity between databases maintained

#### 4.6.6 Restore Test Documentation Template

Document each restore test using this template:

```markdown
# Database Restore Test Report

**Date**: YYYY-MM-DD
**Performed By**: [Name]
**Test Type**: [Full/Partial/PITR]

## Test Results

### PostgreSQL
- Backup Size: [X GB]
- Restore Time: [X minutes]
- Records Verified: [X]
- Status: [PASS/FAIL]
- Issues: [None or describe]

### MongoDB
- Backup Size: [X GB]
- Restore Time: [X minutes]
- Documents Verified: [X]
- Status: [PASS/FAIL]
- Issues: [None or describe]

## Data Integrity
- [✓/✗] All tables/collections present
- [✓/✗] Record counts match
- [✓/✗] Foreign keys intact
- [✓/✗] No data corruption

## Recommendations
[Any recommendations or action items]

## Next Test Scheduled
[Date for next test]
```

#### 4.6.7 Troubleshooting Restore Issues

**Issue**: Restore fails with permission errors
```bash
# Solution: Check user permissions
psql $DATABASE_URL -c "SELECT * FROM pg_roles WHERE rolname = current_user;"
# Grant necessary permissions if needed
```

**Issue**: Foreign key constraint violations during restore
```bash
# Solution: Disable constraints temporarily
psql $DATABASE_URL -c "SET session_replication_role = replica;"
# Restore data
# Re-enable constraints
psql $DATABASE_URL -c "SET session_replication_role = DEFAULT;"
```

**Issue**: MongoDB restore hangs
```bash
# Solution: Check network connectivity and MongoDB server status
mongosh $MONGODB_URI --eval "db.serverStatus()"
# Use --numParallelCollections for faster restore
mongorestore --uri=$MONGODB_URI --numParallelCollections=4
```

---

## 5. Troubleshooting

### 5.1 High Queue Length

**Symptoms**: Queue length >100, slow processing

**Diagnosis**:
```typescript
const stats = await queueManager.getQueueStats(QueueName.AI_ANALYSIS);
console.log('Waiting jobs:', stats.waiting);
console.log('Active jobs:', stats.active);
```

**Solutions**:
1. Check if workers are running
2. Increase concurrency temporarily
3. Pause non-critical queues
4. Check for stuck jobs

```typescript
// Increase concurrency
const worker = queueManager.registerWorker(
  QueueName.AI_ANALYSIS,
  processor,
  { concurrency: 10 } // Increase from 3 to 10
);
```

### 5.2 High Cache Miss Rate

**Symptoms**: Cache hit rate <70%, slow response times

**Diagnosis**:
```bash
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"
```

**Solutions**:
1. Check TTL settings
2. Warm cache for common queries
3. Review cache key strategy
4. Increase cache memory if needed

### 5.3 Slow Database Queries

**Symptoms**: API response time >500ms, database CPU high

**Diagnosis**:
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check missing indexes
SELECT * FROM pg_stat_all_tables
WHERE idx_scan = 0 AND seq_scan > 0;
```

**Solutions**:
1. Add missing indexes
2. Optimize query structure
3. Use EXPLAIN ANALYZE
4. Consider partitioning large tables

### 5.4 Memory Issues

**Symptoms**: High memory usage, OOM errors

**Diagnosis**:
```bash
# Check memory usage
free -h

# Check process memory
ps aux | sort -k 4 -r | head -10

# Check Node.js heap
node --max-old-space-size=4096 app.js
```

**Solutions**:
1. Restart services
2. Clear cache if needed
3. Increase memory allocation
4. Check for memory leaks

### 5.5 Failed Jobs

**Symptoms**: High failure rate, errors in logs

**Diagnosis**:
```typescript
const queue = queueManager.getQueue(QueueName.AI_ANALYSIS);
const failedJobs = await queue.getFailed(0, 10);

for (const job of failedJobs) {
  console.log('Job ID:', job.id);
  console.log('Failed reason:', job.failedReason);
  console.log('Stack trace:', job.stacktrace);
}
```

**Solutions**:
1. Identify error pattern
2. Fix underlying issue
3. Retry failed jobs
4. Adjust retry configuration if needed

---

## 6. Incident Response

### 6.1 Service Down

**Priority**: P0 - Critical

**Steps**:
1. Check service status
2. Check logs for errors
3. Restart service
4. Verify health endpoints
5. Monitor for stability

```bash
# Check logs
tail -f /var/log/app.log

# Restart service
pm2 restart app  # or docker-compose restart

# Verify health
curl http://localhost:3001/health
```

### 6.2 High Error Rate

**Priority**: P1 - High

**Steps**:
1. Check error logs
2. Identify error pattern
3. Check external dependencies (DB, Redis, APIs)
4. Roll back if recent deployment
5. Implement fix

```bash
# Check recent errors
tail -n 1000 /var/log/app.log | grep ERROR | tail -n 50

# Check error rate
grep ERROR /var/log/app.log | wc -l
```

### 6.3 Performance Degradation

**Priority**: P2 - Medium

**Steps**:
1. Check system resources
2. Check database performance
3. Check cache hit rate
4. Check queue length
5. Scale if needed

### 6.4 Data Inconsistency

**Priority**: P1 - High

**Steps**:
1. Identify affected records
2. Pause related queues
3. Fix data integrity
4. Verify fix
5. Resume operations

---

## 7. Monitoring

### 7.1 Set Up Monitoring

```typescript
// Example: Monitor queue health
setInterval(async () => {
  const stats = await queueManager.getAllStats();

  for (const stat of stats) {
    if (stat.waiting > 100) {
      console.warn(`Queue ${stat.name} has ${stat.waiting} waiting jobs`);
      // Send alert
    }

    if (stat.failed / stat.total > 0.05) {
      console.error(`Queue ${stat.name} has high failure rate`);
      // Send alert
    }
  }
}, 60000); // Every minute
```

### 7.2 Key Metrics to Track

- API response time (P50, P95, P99)
- Error rate
- Queue length and processing time
- Cache hit/miss ratio
- Database query time
- Memory and CPU usage
- Disk space

### 7.3 Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API P95 Response Time | >500ms | >1000ms | Investigate performance |
| Error Rate | >2% | >5% | Check logs, rollback if needed |
| Queue Length | >100 | >500 | Increase workers, pause queues |
| Cache Hit Rate | <70% | <50% | Review cache strategy |
| Disk Space | >80% | >90% | Clean logs, increase space |

---

## 8. Deployment Procedures

### 8.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Backup completed
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Stakeholders notified

### 8.2 Deployment Steps

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# 2. Pause queues
curl -X POST http://localhost:3001/api/queue/pause-all

# 3. Run database migrations
npm run db:push

# 4. Deploy new code
git pull origin main
npm install
npm run build

# 5. Restart services
pm2 restart all

# 6. Run smoke tests
npm run test:smoke

# 7. Resume queues
curl -X POST http://localhost:3001/api/queue/resume-all

# 8. Monitor for 15 minutes
# Watch logs, metrics, error rates
```

### 8.3 Post-Deployment Verification

```bash
# 1. Check health endpoints
curl http://localhost:3001/health

# 2. Check queue status
curl http://localhost:3001/api/queue/stats

# 3. Check error logs
tail -n 100 /var/log/app.log | grep ERROR

# 4. Test critical paths
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/analysis

# 5. Monitor metrics dashboard
# Check response times, error rates, queue health
```

### 8.4 Rollback Procedure

See [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) for detailed rollback procedures.

---

## 9. Maintenance Windows

### 9.1 Weekly Maintenance

**Recommended**: Sunday 2-4 AM (low traffic)

Tasks:
- Clean old queue jobs
- Vacuum database
- Clear old logs
- Review and apply updates
- Check disk space

```bash
# Clean queue jobs
curl -X POST http://localhost:3001/api/queue/clean-all

# Vacuum database
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Clean logs older than 30 days
find /var/log -name "*.log" -mtime +30 -delete
```

### 9.2 Monthly Maintenance

Tasks:
- Full database backup
- Security updates
- Performance review
- Capacity planning
- Update documentation

---

## 10. Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| On-Call Engineer | TBD | TBD | 24/7 |
| Database Admin | TBD | TBD | Business hours |
| DevOps Lead | TBD | TBD | Business hours |
| Engineering Manager | TBD | TBD | Business hours |

---

## 11. Useful Commands Reference

```bash
# Queue Management
curl http://localhost:3001/api/queue/stats
curl -X POST http://localhost:3001/api/queue/:name/pause
curl -X POST http://localhost:3001/api/queue/:name/resume
curl -X POST http://localhost:3001/api/queue/:name/clean

# Redis
redis-cli PING
redis-cli INFO
redis-cli FLUSHALL
redis-cli KEYS "pattern:*"

# Database
psql $DATABASE_URL -c "SELECT version();"
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
pg_dump $DATABASE_URL > backup.sql

# Logs
tail -f /var/log/app.log
grep ERROR /var/log/app.log
journalctl -u app-service -f

# System
df -h
free -h
htop
pm2 list
pm2 logs
```

---

## Document Information

- **Version**: 1.0.0
- **Last Updated**: 2025-11-07
- **Author**: Testing & Documentation Engineer (worktree-7)
- **Review Cycle**: Monthly
- **Next Review**: 2025-12-07
