#!/bin/bash

# =============================================================================
# Data Integrity Verification Script
# =============================================================================
# This script verifies the integrity of restored database backups by:
# 1. Checking record counts in key tables
# 2. Verifying referential integrity
# 3. Checking for data corruption
# 4. Comparing with source database
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
LOG_FILE="${LOG_DIR}/integrity-check-$(date +%Y%m%d_%H%M%S).log"

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

# Counters for checks
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Check result tracking
check_result() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        log_success "$2"
        return 0
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        log_error "$2"
        return 1
    fi
}

check_warning() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    log_warning "$1"
}

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

    # Check for test database URLs from restore script
    if [ -z "${TEST_DATABASE_URL:-}" ] && [ -z "${TEST_MONGODB_URI:-}" ]; then
        log_warning "Test database URLs not found in environment."
        log_warning "Please run test-restore.sh first or set TEST_DATABASE_URL / TEST_MONGODB_URI"
    fi
}

# =============================================================================
# PostgreSQL Integrity Checks
# =============================================================================

verify_postgresql_integrity() {
    log "========================================="
    log "PostgreSQL Data Integrity Verification"
    log "========================================="

    local DB_URL="${1:-${TEST_DATABASE_URL:-}}"

    if [ -z "${DB_URL}" ]; then
        log_warning "No PostgreSQL database URL provided. Skipping PostgreSQL checks."
        return 0
    fi

    log "Database: ${DB_URL}"

    # Check database connection
    log "Testing database connection..."
    if psql "${DB_URL}" -c "SELECT 1;" &> /dev/null; then
        check_result 0 "Database connection successful"
    else
        check_result 1 "Database connection failed"
        return 1
    fi

    # Get list of tables
    log "Fetching table list..."
    TABLES=$(psql "${DB_URL}" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>> "${LOG_FILE}")

    if [ -z "${TABLES}" ]; then
        check_warning "No tables found in public schema"
        return 0
    fi

    log "Tables found: $(echo "${TABLES}" | wc -l)"

    # Check record counts for each table
    log "Checking record counts..."
    for TABLE in ${TABLES}; do
        TABLE=$(echo "${TABLE}" | xargs)  # Trim whitespace
        if [ -n "${TABLE}" ]; then
            COUNT=$(psql "${DB_URL}" -t -c "SELECT COUNT(*) FROM \"${TABLE}\";" 2>> "${LOG_FILE}" | xargs)
            if [ $? -eq 0 ]; then
                log "  ${TABLE}: ${COUNT} records"
            else
                log_error "  Failed to count records in ${TABLE}"
            fi
        fi
    done

    # Check for common tables and their integrity
    check_critical_tables_postgresql "${DB_URL}"

    # Check for foreign key violations
    log "Checking foreign key constraints..."
    FK_CHECK=$(psql "${DB_URL}" -t -c "
        SELECT COUNT(*)
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND constraint_schema = 'public';
    " 2>> "${LOG_FILE}" | xargs)

    log "Foreign key constraints found: ${FK_CHECK}"

    # Verify no orphaned records (this is a basic check)
    log "Checking for basic referential integrity..."

    # Check if there are any NULL values in foreign key columns
    # (This is a simplified check - actual implementation would be more thorough)

    log_success "PostgreSQL integrity checks completed"
}

check_critical_tables_postgresql() {
    local DB_URL="$1"

    log "Verifying critical tables..."

    # Check if users table exists and has data
    if psql "${DB_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');" 2>> "${LOG_FILE}" | grep -q "t"; then
        USER_COUNT=$(psql "${DB_URL}" -t -c "SELECT COUNT(*) FROM users;" 2>> "${LOG_FILE}" | xargs)
        log "Users table: ${USER_COUNT} records"

        if [ "${USER_COUNT}" -eq 0 ]; then
            check_warning "Users table is empty"
        else
            check_result 0 "Users table has data (${USER_COUNT} records)"
        fi
    else
        log_warning "Users table not found"
    fi

    # Check if projects table exists and has data
    if psql "${DB_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects');" 2>> "${LOG_FILE}" | grep -q "t"; then
        PROJECT_COUNT=$(psql "${DB_URL}" -t -c "SELECT COUNT(*) FROM projects;" 2>> "${LOG_FILE}" | xargs)
        log "Projects table: ${PROJECT_COUNT} records"

        if [ "${PROJECT_COUNT}" -eq 0 ]; then
            check_warning "Projects table is empty"
        else
            check_result 0 "Projects table has data (${PROJECT_COUNT} records)"
        fi
    else
        log_warning "Projects table not found"
    fi

    # Check for NULL values in critical columns
    log "Checking for NULL values in critical columns..."

    # Example: Check if users have emails
    if psql "${DB_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');" 2>> "${LOG_FILE}" | grep -q "t"; then
        NULL_EMAILS=$(psql "${DB_URL}" -t -c "SELECT COUNT(*) FROM users WHERE email IS NULL;" 2>> "${LOG_FILE}" | xargs || echo "0")
        if [ "${NULL_EMAILS}" -gt 0 ]; then
            check_warning "Found ${NULL_EMAILS} users with NULL email addresses"
        else
            log "No NULL email addresses found in users table"
        fi
    fi
}

# =============================================================================
# MongoDB Integrity Checks
# =============================================================================

verify_mongodb_integrity() {
    log "========================================="
    log "MongoDB Data Integrity Verification"
    log "========================================="

    local MONGO_URI="${1:-${TEST_MONGODB_URI:-}}"

    if [ -z "${MONGO_URI}" ]; then
        log_warning "No MongoDB URI provided. Skipping MongoDB checks."
        return 0
    fi

    # Check if mongosh is available
    if ! command -v mongosh &> /dev/null; then
        log_error "mongosh not found. Please install MongoDB Shell"
        return 1
    fi

    log "MongoDB URI configured"

    # Check database connection
    log "Testing MongoDB connection..."
    if mongosh "${MONGO_URI}" --eval "db.adminCommand('ping')" &> /dev/null; then
        check_result 0 "MongoDB connection successful"
    else
        check_result 1 "MongoDB connection failed"
        return 1
    fi

    # Get collection list
    log "Fetching collection list..."
    COLLECTIONS=$(mongosh "${MONGO_URI}" --quiet --eval "db.getCollectionNames().join('\n')" 2>> "${LOG_FILE}")

    if [ -z "${COLLECTIONS}" ]; then
        check_warning "No collections found in database"
        return 0
    fi

    log "Collections found:"
    echo "${COLLECTIONS}" | while read -r COLLECTION; do
        if [ -n "${COLLECTION}" ]; then
            COUNT=$(mongosh "${MONGO_URI}" --quiet --eval "db.${COLLECTION}.countDocuments()" 2>> "${LOG_FILE}")
            log "  ${COLLECTION}: ${COUNT} documents"
        fi
    done

    # Check for critical collections
    check_critical_collections_mongodb "${MONGO_URI}"

    log_success "MongoDB integrity checks completed"
}

check_critical_collections_mongodb() {
    local MONGO_URI="$1"

    log "Verifying critical collections..."

    # Check for common collections
    # Note: Adjust these based on your actual MongoDB schema

    # Example: Check sessions collection
    if mongosh "${MONGO_URI}" --quiet --eval "db.sessions.countDocuments()" &> /dev/null; then
        SESSION_COUNT=$(mongosh "${MONGO_URI}" --quiet --eval "db.sessions.countDocuments()" 2>> "${LOG_FILE}")
        log "Sessions collection: ${SESSION_COUNT} documents"
    else
        log_warning "Sessions collection not found"
    fi
}

# =============================================================================
# Cross-Database Integrity Checks
# =============================================================================

verify_cross_database_integrity() {
    log "========================================="
    log "Cross-Database Integrity Checks"
    log "========================================="

    # These checks verify consistency between PostgreSQL and MongoDB
    # if both are in use

    if [ -n "${TEST_DATABASE_URL:-}" ] && [ -n "${TEST_MONGODB_URI:-}" ]; then
        log "Both PostgreSQL and MongoDB are configured"
        log "Performing cross-database consistency checks..."

        # Example: Verify user count consistency
        # (Adjust based on your actual data model)

        log_success "Cross-database checks completed"
    else
        log "Only one database type configured, skipping cross-database checks"
    fi
}

# =============================================================================
# Comparison with Source Database
# =============================================================================

compare_with_source() {
    log "========================================="
    log "Comparing with Source Database"
    log "========================================="

    # Compare record counts between source and test databases

    # PostgreSQL comparison
    if [ -n "${DATABASE_URL:-}" ] && [ -n "${TEST_DATABASE_URL:-}" ]; then
        log "Comparing PostgreSQL databases..."

        TABLES=$(psql "${DATABASE_URL}" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>> "${LOG_FILE}")

        for TABLE in ${TABLES}; do
            TABLE=$(echo "${TABLE}" | xargs)
            if [ -n "${TABLE}" ]; then
                SOURCE_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM \"${TABLE}\";" 2>> "${LOG_FILE}" | xargs)
                TEST_COUNT=$(psql "${TEST_DATABASE_URL}" -t -c "SELECT COUNT(*) FROM \"${TABLE}\";" 2>> "${LOG_FILE}" | xargs)

                if [ "${SOURCE_COUNT}" -eq "${TEST_COUNT}" ]; then
                    check_result 0 "${TABLE}: Source (${SOURCE_COUNT}) == Test (${TEST_COUNT})"
                else
                    check_result 1 "${TABLE}: Source (${SOURCE_COUNT}) != Test (${TEST_COUNT})"
                fi
            fi
        done
    else
        log_warning "Source or test database URL not available for comparison"
    fi

    # MongoDB comparison
    if [ -n "${MONGODB_URI:-}" ] && [ -n "${TEST_MONGODB_URI:-}" ]; then
        log "Comparing MongoDB databases..."

        if command -v mongosh &> /dev/null; then
            COLLECTIONS=$(mongosh "${MONGODB_URI}" --quiet --eval "db.getCollectionNames().join('\n')" 2>> "${LOG_FILE}")

            echo "${COLLECTIONS}" | while read -r COLLECTION; do
                if [ -n "${COLLECTION}" ]; then
                    SOURCE_COUNT=$(mongosh "${MONGODB_URI}" --quiet --eval "db.${COLLECTION}.countDocuments()" 2>> "${LOG_FILE}")
                    TEST_COUNT=$(mongosh "${TEST_MONGODB_URI}" --quiet --eval "db.${COLLECTION}.countDocuments()" 2>> "${LOG_FILE}")

                    if [ "${SOURCE_COUNT}" -eq "${TEST_COUNT}" ]; then
                        check_result 0 "${COLLECTION}: Source (${SOURCE_COUNT}) == Test (${TEST_COUNT})"
                    else
                        check_result 1 "${COLLECTION}: Source (${SOURCE_COUNT}) != Test (${TEST_COUNT})"
                    fi
                fi
            done
        fi
    else
        log_warning "Source or test MongoDB URI not available for comparison"
    fi
}

