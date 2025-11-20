# Redis on Windows - Setup Guide

## Overview

This application uses BullMQ for background job processing, which requires **Redis version 5.0.0 or higher**. Unfortunately, the official Redis port for Windows (version 3.0.504) is outdated and not compatible with BullMQ.

## The Problem

When running this application with Redis 3.0.504 on Windows, you'll see errors like:

```
[Worker:ai-analysis] Error: Error: Redis version needs to be greater or equal than 5.0.0 Current: 3.0.504
```

**The application will continue to work**, but the queue system (background jobs) will be disabled. This means:
- AI analysis jobs won't run in the background
- Document processing jobs won't be queued
- Cache warming jobs won't execute

## Solutions for Windows Users

### Option 1: WSL2 with Redis (Recommended)

The best solution for Windows developers is to use Windows Subsystem for Linux 2 (WSL2):

1. **Enable WSL2:**
   ```powershell
   wsl --install
   ```

2. **Install Ubuntu from Microsoft Store**

3. **Install Redis in Ubuntu:**
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

4. **Verify Redis version:**
   ```bash
   redis-cli INFO | grep redis_version
   # Should show 5.0.0 or higher
   ```

5. **Update your `.env` file:**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Option 2: Memurai (Commercial Solution)

[Memurai](https://www.memurai.com/) is a commercial Redis-compatible solution for Windows that supports modern Redis versions.

1. Download Memurai Developer Edition (free for development)
2. Install and start the service
3. Update your `.env` file with Memurai connection details

### Option 3: Cloud Redis Services

Use a managed Redis service:

- **Redis Cloud** (free tier available): https://redis.com/try-free/
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**

Update your `.env` file:
```env
REDIS_URL=redis://:password@your-redis-instance:6379
```

### Option 4: Docker (Alternative)

Run Redis in a Docker container:

1. **Install Docker Desktop for Windows**

2. **Run Redis container:**
   ```bash
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

3. **Update your `.env` file:**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## Graceful Degradation

The application now includes **automatic version detection**:

- ✅ If Redis >= 5.0.0 is detected: Queue system is enabled
- ⚠️ If Redis < 5.0.0 is detected: Queue system is disabled, application continues to work

When the queue system is disabled, you'll see a warning message:

```
⚠️  REDIS VERSION INCOMPATIBILITY DETECTED ⚠️
   Current Redis version: 3.0.504
   Required minimum version: 5.0.0

   The queue system (BullMQ) has been disabled.
   Background jobs will not be processed.

   To enable the queue system:
   - Upgrade Redis to version 5.0.0 or higher
   - On Windows: Use WSL2 with Redis or Memurai
   - Or use a cloud Redis service
```

## Configuration

The application supports two ways to configure Redis:

### Method 1: Individual Variables
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # Optional
```

### Method 2: Connection URL
```env
REDIS_URL=redis://:password@hostname:6379
```

## Verifying Your Setup

After setting up Redis, restart your application and check the logs:

✅ **Success (Redis >= 5.0.0):**
```
[QueueSystem] Redis version 7.2.0 is compatible with BullMQ
[QueueSystem] All workers initialized
```

⚠️ **Incompatible version:**
```
[QueueSystem] Redis version 3.0.504 is not compatible with BullMQ
Queue system will be disabled
```

## Troubleshooting

### Connection Issues

If you see connection timeout errors:
```
Redis version check failed: Connection terminated due to connection timeout
```

Check:
1. Redis is running: `redis-cli ping` (should return `PONG`)
2. Firewall isn't blocking port 6379
3. `REDIS_HOST` and `REDIS_PORT` are correct in `.env`

### Permission Issues

If Redis won't start on WSL2:
```bash
sudo chown redis:redis /var/lib/redis
sudo service redis-server restart
```

## Additional Resources

- [Redis Official Documentation](https://redis.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [WSL2 Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Memurai for Windows](https://www.memurai.com/)

## Questions?

If you encounter issues not covered in this guide, please:
1. Check the application logs for specific error messages
2. Verify your Redis version: `redis-cli INFO | grep redis_version`
3. Test Redis connection: `redis-cli ping`
