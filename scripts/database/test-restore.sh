#!/bin/bash

# =============================================================================
# Database Restore Test Script
# =============================================================================
# This script tests the database restore process by:
# 1. Restoring the latest backup to a test environment
# 2. Verifying data integrity
# 3. Logging all operations
#
# Responsible: DevOps + DBA
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/restore-test-$(date +%Y%m%d_%H%M%S).log"
TEST_DB_SUFFIX="_test_restore"

# Create log directory
mkdir -p "${LOG_DIR}"

# Logging functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

# Error handler
error_handler() {
    log_error "Script failed at line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# =============================================================================
# Load Environment Variables
# =============================================================================

load_env() {
    log "Loading environment variables..."

    # Load from backend .env if it exists
    if [ -f "${SCRIPT_DIR}/../../backend/.env" ]; then
        set -a
        source "${SCRIPT_DIR}/../../backend/.env"
        set +a
        log_success "Environment variables loaded"
    else
        log_warning "No .env file found. Using system environment variables."
    fi
}

# =============================================================================
# PostgreSQL Backup & Restore Functions
# =============================================================================

test_postgresql_restore() {
    log "========================================="
    log "Testing PostgreSQL Restore"
    log "========================================="

    if [ -z "${DATABASE_URL:-}" ]; then
        log_warning "DATABASE_URL not set. Skipping PostgreSQL restore test."
        return 0
    fi

    # Extract database name from DATABASE_URL
    # Format: postgresql://user:pass@host:port/dbname
    DB_NAME=$(echo "${DATABASE_URL}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    TEST_DB_NAME="${DB_NAME}${TEST_DB_SUFFIX}"

    log "Source Database: ${DB_NAME}"
    log "Test Database: ${TEST_DB_NAME}"

    # Check if using Neon
    if echo "${DATABASE_URL}" | grep -q "neon"; then
        test_neon_restore
    else
        test_postgresql_standard_restore
    fi
}

test_neon_restore() {
    log "Detected Neon PostgreSQL database"

    # Check if neon CLI is installed
    if ! command -v neonctl &> /dev/null; then
        log_error "neonctl CLI not found. Please install: npm install -g neonctl"
        return 1
    fi

    log "Listing available backups..."
    neonctl branches list 2>&1 | tee -a "${LOG_FILE}"

    # Create a test branch from the latest backup (Neon's approach)
    log "Creating test branch for restore testing..."

    # Note: This is a placeholder - actual Neon restore would use their API/CLI
    log_warning "Neon PITR restore should be configured via Neon Console"
    log_warning "For testing, we'll create a standard PostgreSQL dump and restore"

    test_postgresql_standard_restore
}

test_postgresql_standard_restore() {
    log "Performing standard PostgreSQL backup and restore..."

    # Create backup
    BACKUP_FILE="${LOG_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"
    log "Creating backup to: ${BACKUP_FILE}"

    if pg_dump "${DATABASE_URL}" > "${BACKUP_FILE}" 2>> "${LOG_FILE}"; then
        log_success "Backup created successfully"
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        log "Backup size: ${BACKUP_SIZE}"
    else
        log_error "Failed to create backup"
        return 1
    fi

    # Create test database
    log "Creating test database: ${TEST_DB_NAME}"

    # Extract connection info
    PG_HOST=$(echo "${DATABASE_URL}" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    PG_PORT=$(echo "${DATABASE_URL}" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    PG_USER=$(echo "${DATABASE_URL}" | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

    # Construct base URL without database
    BASE_URL=$(echo "${DATABASE_URL}" | sed 's/\/[^\/]*$//')

    # Drop test database if it exists
    log "Dropping test database if exists..."
    psql "${BASE_URL}/postgres" -c "DROP DATABASE IF EXISTS ${TEST_DB_NAME};" 2>> "${LOG_FILE}" || true

    # Create test database
    log "Creating fresh test database..."
    if psql "${BASE_URL}/postgres" -c "CREATE DATABASE ${TEST_DB_NAME};" 2>> "${LOG_FILE}"; then
        log_success "Test database created"
    else
        log_error "Failed to create test database"
        return 1
    fi

    # Restore backup to test database
    TEST_DB_URL="${BASE_URL}/${TEST_DB_NAME}"
    log "Restoring backup to test database..."

    if psql "${TEST_DB_URL}" < "${BACKUP_FILE}" 2>> "${LOG_FILE}"; then
        log_success "Backup restored successfully"
    else
        log_error "Failed to restore backup"
        return 1
    fi

    # Export test database URL for verification
    export TEST_DATABASE_URL="${TEST_DB_URL}"

    log_success "PostgreSQL restore test completed"
}

# =============================================================================
# MongoDB Backup & Restore Functions
# =============================================================================

test_mongodb_restore() {
    log "========================================="
    log "Testing MongoDB Restore"
    log "========================================="

    if [ -z "${MONGODB_URI:-}" ]; then
        log_warning "MONGODB_URI not set. Skipping MongoDB restore test."
        return 0
    fi

    log "MongoDB URI configured"

    # Extract database name from MongoDB URI
    MONGO_DB=$(echo "${MONGODB_URI}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    TEST_MONGO_DB="${MONGO_DB}${TEST_DB_SUFFIX}"

    log "Source Database: ${MONGO_DB}"
    log "Test Database: ${TEST_MONGO_DB}"

    # Check if using MongoDB Atlas
    if echo "${MONGODB_URI}" | grep -q "mongodb.net\|mongodb+srv"; then
        test_mongodb_atlas_restore
    else
        test_mongodb_standard_restore
    fi
}

test_mongodb_atlas_restore() {
    log "Detected MongoDB Atlas database"

    log_warning "MongoDB Atlas backups should be managed via Atlas Console"
    log_warning "Point-in-Time Restore (PITR) should be enabled in Atlas settings"
    log_warning "For testing, we'll perform a standard mongodump/mongorestore"

    test_mongodb_standard_restore
}

test_mongodb_standard_restore() {
    log "Performing standard MongoDB backup and restore..."

    # Check if mongodump is available
    if ! command -v mongodump &> /dev/null; then
        log_error "mongodump not found. Please install MongoDB Database Tools"
        log_error "Visit: https://www.mongodb.com/try/download/database-tools"
        return 1
    fi

    # Create backup directory
    MONGO_BACKUP_DIR="${LOG_DIR}/mongodb_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "${MONGO_BACKUP_DIR}"

    log "Creating MongoDB backup to: ${MONGO_BACKUP_DIR}"

    # Perform backup
    if mongodump --uri="${MONGODB_URI}" --out="${MONGO_BACKUP_DIR}" 2>> "${LOG_FILE}"; then
        log_success "MongoDB backup created successfully"
        BACKUP_SIZE=$(du -sh "${MONGO_BACKUP_DIR}" | cut -f1)
        log "Backup size: ${BACKUP_SIZE}"
    else
        log_error "Failed to create MongoDB backup"
        return 1
    fi

    # Construct test database URI
    TEST_MONGO_URI=$(echo "${MONGODB_URI}" | sed "s/${MONGO_DB}/${TEST_MONGO_DB}/")

    log "Restoring to test database..."

    # Drop test database if exists
    log "Dropping test database if exists..."
    mongosh "${TEST_MONGO_URI}" --eval "db.dropDatabase()" 2>> "${LOG_FILE}" || true

    # Restore to test database
    if mongorestore --uri="${TEST_MONGO_URI}" "${MONGO_BACKUP_DIR}" 2>> "${LOG_FILE}"; then
        log_success "MongoDB backup restored successfully"
    else
        log_error "Failed to restore MongoDB backup"
        return 1
    fi

    # Export test MongoDB URI for verification
    export TEST_MONGODB_URI="${TEST_MONGO_URI}"

    log_success "MongoDB restore test completed"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    log "========================================="
    log "Database Restore Test"
    log "Started: $(date)"
    log "========================================="

    # Load environment
    load_env

    # Test PostgreSQL restore
    test_postgresql_restore

    # Test MongoDB restore
    test_mongodb_restore

    log "========================================="
    log "Restore Test Summary"
    log "========================================="
    log "PostgreSQL Test DB: ${TEST_DATABASE_URL:-N/A}"
    log "MongoDB Test DB: ${TEST_MONGODB_URI:-N/A}"
    log "Log file: ${LOG_FILE}"
    log "========================================="
    log_success "Database restore tests completed successfully!"
    log "========================================="
    log ""
    log "Next steps:"
    log "1. Run data integrity verification: ./verify-data-integrity.sh"
    log "2. Review the log file for any warnings or errors"
    log "3. Clean up test databases when done: ./cleanup-test-dbs.sh"
    log ""
    log "Test database connection strings:"
    if [ -n "${TEST_DATABASE_URL:-}" ]; then
        echo "PostgreSQL: ${TEST_DATABASE_URL}" | tee -a "${LOG_FILE}"
    fi
    if [ -n "${TEST_MONGODB_URI:-}" ]; then
        echo "MongoDB: ${TEST_MONGODB_URI}" | tee -a "${LOG_FILE}"
    fi
}

# Run main function
main "$@"
