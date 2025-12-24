#!/bin/bash

# =============================================================================
# Cleanup Test Databases Script
# =============================================================================
# This script cleans up test databases created during restore testing
#
# Usage: ./cleanup-test-dbs.sh
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
TEST_DB_SUFFIX="_test_restore"

# Logging functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment
load_env() {
    if [ -f "${SCRIPT_DIR}/../../backend/.env" ]; then
        set -a
        source "${SCRIPT_DIR}/../../backend/.env"
        set +a
    fi
}

# Cleanup PostgreSQL test databases
cleanup_postgresql() {
    log "Cleaning up PostgreSQL test databases..."

    if [ -z "${DATABASE_URL:-}" ]; then
        log_warning "DATABASE_URL not set. Skipping PostgreSQL cleanup."
        return 0
    fi

    # Extract database name
    DB_NAME=$(echo "${DATABASE_URL}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    TEST_DB_NAME="${DB_NAME}${TEST_DB_SUFFIX}"

    # Construct base URL
    BASE_URL=$(echo "${DATABASE_URL}" | sed 's/\/[^\/]*$//')

    log "Dropping test database: ${TEST_DB_NAME}"

    if psql "${BASE_URL}/postgres" -c "DROP DATABASE IF EXISTS ${TEST_DB_NAME};" 2>/dev/null; then
        log_success "PostgreSQL test database dropped"
    else
        log_warning "Failed to drop PostgreSQL test database (it may not exist)"
    fi
}

# Cleanup MongoDB test databases
cleanup_mongodb() {
    log "Cleaning up MongoDB test databases..."

    if [ -z "${MONGODB_URI:-}" ]; then
        log_warning "MONGODB_URI not set. Skipping MongoDB cleanup."
        return 0
    fi

    # Extract database name
    MONGO_DB=$(echo "${MONGODB_URI}" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    TEST_MONGO_DB="${MONGO_DB}${TEST_DB_SUFFIX}"

    # Construct test URI
    TEST_MONGO_URI=$(echo "${MONGODB_URI}" | sed "s/${MONGO_DB}/${TEST_MONGO_DB}/")

    log "Dropping test database: ${TEST_MONGO_DB}"

    if command -v mongosh &> /dev/null; then
        if mongosh "${TEST_MONGO_URI}" --eval "db.dropDatabase()" 2>/dev/null; then
            log_success "MongoDB test database dropped"
        else
            log_warning "Failed to drop MongoDB test database (it may not exist)"
        fi
    else
        log_warning "mongosh not found. Skipping MongoDB cleanup."
    fi
}

# Cleanup backup files
cleanup_backups() {
    log "Cleaning up old backup files..."

    LOG_DIR="${SCRIPT_DIR}/logs"

    if [ -d "${LOG_DIR}" ]; then
        # Find backup files older than 7 days
        find "${LOG_DIR}" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
        find "${LOG_DIR}" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
        find "${LOG_DIR}" -type d -name "mongodb_backup_*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true

        log_success "Old backup files cleaned up"
    fi
}

# Main execution
main() {
    log "========================================="
    log "Test Database Cleanup"
    log "========================================="

    load_env

    cleanup_postgresql
    cleanup_mongodb
    cleanup_backups

    log "========================================="
    log_success "Cleanup completed!"
    log "========================================="
}

main "$@"
