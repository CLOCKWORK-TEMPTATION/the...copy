#!/bin/bash

# ===========================================
# Performance Testing Script
# The Copy Application - Quick Performance Check
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TEST_ITERATIONS="${TEST_ITERATIONS:-5}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Performance Testing Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ===========================================
# 1. Check if services are running
# ===========================================
echo -e "${YELLOW}[1/6] Checking services...${NC}"

check_service() {
    local url=$1
    local name=$2

    if curl -s -o /dev/null -w "%{http_code}" "$url/api/health" | grep -q "200"; then
        echo -e "${GREEN}✓ $name is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not running at $url${NC}"
        return 1
    fi
}

if ! check_service "$BACKEND_URL" "Backend"; then
    echo -e "${RED}Please start the backend server first${NC}"
    exit 1
fi

echo ""

# ===========================================
# 2. Database Performance Test
# ===========================================
echo -e "${YELLOW}[2/6] Testing database performance...${NC}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL not set${NC}"
else
    echo -e "${GREEN}✓ DATABASE_URL is set${NC}"

    # Test simple query
    echo "Testing simple query..."
    psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT COUNT(*) FROM users;" 2>/dev/null || echo -e "${YELLOW}⚠ Could not connect to database${NC}"
fi

echo ""

# ===========================================
# 3. Redis Connection Test
# ===========================================
echo -e "${YELLOW}[3/6] Testing Redis connection...${NC}"

if [ -z "$REDIS_URL" ]; then
    echo -e "${YELLOW}⚠ REDIS_URL not set, using default${NC}"
    REDIS_URL="redis://localhost:6379"
fi

# Test Redis connection
if command -v redis-cli &> /dev/null; then
    redis-cli -u "$REDIS_URL" PING > /dev/null 2>&1 && echo -e "${GREEN}✓ Redis is responding${NC}" || echo -e "${RED}✗ Redis is not responding${NC}"
else
    echo -e "${YELLOW}⚠ redis-cli not installed, skipping Redis test${NC}"
fi

echo ""

# ===========================================
# 4. API Response Time Test
# ===========================================
echo -e "${YELLOW}[4/6] Testing API response times...${NC}"

test_endpoint() {
    local url=$1
    local name=$2
    local total_time=0

    echo "Testing: $name"

    for i in $(seq 1 $TEST_ITERATIONS); do
        time=$(curl -o /dev/null -s -w '%{time_total}' "$url")
        total_time=$(echo "$total_time + $time" | bc)
        echo -e "  Iteration $i: ${time}s"
    done

    avg_time=$(echo "scale=3; $total_time / $TEST_ITERATIONS" | bc)
    echo -e "${GREEN}  Average: ${avg_time}s${NC}"
    echo ""
}

# Test health endpoint
test_endpoint "$BACKEND_URL/api/health" "Health Check"

# Test metrics endpoint (if available)
test_endpoint "$BACKEND_URL/metrics" "Metrics Endpoint"

echo ""

# ===========================================
# 5. Frontend Performance Test
# ===========================================
echo -e "${YELLOW}[5/6] Testing frontend...${NC}"

if command -v lighthouse &> /dev/null; then
    echo "Running Lighthouse audit..."
    lighthouse "$FRONTEND_URL" \
        --only-categories=performance \
        --output=json \
        --output-path=./lighthouse-results.json \
        --chrome-flags="--headless" \
        --quiet

    if [ -f "./lighthouse-results.json" ]; then
        score=$(cat lighthouse-results.json | grep -o '"performance":[0-9.]*' | cut -d':' -f2)
        echo -e "${GREEN}✓ Performance Score: $score${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Lighthouse not installed${NC}"
    echo "Install with: npm install -g lighthouse"
fi

echo ""

# ===========================================
# 6. Bundle Size Check
# ===========================================
echo -e "${YELLOW}[6/6] Checking bundle size...${NC}"

if [ -d "frontend/.next" ]; then
    echo "Analyzing Next.js build..."

    # Find and report largest chunks
    echo "Largest JavaScript chunks:"
    find frontend/.next/static/chunks -name "*.js" -type f -exec du -h {} + | sort -rh | head -5

    # Total size
    total_size=$(du -sh frontend/.next | cut -f1)
    echo -e "${GREEN}Total .next directory size: $total_size${NC}"
else
    echo -e "${YELLOW}⚠ Frontend not built. Run 'cd frontend && pnpm build'${NC}"
fi

echo ""

# ===========================================
# Summary
# ===========================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Performance Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✓ Backend is responsive${NC}"
echo -e "  URL: $BACKEND_URL"
echo ""
echo -e "${YELLOW}📊 Recommendations:${NC}"
echo "  1. Run database indexes: cd backend && pnpm db:push"
echo "  2. Enable Redis caching for better performance"
echo "  3. Build frontend with: cd frontend && ANALYZE=true pnpm build"
echo "  4. Monitor with: $BACKEND_URL/admin/queues"
echo ""
echo -e "${BLUE}For detailed analysis, see:${NC}"
echo "  - backend/db-performance-analysis/"
echo "  - docs/performance-optimization/"
echo ""
echo -e "${GREEN}Test completed!${NC}"
