# Redis Sentinel Setup - High Availability

## Overview
Redis Sentinel provides high availability for Redis through automatic failover. When the master fails, Sentinel automatically promotes a replica to master.

## Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sentinel   │     │  Sentinel   │     │  Sentinel   │
│   :26379    │────▶│   :26380    │────▶│   :26381    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Master    │
                    │   :6379     │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │   Replica   │          │   Replica   │
       │   :6380     │          │   :6381     │
       └─────────────┘          └─────────────┘
```

## Configuration

### 1. Sentinel Configuration Files
Three Sentinel instances are configured:
- `sentinel-26379.conf` - Port 26379
- `sentinel-26380.conf` - Port 26380
- `sentinel-26381.conf` - Port 26381

### 2. Key Settings
- **Quorum**: 2 (minimum Sentinels to agree on master failure)
- **Down-after-milliseconds**: 5000 (5 seconds to detect failure)
- **Failover-timeout**: 10000 (10 seconds for failover)
- **Parallel-syncs**: 1 (replicas to sync simultaneously)

## Quick Start

### Windows
```bash
# Start Sentinel cluster
cd redis
start-sentinel.bat
```

### Linux/macOS
```bash
# Start each Sentinel
redis-server sentinel-26379.conf --sentinel &
redis-server sentinel-26380.conf --sentinel &
redis-server sentinel-26381.conf --sentinel &
```

## Application Configuration

### Enable Sentinel in Backend
Update `backend/.env`:
```env
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINELS=127.0.0.1:26379,127.0.0.1:26380,127.0.0.1:26381
REDIS_MASTER_NAME=mymaster
REDIS_PASSWORD=your_password_here
```

### Disable Sentinel (Standard Redis)
```env
REDIS_SENTINEL_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Monitoring

### Check Sentinel Status
```bash
redis-cli -p 26379 sentinel masters
redis-cli -p 26379 sentinel replicas mymaster
redis-cli -p 26379 sentinel sentinels mymaster
```

### Monitor Failover Events
```bash
redis-cli -p 26379 PSUBSCRIBE '*'
```

## Testing Failover

### 1. Simulate Master Failure
```bash
# Stop master Redis
redis-cli -p 6379 DEBUG sleep 30
# or
redis-cli -p 6379 SHUTDOWN
```

### 2. Observe Automatic Failover
- Sentinels detect master down (5 seconds)
- Quorum reached (2 Sentinels agree)
- New master elected from replicas
- Application automatically reconnects

### 3. Verify New Master
```bash
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
```

## Production Deployment

### Multi-Server Setup
Deploy Sentinels on separate servers:
```env
REDIS_SENTINELS=sentinel1.example.com:26379,sentinel2.example.com:26379,sentinel3.example.com:26379
```

### Security
1. Enable authentication:
```conf
# In sentinel.conf
sentinel auth-pass mymaster your_redis_password
requirepass your_sentinel_password
```

2. Update application:
```env
REDIS_PASSWORD=your_redis_password
REDIS_SENTINEL_PASSWORD=your_sentinel_password
```

### Firewall Rules
- Allow Sentinel ports: 26379, 26380, 26381
- Allow Redis ports: 6379, 6380, 6381
- Restrict to trusted IPs only

## Troubleshooting

### Sentinel Not Starting
```bash
# Check logs
tail -f /var/log/redis/sentinel.log

# Verify configuration
redis-server sentinel-26379.conf --sentinel --test-memory 1
```

### Failover Not Working
1. Check quorum setting (must be > total_sentinels/2)
2. Verify network connectivity between Sentinels
3. Ensure replicas are properly configured
4. Check Sentinel logs for errors

### Application Connection Issues
```bash
# Test Sentinel connectivity
redis-cli -p 26379 PING

# Check master address
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
```

## Performance Considerations

### Sentinel Overhead
- Minimal CPU/memory usage
- Network overhead: ~1KB/s per Sentinel
- Failover time: 5-15 seconds typical

### Optimization
- Place Sentinels on different availability zones
- Use odd number of Sentinels (3, 5, 7)
- Monitor Sentinel health with Prometheus

## Metrics & Monitoring

### Key Metrics
- Master uptime
- Failover count
- Sentinel agreement time
- Replica lag

### Integration with Monitoring
```typescript
// Backend automatically tracks:
- Redis connection health
- Failover events
- Connection pool status
- Cache hit/miss rates
```

## Backup & Recovery

### Sentinel State
Sentinel automatically updates configuration files with:
- Current master address
- Known replicas
- Failover history

### Manual Recovery
```bash
# Reset Sentinel state
redis-cli -p 26379 SENTINEL RESET mymaster

# Force failover
redis-cli -p 26379 SENTINEL FAILOVER mymaster
```

## References
- [Redis Sentinel Documentation](https://redis.io/docs/management/sentinel/)
- [High Availability Guide](https://redis.io/docs/management/sentinel/#high-availability)
- [Sentinel Commands](https://redis.io/commands/?group=sentinel)
