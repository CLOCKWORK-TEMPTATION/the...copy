# Blue-Green Deployment Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and testing the Blue-Green deployment system for the theeeecopy project. The implementation ensures zero-downtime deployments with automatic rollback capabilities.

## Architecture Summary

```
Production Traffic
       ↓
   Load Balancer (Nginx)
       ↓
   Blue Environment (Active) ←→ Green Environment (Standby)
```

## Prerequisites

### System Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 20+ with npm/pnpm
- Nginx web server
- PostgreSQL database
- Redis server
- PM2 process manager
- Git

### Required Permissions
- Root access for system configuration
- SSH access to production server
- GitHub repository access for CI/CD

## Quick Start

### 1. Automated Setup (Recommended)

Run the automated setup script as root:

```bash
sudo bash scripts/setup-blue-green-deployment.sh
```

This script will:
- Install required dependencies
- Create system user and directories
- Configure Nginx load balancer
- Setup systemd services
- Configure firewall rules
- Create monitoring scripts

### 2. Manual Setup (Alternative)

If you prefer manual setup or need to customize the configuration, follow the steps below.

## Manual Setup Instructions

### Step 1: Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt install -y nginx postgresql redis-server git curl jq pm2

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Create System User

```bash
# Create dedicated user
sudo useradd -r -m -s /bin/bash theeeecopy
sudo usermod -a -G www-data theeeecopy
```

### Step 3: Configure Directory Structure

```bash
# Create directories
sudo mkdir -p /opt/theeeecopy/{logs,backups,scripts}
sudo mkdir -p /var/log/theeeecopy
sudo mkdir -p /var/www/theeeecopy

# Set permissions
sudo chown -R theeeecopy:www-data /opt/theeeecopy
sudo chown -R theeeecopy:www-data /var/log/theeeecopy
sudo chown -R theeeecopy:www-data /var/www/theeeecopy
```

### Step 4: Configure Nginx

Copy the provided Nginx configuration:

```bash
sudo cp .nginx/blue-green.conf /etc/nginx/sites-available/theeeecopy
sudo ln -sf /etc/nginx/sites-available/theeeecopy /etc/nginx/sites-enabled/theeeecopy

# Test configuration
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Setup Environment Files

Create environment configuration files:

```bash
# Copy and customize environment files
cp .env.blue /opt/theeeecopy/.env.blue
cp .env.green /opt/theeeecopy/.env.green

# Edit with your actual configuration
sudo nano /opt/theeeecopy/.env.blue
sudo nano /opt/theeeecopy/.env.green
```

### Step 6: Configure PM2

Create PM2 ecosystem configuration:

```bash
# Copy ecosystem configuration
cp ecosystem.config.js /opt/theeeecopy/

# Setup PM2 startup
sudo pm2 startup systemd -u theeeecopy --hp /home/theeeecopy
```

## Configuration

### Environment Variables

#### Blue Environment (.env.blue)
```bash
NODE_ENV=production
ENVIRONMENT=blue
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/theeeecopy_blue
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-secret-key-blue
GEMINI_API_KEY=your-gemini-key
SENTRY_DSN=your-sentry-dsn
```

#### Green Environment (.env.green)
```bash
NODE_ENV=production
ENVIRONMENT=green
PORT=3002
DATABASE_URL=postgresql://user:pass@localhost:5432/theeeecopy_green
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=your-secret-key-green
GEMINI_API_KEY=your-gemini-key
SENTRY_DSN=your-sentry-dsn
```

### Database Setup

Create separate databases for each environment:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

-- Create databases
CREATE DATABASE theeeecopy_blue;
CREATE DATABASE theeeecopy_green;

-- Create user
CREATE USER theeeecopy WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE theeeecopy_blue TO theeeecopy;
GRANT ALL PRIVILEGES ON DATABASE theeeecopy_green TO theeeecopy;
```

### Redis Setup

Configure Redis with separate databases:

```bash
# Redis configuration is already handled by environment variables
# Blue uses database 0, Green uses database 1
```

## Deployment Process

### Manual Deployment

```bash
# Deploy to production
sudo ./scripts/deploy/blue-green-deploy.sh deploy

# Check deployment status
sudo ./scripts/deploy/blue-green-deploy.sh status

# Manual rollback (if needed)
sudo ./scripts/deploy/blue-green-deploy.sh rollback
```

### Automated Deployment (CI/CD)

The GitHub Actions workflow automatically:
1. Runs tests on pull requests
2. Builds and deploys on main branch merges
3. Performs health checks
4. Switches traffic between environments
5. Sends notifications

