# RTO/RPO Requirements

## Overview

This document defines Recovery Time Objective (RTO) and Recovery Point Objective (RPO) requirements for all critical services in the system.

### Definitions

- **RTO (Recovery Time Objective)**: Maximum acceptable time to restore a service after a failure
- **RPO (Recovery Point Objective)**: Maximum acceptable amount of data loss measured in time

---

## Service Level Requirements

### 1. User Authentication Service

**Priority**: Critical (P0)

- **RTO**: < 15 minutes
- **RPO**: < 5 minutes
- **Impact**: Complete application unavailability if down
- **Dependencies**:
  - PostgreSQL (Neon) database
  - Redis session store
  - JWT token service

**Recovery Strategy**:
1. Automatic failover to standby instance
2. Session restoration from Redis backup
3. Database PITR (Point-in-Time Recovery)

**Backup Schedule**:
- Continuous replication (Neon PITR)
- Redis snapshots every 5 minutes
- Transaction logs retained for 7 days

---

### 2. Projects Service

**Priority**: High (P1)

- **RTO**: < 30 minutes
- **RPO**: < 15 minutes
- **Impact**: Users cannot access or modify projects
- **Dependencies**:
  - PostgreSQL (Neon) database
  - File storage (CDN)
  - AI Analysis queue

**Recovery Strategy**:
1. Restore from latest automated backup
2. Replay transaction logs from last 15 minutes
3. Rebuild search indexes if needed
4. Verify data integrity

**Backup Schedule**:
- Automated backups every 15 minutes
- Full backup daily at 2:00 AM UTC
- Incremental backups hourly
- 30-day retention period

---

### 3. Cache Service (Redis)

**Priority**: Medium (P2)

- **RTO**: < 1 hour
- **RPO**: < 24 hours
- **Impact**: Degraded performance, increased database load
- **Dependencies**:
  - Redis cluster
  - Application cache layer

**Recovery Strategy**:
1. Restart Redis instance
2. Load from RDB/AOF files
3. Warm cache from database
4. Monitor hit rate recovery

**Backup Schedule**:
- RDB snapshots every 6 hours
- AOF (Append-Only File) enabled
- Daily backup to S3
- 7-day retention period

**Note**: Cache is non-critical data; can be rebuilt from source. Focus is on minimizing performance impact during recovery.

---

## Recovery Procedures

### User Authentication Service Recovery

**Scenario**: Auth service becomes unavailable

**Steps**:
1. **Immediate Response** (0-5 minutes)
   ```bash
   # Check service status
   curl https://api.example.com/health

   # Check database connectivity
   psql $DATABASE_URL -c "SELECT 1;"

   # Check Redis status
   redis-cli ping
   ```

2. **Service Restart** (5-10 minutes)
   ```bash
   # Restart application servers
   pm2 restart auth-service

   # Or with Docker
   docker-compose restart auth-service

   # Verify health
   curl https://api.example.com/health/auth
   ```

3. **Database Recovery** (if needed, 10-15 minutes)
   ```bash
   # List available backups
   neon-cli backup list

   # Restore to specific point in time (within RPO)
   neon-cli backup restore \
     --timestamp="$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)" \
     --target=production

   # Verify data integrity
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   ```

4. **Session Recovery**
   ```bash
   # Check Redis backup
   redis-cli BGSAVE

   # Load from latest snapshot if needed
   redis-cli SHUTDOWN NOSAVE
   cp /backup/dump.rdb /var/lib/redis/dump.rdb
   systemctl start redis
   ```

5. **Verification** (15 minutes)
   - Test user login
   - Verify session persistence
   - Check error rates
   - Monitor for 30 minutes

---

### Projects Service Recovery

**Scenario**: Projects service failure or data corruption

**Steps**:
1. **Assessment** (0-5 minutes)
   ```bash
   # Check service logs
   tail -n 200 /var/log/app.log | grep -i "project"

   # Check database
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM projects;"
   ```

2. **Pause Queue Processing** (5 minutes)
   ```bash
   # Prevent new changes during recovery
   curl -X POST http://localhost:3001/api/queue/pause-all
   ```

3. **Database Restoration** (5-25 minutes)
   ```bash
   # Create backup of current state
   pg_dump $DATABASE_URL > corrupted_state_$(date +%Y%m%d_%H%M%S).sql

   # Restore from latest backup (within RPO window)
   neon-cli backup restore \
     --timestamp="$(date -u -d '15 minutes ago' +%Y-%m-%dT%H:%M:%SZ)" \
     --target=production

   # Verify restoration
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM projects;"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM scenes;"
   ```

4. **Data Integrity Check** (25-28 minutes)
   ```sql
   -- Check for orphaned records
   SELECT COUNT(*) FROM scenes WHERE project_id NOT IN (SELECT id FROM projects);

   -- Check for duplicate entries
   SELECT project_id, COUNT(*) FROM projects GROUP BY project_id HAVING COUNT(*) > 1;

   -- Verify foreign key constraints
   SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';
   ```

5. **Resume Operations** (28-30 minutes)
   ```bash
   # Resume queue processing
   curl -X POST http://localhost:3001/api/queue/resume-all

   # Warm cache
   curl -X POST http://localhost:3001/api/cache/warm

   # Monitor recovery
   watch -n 5 'curl -s http://localhost:3001/api/queue/stats'
   ```

---

### Cache Service Recovery

**Scenario**: Redis failure or data loss

**Steps**:
1. **Immediate Assessment** (0-10 minutes)
   ```bash
   # Check Redis status
   redis-cli ping

   # Check memory and connections
   redis-cli INFO

   # Check for corrupted RDB
   redis-check-rdb /var/lib/redis/dump.rdb
   ```

