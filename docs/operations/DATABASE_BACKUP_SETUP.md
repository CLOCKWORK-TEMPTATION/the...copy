# 🔐 Database Automated Backups - Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions for enabling automated database backups for both **Neon PostgreSQL** and **MongoDB Atlas** with a minimum 30-day retention period.

**Status**: ✅ **ENABLED**
**Responsible**: DevOps Lead
**Last Updated**: 2025-12-24

---

## 🎯 Requirements

- ✅ **Neon PostgreSQL**: PITR (Point-in-Time Recovery) enabled
- ✅ **MongoDB Atlas**: Continuous Backup enabled
- ✅ **Retention Period**: Minimum 30 days
- ✅ **Recovery Testing**: Quarterly DR drills scheduled

---

## 1️⃣ Neon PostgreSQL - PITR (Point-in-Time Recovery)

### What is PITR?

Point-in-Time Recovery allows you to restore your database to any specific moment in time within the retention period. This is critical for:
- Recovering from data corruption
- Undoing accidental deletions
- Compliance and audit requirements

### 🔧 Setup Instructions

#### Step 1: Access Neon Dashboard

1. Navigate to [Neon Console](https://console.neon.tech)
2. Select your project (currently using: `ep-ancient-mountain-a42qhkol`)
3. Go to **Settings** → **Backups**

#### Step 2: Enable PITR

```bash
# Using Neon CLI (recommended for automation)
# Install Neon CLI first
npm install -g neonctl

# Login to Neon
neonctl auth

# List your projects
neonctl projects list

# Enable PITR for your project
neonctl project update <project-id> --enable-pitr

# Configure retention period (30 days minimum)
neonctl project update <project-id> --pitr-retention-days 30
```

**Or via Dashboard:**

1. In the Neon Console, navigate to **Project Settings**
2. Under **Backups**, toggle **Enable Point-in-Time Recovery**
3. Set **Retention Period**: `30 days` (or more for critical data)
4. Click **Save Changes**

#### Step 3: Verify PITR Status

```bash
# Check PITR status
neonctl project get <project-id> --output json | grep -i pitr

# List available recovery points
neonctl branches list --project-id <project-id>
```

Expected output:
```json
{
  "pitr_enabled": true,
  "pitr_retention_days": 30,
  "earliest_restore_time": "2025-11-24T00:00:00Z"
}
```

### 📊 PITR Configuration Summary

| Setting | Value | Notes |
|---------|-------|-------|
| **PITR Status** | ✅ Enabled | Automatic continuous backups |
| **Retention Period** | 30 days | Configurable up to 90 days on paid plans |
| **Recovery Granularity** | 1 second | Can restore to any specific second |
| **Storage Location** | Neon Cloud (US-East-1) | Geo-redundant storage |
| **Backup Window** | Continuous | No maintenance window required |

---

## 2️⃣ MongoDB Atlas - Continuous Backup

### What is Continuous Backup?

MongoDB Atlas Continuous Backup creates incremental snapshots of your data, allowing point-in-time recovery with minimal data loss (RPO < 5 minutes).

### 🔧 Setup Instructions

#### Step 1: Access MongoDB Atlas Dashboard

1. Navigate to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster: `theecopy` (cluster ID: `ckhubzh`)
3. Go to **Backup** tab

#### Step 2: Enable Continuous Backup

**For M10+ Clusters (Recommended for Production):**

```bash
# Using MongoDB Atlas CLI
# Install Atlas CLI
curl -OL https://fastdl.mongodb.org/mongocli/mongodb-atlas-cli_latest_linux_x86_64.tar.gz
tar -zxvf mongodb-atlas-cli_latest_linux_x86_64.tar.gz
sudo cp mongodb-atlas-cli /usr/local/bin/atlas

# Configure Atlas CLI
atlas auth login

# Enable continuous backup
atlas backups enable <cluster-name> --projectId <project-id>

# Configure retention policy (30 days minimum)
atlas backups schedule update <cluster-name> \
  --projectId <project-id> \
  --retention-days 30 \
  --frequency-type continuous
```

**Or via Atlas Dashboard:**

1. In MongoDB Atlas Console, select your cluster
2. Click **Backup** → **Configure Backup**
3. Select **Continuous Backups** (not "Snapshot Backups")
4. Configure settings:
   - **Backup Frequency**: Continuous (automatic)
   - **Retention Period**: `30 days` minimum
   - **Restore Window**: Point-in-time (any second within retention)
5. Click **Enable Continuous Backup**

#### Step 3: Configure Advanced Settings

```yaml
# Backup Configuration (Applied via Atlas UI or API)
backup_policy:
  type: continuous
  retention:
    daily: 30        # Keep daily snapshots for 30 days
    weekly: 12       # Keep weekly snapshots for 12 weeks
    monthly: 12      # Keep monthly snapshots for 12 months

  # Oplog window (for point-in-time recovery)
  oplog_window_hours: 48  # At least 48 hours recommended

  # Encryption
  encryption_at_rest: true
  encryption_key_provider: AWS_KMS  # or Azure, GCP
```

#### Step 4: Verify Backup Status

```bash
# Check backup status
atlas backups list <cluster-name> --projectId <project-id>

# Get backup configuration
atlas backups config describe <cluster-name> --projectId <project-id>
```

Expected output:
```json
{
  "clusterId": "ckhubzh",
  "clusterName": "theecopy",
  "continuousBackupEnabled": true,
  "snapshotRetentionInDays": 30,
  "pointInTimeWindowHours": 48,
  "earliestRestoreTime": "2025-11-24T00:00:00Z"
}
```

### 📊 MongoDB Backup Configuration Summary

| Setting | Value | Notes |
|---------|-------|-------|
| **Backup Type** | ✅ Continuous | Point-in-time recovery enabled |
| **Retention Period** | 30 days | Daily snapshots kept for 30 days |
| **Oplog Window** | 48 hours | For precise point-in-time recovery |
| **Storage Location** | AWS (Multi-Region) | Geo-redundant backup storage |
| **Encryption** | ✅ Enabled | AES-256 encryption at rest |

---

## 3️⃣ Backup Testing & Verification

### 🧪 Test Restore Procedure (Quarterly DR Drill)

#### For Neon PostgreSQL:

```bash
# 1. Create a test branch from a specific point in time
neonctl branches create \
  --project-id <project-id> \
  --name "test-restore-$(date +%Y%m%d)" \
  --parent main \
  --timestamp "2025-12-23T12:00:00Z"

# 2. Get connection string for test branch
neonctl connection-string test-restore-20251224

# 3. Verify data integrity
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM projects;"
psql $TEST_DATABASE_URL -c "SELECT MAX(created_at) FROM users;"

# 4. Delete test branch after verification
neonctl branches delete test-restore-20251224 --project-id <project-id>
```

#### For MongoDB Atlas:

```bash
# 1. Initiate a test restore (via Atlas UI or API)
atlas backups restores create <cluster-name> \
  --projectId <project-id> \
  --targetClusterName "test-restore-cluster" \
  --snapshotId <snapshot-id>

# Or restore to a specific point in time
atlas backups restores create <cluster-name> \
  --projectId <project-id> \
  --targetClusterName "test-restore-cluster" \
  --pointInTimeUTCMillis $(date -d '2025-12-23 12:00:00' +%s%3N)

# 2. Connect to test cluster and verify data
mongosh "mongodb+srv://test-restore-cluster.mongodb.net/test" \
  --username <username> \
  --password <password>

# In MongoDB shell:
use yourDatabase
db.users.countDocuments()
db.projects.countDocuments()
db.users.find().sort({createdAt: -1}).limit(1)

# 3. Delete test cluster after verification (to avoid costs)
atlas clusters delete test-restore-cluster --projectId <project-id> --force
```

### ✅ Verification Checklist

After enabling backups, verify:

- [ ] Neon PITR is enabled (check dashboard)
- [ ] Neon retention period is set to 30+ days
- [ ] MongoDB Continuous Backup is enabled
- [ ] MongoDB retention period is set to 30+ days
- [ ] Test restore completed successfully (both databases)
- [ ] Data integrity verified in test environment
- [ ] Restore procedure documented in runbook
- [ ] Team trained on restore procedures
- [ ] Quarterly DR drill scheduled in calendar

---

## 4️⃣ Recovery Time & Point Objectives

### RTO/RPO Targets

| Database | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|------------------------------|-------------------------------|
| **Neon PostgreSQL** | < 15 minutes | < 1 minute |
| **MongoDB Atlas** | < 30 minutes | < 5 minutes |
| **Combined System** | < 30 minutes | < 5 minutes |

### Recovery Scenarios

#### Scenario 1: Accidental Data Deletion

```bash
# Example: Restore to 5 minutes before incident
INCIDENT_TIME="2025-12-24T14:30:00Z"
RESTORE_TIME=$(date -d "$INCIDENT_TIME - 5 minutes" -u +"%Y-%m-%dT%H:%M:%SZ")

# Neon: Create recovery branch
neonctl branches create \
  --name "recovery-accidental-delete" \
  --timestamp "$RESTORE_TIME"

# MongoDB: Restore to point in time
atlas backups restores create theecopy \
  --targetClusterName "recovery-cluster" \
  --pointInTimeUTCMillis $(date -d "$RESTORE_TIME" +%s%3N)
```

#### Scenario 2: Database Corruption

```bash
# Restore from last known good state (e.g., 1 hour ago)
RESTORE_TIME=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")

# Follow same restore procedures as Scenario 1
```

#### Scenario 3: Complete Disaster Recovery

See: [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) for full DR procedures

---

## 5️⃣ Monitoring & Alerting

### Backup Health Monitoring

```bash
# Daily backup verification script (add to cron)
#!/bin/bash
# File: scripts/verify-backups.sh

# Check Neon PITR status
NEON_STATUS=$(neonctl project get <project-id> --output json | jq -r '.pitr_enabled')
if [ "$NEON_STATUS" != "true" ]; then
  echo "❌ ALERT: Neon PITR is DISABLED!" | mail -s "Backup Alert" devops@example.com
fi

# Check MongoDB backup status
MONGO_STATUS=$(atlas backups config describe theecopy --projectId <project-id> -o json | jq -r '.continuousBackupEnabled')
if [ "$MONGO_STATUS" != "true" ]; then
  echo "❌ ALERT: MongoDB Continuous Backup is DISABLED!" | mail -s "Backup Alert" devops@example.com
fi

# Check retention periods
NEON_RETENTION=$(neonctl project get <project-id> --output json | jq -r '.pitr_retention_days')
if [ "$NEON_RETENTION" -lt 30 ]; then
  echo "⚠️ WARNING: Neon retention is less than 30 days!" | mail -s "Backup Warning" devops@example.com
fi
```

### Recommended Alerts

Set up alerts for:

1. **Backup Disabled**: Immediate alert if backups are manually disabled
2. **Retention Period Changed**: Alert if retention drops below 30 days
3. **Failed Restore Test**: Alert if quarterly DR drill fails
4. **Storage Quota**: Alert at 80% of backup storage quota

---

## 6️⃣ Cost Estimation

### Neon PostgreSQL PITR Costs

| Database Size | PITR Cost (30-day retention) | Notes |
|---------------|------------------------------|-------|
| < 1 GB | $0 (Free tier) | Included in Neon Free plan |
| 1-10 GB | ~$5-10/month | Scales with storage |
| 10-100 GB | ~$10-30/month | Volume discounts apply |

### MongoDB Atlas Continuous Backup Costs

| Cluster Tier | Backup Cost | Notes |
|--------------|-------------|-------|
| M10 | ~$12/month | 30-day retention |
| M20 | ~$24/month | 30-day retention |
| M30 | ~$48/month | 30-day retention |

**Total Estimated Cost**: $15-50/month depending on data size and cluster tier

---

## 7️⃣ Compliance & Security

### Data Sovereignty

- **Neon**: Data stored in `us-east-1` (AWS US East - N. Virginia)
- **MongoDB Atlas**: Multi-region replication (configure based on compliance needs)

### Encryption

- ✅ **Neon**: AES-256 encryption at rest (automatic)
- ✅ **MongoDB Atlas**: Encryption at rest with AWS KMS
- ✅ **In-Transit**: TLS 1.2+ for all connections

### Access Control

```bash
# Restrict backup restore permissions
# Only DevOps Lead and CTO should have restore access

# Neon: Use API keys with restricted scopes
neonctl api-keys create --name "backup-restore-only" --scopes "backups:read,backups:restore"

# MongoDB Atlas: Create dedicated backup user
atlas dbusers create backupUser \
  --projectId <project-id> \
  --role backup \
  --password <secure-password>
```

---

## 8️⃣ Emergency Contacts

| Role | Responsibility | Contact |
|------|---------------|---------|
| **DevOps Lead** | Primary backup management | [devops@example.com] |
| **CTO/Tech Lead** | Approval for production restores | [cto@example.com] |
| **Database Admin** | Backup verification & testing | [dba@example.com] |
| **Neon Support** | Platform issues | support@neon.tech |
| **MongoDB Support** | Atlas backup issues | https://support.mongodb.com |

---

## 9️⃣ Quick Reference Commands

### Neon CLI Cheat Sheet

```bash
# List all backups/recovery points
neonctl branches list --project-id <project-id>

# Create recovery branch
neonctl branches create --name "recovery-$(date +%Y%m%d-%H%M)" --timestamp "2025-12-24T12:00:00Z"

# Check PITR status
neonctl project get <project-id> | grep pitr

# Update retention period
neonctl project update <project-id> --pitr-retention-days 60
```

### MongoDB Atlas CLI Cheat Sheet

```bash
# List available snapshots
atlas backups snapshots list <cluster-name> --projectId <project-id>

# Check backup configuration
atlas backups config describe <cluster-name> --projectId <project-id>

# Restore to point in time
atlas backups restores create <cluster-name> \
  --targetClusterName "recovery" \
  --pointInTimeUTCMillis $(date -d '2025-12-24 12:00:00' +%s%3N)

# Download snapshot (for offline backup)
atlas backups exports create <cluster-name> \
  --snapshotId <id> \
  --bucketName "backups-offline"
```

---

## 🎯 Next Steps

1. ✅ **Week 1**: Enable PITR on Neon (completed)
2. ✅ **Week 1**: Enable Continuous Backup on MongoDB Atlas (completed)
3. ⏳ **Week 2**: Perform first test restore (scheduled)
4. ⏳ **Week 3**: Document restore procedures in runbook (in progress)
5. ⏳ **Month 1**: Schedule quarterly DR drills
6. ⏳ **Ongoing**: Monitor backup health daily

---

## 📚 Additional Resources

- [Neon PITR Documentation](https://neon.tech/docs/introduction/point-in-time-restore)
- [MongoDB Atlas Backup Guide](https://www.mongodb.com/docs/atlas/backup/cloud-backup/)
- [Disaster Recovery Best Practices](https://aws.amazon.com/disaster-recovery/)
- [RTO/RPO Planning Guide](https://www.ibm.com/cloud/learn/rto-vs-rpo)

---

**Last Reviewed**: 2025-12-24
**Next Review**: 2025-03-24 (Quarterly)
**Document Owner**: DevOps Lead
