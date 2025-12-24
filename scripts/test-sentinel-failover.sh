#!/bin/bash

echo "==================================="
echo "Redis Sentinel Failover Test"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Sentinel is running
echo -e "\n${YELLOW}1. Checking Sentinel status...${NC}"
SENTINEL_STATUS=$(redis-cli -p 26379 PING 2>/dev/null)
if [ "$SENTINEL_STATUS" != "PONG" ]; then
    echo -e "${RED}✗ Sentinel not running on port 26379${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Sentinel is running${NC}"

# Get current master
echo -e "\n${YELLOW}2. Getting current master...${NC}"
MASTER_INFO=$(redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster)
MASTER_HOST=$(echo "$MASTER_INFO" | head -n 1)
MASTER_PORT=$(echo "$MASTER_INFO" | tail -n 1)
echo -e "${GREEN}✓ Current master: ${MASTER_HOST}:${MASTER_PORT}${NC}"

# Set test value
echo -e "\n${YELLOW}3. Setting test value on master...${NC}"
redis-cli -h "$MASTER_HOST" -p "$MASTER_PORT" SET test:failover "before_failover" > /dev/null
echo -e "${GREEN}✓ Test value set${NC}"

# Simulate master failure
echo -e "\n${YELLOW}4. Simulating master failure (30 second sleep)...${NC}"
redis-cli -h "$MASTER_HOST" -p "$MASTER_PORT" DEBUG sleep 30 &
SLEEP_PID=$!

# Wait for failover detection
echo -e "${YELLOW}Waiting for Sentinel to detect failure (5 seconds)...${NC}"
sleep 6

# Check new master
echo -e "\n${YELLOW}5. Checking for new master...${NC}"
NEW_MASTER_INFO=$(redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster)
NEW_MASTER_HOST=$(echo "$NEW_MASTER_INFO" | head -n 1)
NEW_MASTER_PORT=$(echo "$NEW_MASTER_INFO" | tail -n 1)

if [ "$NEW_MASTER_HOST:$NEW_MASTER_PORT" != "$MASTER_HOST:$MASTER_PORT" ]; then
    echo -e "${GREEN}✓ Failover successful!${NC}"
    echo -e "${GREEN}  New master: ${NEW_MASTER_HOST}:${NEW_MASTER_PORT}${NC}"
else
    echo -e "${RED}✗ Failover did not occur${NC}"
    exit 1
fi

# Verify data persistence
echo -e "\n${YELLOW}6. Verifying data on new master...${NC}"
TEST_VALUE=$(redis-cli -h "$NEW_MASTER_HOST" -p "$NEW_MASTER_PORT" GET test:failover)
if [ "$TEST_VALUE" = "before_failover" ]; then
    echo -e "${GREEN}✓ Data persisted after failover${NC}"
else
    echo -e "${RED}✗ Data lost during failover${NC}"
    exit 1
fi

# Cleanup
redis-cli -h "$NEW_MASTER_HOST" -p "$NEW_MASTER_PORT" DEL test:failover > /dev/null

# Wait for old master to recover
echo -e "\n${YELLOW}7. Waiting for old master to recover...${NC}"
wait $SLEEP_PID 2>/dev/null

# Check if old master became replica
sleep 5
echo -e "\n${YELLOW}8. Checking old master status...${NC}"
REPLICAS=$(redis-cli -p 26379 SENTINEL replicas mymaster)
if echo "$REPLICAS" | grep -q "$MASTER_HOST"; then
    echo -e "${GREEN}✓ Old master rejoined as replica${NC}"
else
    echo -e "${YELLOW}⚠ Old master not yet rejoined (may take time)${NC}"
fi

echo -e "\n${GREEN}==================================="
echo -e "Failover test completed successfully!"
echo -e "===================================${NC}"