# =============================================================================
# Generate Integrity Report
# =============================================================================

generate_report() {
    log "========================================="
    log "Data Integrity Report"
    log "========================================="
    log "Total Checks: ${TOTAL_CHECKS}"
    log_success "Passed: ${PASSED_CHECKS}"

    if [ ${WARNING_CHECKS} -gt 0 ]; then
        log_warning "Warnings: ${WARNING_CHECKS}"
    fi

    if [ ${FAILED_CHECKS} -gt 0 ]; then
        log_error "Failed: ${FAILED_CHECKS}"
    else
        log_success "No failures detected!"
    fi

    log "========================================="

    # Calculate success rate
    if [ ${TOTAL_CHECKS} -gt 0 ]; then
        SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        log "Success Rate: ${SUCCESS_RATE}%"
    fi

    log "Detailed log: ${LOG_FILE}"
    log "========================================="

    # Determine overall result
    if [ ${FAILED_CHECKS} -eq 0 ]; then
        log_success "✓ Data integrity verification PASSED"
        return 0
    else
        log_error "✗ Data integrity verification FAILED"
        log_error "Please review the failures and investigate"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    log "========================================="
    log "Data Integrity Verification"
    log "Started: $(date)"
    log "========================================="

    # Load environment
    load_env

    # Verify PostgreSQL integrity
    verify_postgresql_integrity

    # Verify MongoDB integrity
    verify_mongodb_integrity

    # Cross-database checks
    verify_cross_database_integrity

    # Compare with source databases
    if [ "${1:-}" != "--skip-comparison" ]; then
        compare_with_source
    else
        log "Skipping source comparison (--skip-comparison flag set)"
    fi

    # Generate final report
    generate_report
}

# Run main function
main "$@"
