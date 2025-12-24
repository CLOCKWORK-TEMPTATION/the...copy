# Database Backup & Restore Testing Scripts

This directory contains scripts for testing database backup and restore procedures.

## Overview

These scripts help ensure that database backups are valid and can be successfully restored in case of disaster. Regular testing is critical to maintain data integrity and meet RTO/RPO requirements.

## Scripts

### 1. `test-restore.sh`

Tests the database restore process by creating a backup and restoring it to a test environment.

**Features**:
- Supports both PostgreSQL (Neon) and MongoDB (Atlas)
- Creates timestamped backups
- Restores to test databases with `_test_restore` suffix
- Logs all operations to `logs/` directory

**Usage**:
```bash
./test-restore.sh
```

**Output**:
- Backup files in `logs/` directory
- Test database connection strings
- Detailed log file: `logs/restore-test-YYYYMMDD_HHMMSS.log`

### 2. `verify-data-integrity.sh`

Verifies the integrity of restored database backups.

**Features**:
- Checks record/document counts in all tables/collections
- Verifies referential integrity
- Compares test database with source database
- Generates comprehensive integrity report

**Usage**:
```bash
# Verify test databases (must run test-restore.sh first)
./verify-data-integrity.sh

# Skip source comparison
./verify-data-integrity.sh --skip-comparison
```

**Output**:
- Integrity check results
- Success/failure statistics
- Detailed log file: `logs/integrity-check-YYYYMMDD_HHMMSS.log`

### 3. `cleanup-test-dbs.sh`

Cleans up test databases and old backup files.

**Features**:
- Drops test databases created during testing
- Removes backup files older than 7 days
- Safe to run anytime

**Usage**:
```bash
./cleanup-test-dbs.sh
```

## Prerequisites

### PostgreSQL / Neon

**Required**:
- `psql` - PostgreSQL client
- `pg_dump` - PostgreSQL backup utility

**Optional** (for Neon PITR):
- `neonctl` - Neon CLI tool
  ```bash
  npm install -g neonctl
  ```

### MongoDB / Atlas

**Required** (for MongoDB testing):
- `mongosh` - MongoDB Shell
- `mongodump` - MongoDB backup utility
- `mongorestore` - MongoDB restore utility

Install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools

## Environment Variables

Ensure the following environment variables are set in `backend/.env`:

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# MongoDB (if using)
MONGODB_URI=mongodb+srv://user:password@host/database

# Redis (for cache management)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Workflow

### Complete Restore Test

Run all three scripts in sequence:

```bash
# Step 1: Create backup and restore to test environment
./test-restore.sh

# Step 2: Verify data integrity
./verify-data-integrity.sh

# Step 3: Clean up when done
./cleanup-test-dbs.sh
```

### Quick Test

For a quick sanity check:

```bash
# Combined test
./test-restore.sh && ./verify-data-integrity.sh && ./cleanup-test-dbs.sh
```

## Output Files

All scripts create output in the `logs/` directory:

- `backup_*.sql` - PostgreSQL backup files
- `mongodb_backup_*/` - MongoDB backup directories
- `restore-test-*.log` - Restore test logs
- `integrity-check-*.log` - Integrity verification logs

## Logs Directory Structure

```
scripts/database/logs/
├── backup_20240101_120000.sql
├── mongodb_backup_20240101_120000/
├── restore-test-20240101_120000.log
└── integrity-check-20240101_120500.log
```

## Testing Schedule

**Recommended Schedule**:
- **Weekly**: Run complete restore test
- **After major changes**: Test before and after
- **Before production deployment**: Verify backup integrity
- **Monthly**: Test PITR (Point-in-Time Recovery) if available

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection string format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

### MongoDB Connection Issues

```bash
# Test connection
mongosh $MONGODB_URI --eval "db.adminCommand('ping')"

# Check URI format
echo $MONGODB_URI
# Should be: mongodb+srv://user:password@host/database
```

### Permission Errors

```bash
# PostgreSQL: Check user permissions
psql $DATABASE_URL -c "SELECT current_user, session_user;"

# MongoDB: Check user roles
mongosh $MONGODB_URI --eval "db.runCommand({connectionStatus: 1})"
```

### Script Execution Errors

```bash
# Ensure scripts are executable
chmod +x *.sh

# Check for line ending issues (Windows)
dos2unix *.sh  # If available
```

## Best Practices

1. **Test Regularly**: Don't wait for a disaster to test your backups
2. **Review Logs**: Always check log files for warnings or errors
3. **Document Results**: Use the template in RUNBOOKS.md to document tests
4. **Clean Up**: Always run cleanup after testing
5. **Monitor Size**: Watch backup sizes to ensure they're growing as expected
6. **Verify Integrity**: Never skip the integrity verification step
7. **Test RTO/RPO**: Time your restore tests to verify you can meet RTO goals

## Integration with TODO.md

This implementation satisfies TODO.md task #2:

- [x] استعادة Backup الأخير إلى Test Environment ✓
- [x] التحقق من سلامة البيانات ✓
- [x] توثيق الخطوات في Runbook ✓
- [x] المسؤول: DevOps + DBA ✓

## Related Documentation

- [RUNBOOKS.md](../../docs/operations/RUNBOOKS.md) - Section 4.6: Database Restore Testing
- [TODO.md](../../TODO.md) - Task #2: اختبار Database Restore
- [ROLLBACK_PLAN.md](../../docs/operations/ROLLBACK_PLAN.md) - Rollback procedures

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the detailed logs in `logs/` directory
3. Consult [RUNBOOKS.md](../../docs/operations/RUNBOOKS.md)
4. Contact DevOps or DBA team

## Version History

- **v1.0.0** (2024-12-24): Initial implementation
  - PostgreSQL backup and restore testing
  - MongoDB backup and restore testing
  - Data integrity verification
  - Automated cleanup
  - Comprehensive logging