## Health Checks and Monitoring

### Health Check Endpoints

- `/health` - Basic health status
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe
- `/health/startup` - Startup probe
- `/health/detailed` - Detailed health information

### Monitoring Scripts

```bash
# Check health status
./scripts/health-check.sh

# Run monitoring checks
./scripts/monitor.sh

# View logs
tail -f /var/log/theeeecopy/*.log
tail -f /var/log/nginx/theeeecopy_*.log
```

### Automated Monitoring

Cron jobs are configured for:
- Health checks every 5 minutes
- System monitoring every 10 minutes
- Log rotation daily

## Testing the Deployment

### 1. Initial Testing

```bash
# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:3002/health

# Test readiness
curl http://localhost:3001/health/ready
curl http://localhost:3002/health/ready

# Test through Nginx
curl http://localhost/health
```

### 2. Smoke Testing

```bash
# Run smoke tests on both environments
curl http://localhost:3001/health/detailed | jq .
curl http://localhost:3002/health/detailed | jq .

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
```

### 3. Load Testing

```bash
# Simple load test
for i in {1..100}; do
  curl -s http://localhost/health > /dev/null &
done
wait
```

### 4. Failover Testing

```bash
# Stop one environment and test failover
sudo pm2 stop blue
# Test that traffic still flows through green
curl http://localhost/health

# Restart and test again
sudo pm2 start blue
```

## Troubleshooting

### Common Issues

#### 1. Health Checks Failing

```bash
# Check service status
sudo pm2 status
sudo systemctl status theeeecopy-blue
sudo systemctl status theeeecopy-green

# Check logs
sudo pm2 logs
sudo journalctl -u theeeecopy-blue -f
sudo journalctl -u theeeecopy-green -f
```

#### 2. Nginx Configuration Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/theeeecopy_error.log
```

#### 3. Database Connection Issues

```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 4. Redis Connection Issues

```bash
# Test Redis connectivity
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Recovery Procedures

#### Automatic Rollback

The deployment script automatically rolls back if health checks fail:

```bash
# Check if rollback occurred
./scripts/deploy/blue-green-deploy.sh status
```

#### Manual Rollback

If automatic rollback fails:

```bash
# Switch traffic manually
sudo nginx -s reload

# Or use the rollback script
./scripts/deploy/blue-green-deploy.sh rollback
```

#### Emergency Procedures

In case of complete failure:

```bash
# Stop all services
sudo pm2 stop all
sudo systemctl stop nginx

# Check system resources
htop
df -h
free -h

# Restart services
sudo systemctl start nginx
sudo pm2 start all
```

## Security Considerations

### Network Security

- Firewall rules restrict access to internal ports
- Nginx handles SSL termination
- Rate limiting prevents abuse

### Application Security

- Environment variables store sensitive data
- JWT tokens for authentication
- Input validation and sanitization

### Monitoring Security

- Log sanitization prevents data leakage
- Secure communication between services
- Regular security updates

## Performance Optimization

### Nginx Tuning

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/nginx.conf

# Add performance settings
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
```

### PM2 Optimization

```bash
# Scale application instances
pm2 scale blue 4
pm2 scale green 4

# Monitor performance
pm2 monit
```

### Database Optimization

```bash
# PostgreSQL tuning
sudo nano /etc/postgresql/*/main/postgresql.conf

# Connection pooling
# Add connection pooler like PgBouncer
```

## Maintenance

### Regular Tasks

- Monitor logs for errors
- Update dependencies
- Review security settings
- Test backup procedures
- Performance optimization

### Updates and Patches

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js dependencies
pnpm update

# Restart services
pm2 restart all
```

### Backup Procedures

```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# Application backup
tar -czf app-backup.tar.gz /opt/theeeecopy

# Configuration backup
cp -r /etc/nginx/sites-available /backup/nginx/
```

## Support and Documentation

### Additional Resources

- [Deployment Strategy Documentation](DEPLOYMENT_STRATEGY.md)
- [GitHub Actions Workflow](../.github/workflows/blue-green-deployment.yml)
- [Health Check Controller](../../backend/src/controllers/health.controller.ts)

### Getting Help

1. Check logs first
2. Review this documentation
3. Check GitHub issues
4. Contact the development team

## Conclusion

This Blue-Green deployment system provides:
- Zero-downtime deployments
- Automatic rollback capabilities
- Comprehensive health monitoring
- Easy scaling and maintenance
- Robust error handling

Follow this guide carefully and test thoroughly before production use. Regular monitoring and maintenance will ensure reliable operation.