2. **Attempt Quick Recovery** (10-20 minutes)
   ```bash
   # Restart Redis
   systemctl restart redis

   # Or with Docker
   docker-compose restart redis

   # Verify startup
   redis-cli ping
   redis-cli DBSIZE
   ```

3. **Restore from Backup** (if needed, 20-40 minutes)
   ```bash
   # Stop Redis
   systemctl stop redis

   # Restore from latest backup
   cp /backup/latest/dump.rdb /var/lib/redis/dump.rdb
   cp /backup/latest/appendonly.aof /var/lib/redis/appendonly.aof

   # Start Redis
   systemctl start redis

   # Verify data
   redis-cli DBSIZE
   ```

4. **Cache Warm-up** (40-60 minutes)
   ```bash
   # Trigger automated cache warming
   curl -X POST http://localhost:3001/api/cache/warm

   # Monitor cache hit rate
   watch -n 10 'redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"'
   ```

5. **Performance Monitoring**
   - Monitor API response times
   - Check database load
   - Verify cache hit rate returns to >70%

---

## Testing & Validation

### Quarterly DR Drill Schedule

**Q1 (January)**: User Authentication Recovery
- Simulate auth service failure
- Test PITR restore within 5-minute RPO
- Verify RTO <15 minutes
- Document lessons learned

**Q2 (April)**: Projects Database Corruption
- Simulate data corruption
- Test backup restoration
- Verify data integrity checks
- Measure actual recovery time

**Q3 (July)**: Cache Cluster Failure
- Simulate Redis complete failure
- Test RDB/AOF recovery
- Measure cache warm-up time
- Verify performance impact

**Q4 (October)**: Full System DR Test
- Simulate multi-service failure
- Test complete recovery procedures
- Validate RTO/RPO for all services
- Update runbooks based on findings

### DR Drill Checklist

Before each drill:
- [ ] Notify all stakeholders
- [ ] Prepare isolated test environment
- [ ] Document current baseline metrics
- [ ] Have rollback plan ready
- [ ] Ensure monitoring is active

During drill:
- [ ] Record exact timestamps for all actions
- [ ] Document all commands executed
- [ ] Capture any errors or unexpected behavior
- [ ] Measure actual RTO vs target
- [ ] Verify data integrity post-recovery

After drill:
- [ ] Calculate actual RTO and RPO achieved
- [ ] Document gaps vs requirements
- [ ] Update runbooks if needed
- [ ] Create action items for improvements
- [ ] Share report with leadership

---

## Monitoring & Alerts

### Critical Alerts

**Auth Service Down**
- Trigger: Health check fails for >2 minutes
- Escalation: Page on-call engineer immediately
- Action: Begin auth service recovery procedure

**Database Replication Lag**
- Trigger: Replication lag >3 minutes (60% of RPO)
- Escalation: Alert SRE team
- Action: Investigate replication issues

**Backup Failure**
- Trigger: Backup job fails or skipped
- Escalation: Alert DevOps lead
- Action: Investigate and retry backup immediately

**Redis Memory Critical**
- Trigger: Memory usage >90%
- Escalation: Alert on-call engineer
- Action: Clear old keys or scale Redis

### Backup Monitoring

Daily verification:
```bash
# Verify latest backup exists and is recent
neon-cli backup list --latest

# Check backup age (should be <24 hours)
LATEST_BACKUP=$(neon-cli backup list --latest --format=json | jq -r '.[0].created_at')
BACKUP_AGE=$(( $(date +%s) - $(date -d "$LATEST_BACKUP" +%s) ))

if [ $BACKUP_AGE -gt 86400 ]; then
  echo "WARNING: Backup is older than 24 hours"
  # Send alert
fi
```

---

## Roles & Responsibilities

### SRE Team
- Monitor RTO/RPO compliance
- Execute DR drills quarterly
- Maintain recovery procedures
- Optimize backup strategies
- Review and update this document

### Tech Lead
- Approve RTO/RPO requirements
- Review DR drill results
- Prioritize recovery improvements
- Ensure team training

### DevOps Lead
- Configure automated backups
- Maintain backup infrastructure
- Monitor backup health
- Verify backup retention policies

### On-Call Engineer
- Execute recovery procedures during incidents
- Document actual RTO/RPO during incidents
- Report gaps to SRE team

---

## Continuous Improvement

### Monthly Review
- Check backup success rate (target: >99.9%)
- Review recovery time metrics
- Update contact information
- Verify alert configurations

### Quarterly Review
- Conduct DR drill
- Review and update RTO/RPO targets
- Assess infrastructure changes impact
- Update recovery procedures

### Annual Review
- Full DR strategy assessment
- Benchmark against industry standards
- Cost-benefit analysis of RTO/RPO levels
- Board/leadership presentation

---

## Related Documentation

- [RUNBOOKS.md](./RUNBOOKS.md) - Operational procedures
- [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) - Deployment rollback procedures
- [TODO.md](../../TODO.md) - Production readiness checklist

---

## Document Information

- **Version**: 1.0.0
- **Created**: 2025-12-24
- **Owner**: SRE Team / Tech Lead
- **Review Cycle**: Quarterly
- **Next Review**: 2026-03-24

---

## Emergency Contacts

| Service | Primary Contact | Backup Contact | Escalation |
|---------|----------------|----------------|------------|
| **User Auth** | On-Call SRE | Tech Lead | CTO |
| **Projects** | On-Call Engineer | Backend Lead | Engineering Manager |
| **Cache** | DevOps Lead | On-Call SRE | Infrastructure Manager |

**24/7 On-Call**: [To be configured]
**Incident Hotline**: [To be configured]
**Slack Channel**: #incidents-critical
