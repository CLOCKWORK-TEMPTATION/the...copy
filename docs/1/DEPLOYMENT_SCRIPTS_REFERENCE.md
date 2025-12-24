# 🚀 Deployment Scripts & Commands Reference

**The Copy - Drama Analysis Platform**

Quick reference guide for all deployment-related scripts and commands.

---

## Setup Scripts

### 1. Production Infrastructure Setup

**File**: `scripts/setup-production-infrastructure.sh`

**Purpose**: Complete server provisioning and infrastructure installation

**Usage**:
```bash
sudo bash scripts/setup-production-infrastructure.sh production yourdomain.com
```

**What it does**:
- Updates system packages
- Installs Node.js 20+
- Installs PostgreSQL 15
- Installs Redis
- Installs Nginx
- Installs PM2
- Installs Certbot
- Configures firewall (UFW)
- Creates application directories
- Sets up log rotation
- Configures fail2ban

**Prerequisites**:
- Ubuntu 20.04+ server
- Root or sudo access
- Internet connectivity

**Time**: ~30 minutes

---

### 2. SSL Certificate Setup

**File**: `scripts/setup-ssl-certificates.sh`

**Purpose**: Generate and configure SSL/TLS certificates with Let's Encrypt

**Usage**:
```bash
sudo bash scripts/setup-ssl-certificates.sh yourdomain.com admin@yourdomain.com
```

**What it does**:
- Creates DNS verification directory
- Requests certificates from Let's Encrypt
- Configures auto-renewal
- Sets up OCSP stapling
- Creates backup of certificates
- Generates SSL parameters file

**Prerequisites**:
- DNS pointing to server
- HTTP/HTTPS ports accessible
- Certbot installed (via setup script)

**Time**: ~5-10 minutes

---

## Deployment Scripts

### 3. Staging Deployment

**File**: `scripts/deploy-staging.sh`

**Purpose**: Deploy application to staging environment with full validation

**Usage**:
```bash
bash scripts/deploy-staging.sh
```

**What it does**:
1. Pre-deployment checks (git status, branch)
2. Build frontend and backend
3. Run type checking, linting, tests
4. Run database migrations
5. Deploy to staging directories
6. Start PM2 services
7. Health checks
8. Smoke tests
9. Generate deployment report

**Output**:
- Deployment logs in `/var/log/staging-deploy-*.log`
- Report file at `/var/log/staging-deploy-*.log.report`

**Time**: ~15-20 minutes

---

### 4. Production Deployment

**File**: `scripts/deploy-production.sh`

**Purpose**: Blue-green production deployment with traffic management

**Usage**:
```bash
bash scripts/deploy-production.sh blue  # Deploy to blue slot
bash scripts/deploy-production.sh green # Deploy to green slot
```

**What it does**:
1. Validates deployment parameters
2. Creates backup of current slot
3. Copies application files
4. Installs dependencies
5. Runs database migrations
6. Starts services with PM2
7. Runs health checks
8. Generates deployment report

**Environment**: Reads from `.env.blue` or `.env.green`

**Time**: ~10-15 minutes

---

### 5. Traffic Switch

**File**: `scripts/switch-traffic-to-green.sh` / `switch-traffic-to-blue.sh`

**Purpose**: Switch incoming traffic between blue and green slots

**Usage**:
```bash
sudo bash scripts/switch-traffic-to-green.sh
sudo bash scripts/switch-traffic-to-blue.sh
```

**What it does**:
1. Validates target slot is running
2. Runs health checks
3. Updates Nginx configuration
4. Reloads Nginx
5. Verifies traffic is routing correctly
6. Logs switch action

**Verification**:
```bash
curl -I https://yourdomain.com
# Check response headers for server info
```

**Time**: ~2-3 minutes

---

### 6. Rollback Script

**File**: `scripts/rollback-production.sh`

**Purpose**: Quickly rollback to previous deployment version

**Usage**:
```bash
bash scripts/rollback-production.sh blue
bash scripts/rollback-production.sh green
```

**What it does**:
1. Stops current services
2. Restores backup version
3. Runs database rollback (if applicable)
4. Starts services
5. Verifies health
6. Notifies team

**Backup Retention**: Last 5 deployments per slot

**Time**: ~5 minutes

---

## Database Scripts

### 7. Database Migration

**Command**:
```bash
cd backend
pnpm db:push
```

**Purpose**: Apply Drizzle ORM migrations to database

**Creates**:
- New tables and columns
- Indexes
- Constraints

**Safety**:
- Automatic backup created before migration
- Can be rolled back if needed

---

### 8. Database Backup

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Automated Backup** (via cron):
```bash
# Add to crontab (3 AM daily)
0 3 * * * pg_dump $DATABASE_URL > /opt/backups/db-$(date +\%Y\%m\%d).sql
```

**Restore**:
```bash
psql $DATABASE_URL < backup-20240101.sql
```

---

### 9. Database Studio (Drizzle)

**Usage**:
```bash
cd backend
pnpm db:studio
```

**Purpose**: Visual database explorer and editor

**Access**: http://localhost:5555 (local only)

---

## PM2 Commands

### Service Management

```bash
# Start services from ecosystem config
pm2 start ecosystem.config.js

# Start specific service
pm2 start theecopy-blue
pm2 start theecopy-green

# Stop services
pm2 stop theecopy-blue
pm2 stop all

# Restart services
pm2 restart theecopy-blue
pm2 restart all

# Delete service
pm2 delete theecopy-blue
pm2 delete all

# View status
pm2 status
pm2 monit

# View logs
pm2 logs theecopy-blue
pm2 logs --tail 100
pm2 logs --lines 200 --nostream

# Save PM2 process list
pm2 save

# Restore PM2 process list
pm2 resurrect

# Flush logs
pm2 flush

# Auto-start on reboot
pm2 startup
pm2 save
```

---

## Nginx Commands

### Configuration Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration (zero downtime)
sudo systemctl reload nginx

# Restart service
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# Enable auto-start
sudo systemctl enable nginx
```

### Log Monitoring

```bash
# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log

# View blue slot logs
tail -f /var/log/nginx/api-blue.log

# View green slot logs
tail -f /var/log/nginx/api-green.log

# Search logs
grep "error" /var/log/nginx/error.log
grep "500" /var/log/nginx/access.log
```

---

## Database Commands

### PostgreSQL Management

```bash
# Connect to database
psql -U theecopy_user -d theeeecopy_blue

# Connect from remote
psql "postgresql://user:password@host/database"

# List databases
psql -l

# List tables
\dt

# Describe table
\d table_name

# Execute SQL file
psql -f backup.sql

# Backup database
pg_dump database_name > backup.sql

# Restore database
psql database_name < backup.sql

# Check connections
psql -c "SELECT * FROM pg_stat_activity;"

# Terminate connection
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'database_name';"

# Analyze performance
psql -c "ANALYZE;"

# Vacuum database
psql -c "VACUUM FULL;"

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('database_name'));"
```

---

## Redis Commands

### Redis Management

```bash
# Connect to Redis
redis-cli -p 6379 -a password

# Test connection
redis-cli ping

# Get key
redis-cli GET key_name

# Set key
redis-cli SET key_name value

# Delete key
redis-cli DEL key_name

# Flush all data
redis-cli FLUSHALL

# Check memory
redis-cli INFO memory

# Monitor activity
redis-cli MONITOR

# Get stats
redis-cli INFO stats

# Persistence
redis-cli SAVE          # Synchronous save
redis-cli BGSAVE        # Background save
redis-cli LASTSAVE      # Last save time
```

---

## Health & Monitoring Commands

### Health Checks

```bash
# API health
curl https://yourdomain.com/health

# Readiness check
curl https://yourdomain.com/ready

# Liveness check
curl https://yourdomain.com/alive

# Database health
curl https://yourdomain.com/health/db

# Detailed health
curl -s https://yourdomain.com/health | jq
```

### System Monitoring

```bash
# Real-time monitoring
htop

# Disk usage
df -h

# Memory usage
free -h

# Network stats
netstat -tulpn

# Process info
ps aux | grep node

# System logs
journalctl -xe
journalctl -u theecopy.service -f

# Dmesg (kernel logs)
dmesg | tail -20
```

### Service Status

```bash
# PM2 status
pm2 status
pm2 describe theecopy-blue

# Nginx status
systemctl status nginx

# PostgreSQL status
systemctl status postgresql

# Redis status
systemctl status redis-server

# System status
systemctl status theecopy
```

---

## Certificate Management

```bash
# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# View certificate details
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# List all certificates
certbot certificates

# Force renewal
certbot renew --force-renewal

# Dry run renewal
certbot renew --dry-run

# Cleanup old certificates
certbot delete --cert-name yourdomain.com

# Test SSL
openssl s_client -connect yourdomain.com:443

# SSL Labs test
# Visit https://www.ssllabs.com/ssltest/?d=yourdomain.com
```

---

## Logging & Troubleshooting

### View Logs

```bash
# Application logs
pm2 logs theecopy-blue --tail 200

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx errors
tail -f /var/log/nginx/error.log

# System logs
journalctl -f

# Specific service
journalctl -u theecopy.service -f

# Last 1000 lines
tail -n 1000 /var/log/nginx/access.log

# Search logs
grep "ERROR" /var/log/theecopy/blue.log
grep "503" /var/log/nginx/access.log
```

### Debug Commands

```bash
# Port in use
lsof -i :3001
netstat -tulpn | grep 3001

# Environment variables
env | grep DATABASE

# File permissions
ls -la /opt/theecopy-blue

# Disk space
du -sh /opt/theecopy-blue
du -sh /var/log

# Network connectivity
curl -v https://yourdomain.com
ping 8.8.8.8
```

---

## Batch Operations

### Deploy Both Slots

```bash
#!/bin/bash
echo "Deploying to blue slot..."
bash scripts/deploy-production.sh blue

echo "Deploying to green slot..."
bash scripts/deploy-production.sh green

echo "Both slots deployed"
pm2 status
```

### Check All Services

```bash
#!/bin/bash
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx ==="
systemctl status nginx --no-pager

echo "=== PostgreSQL ==="
systemctl status postgresql --no-pager

echo "=== Redis ==="
systemctl status redis-server --no-pager

echo "=== Disk Usage ==="
df -h /opt

echo "=== Memory Usage ==="
free -h
```

### Monitor All Logs

```bash
#!/bin/bash
# Install tmux if needed
sudo apt-get install -y tmux

# Create tmux session
tmux new-session -d -s monitor

# Split windows and watch logs
tmux send-keys -t monitor "pm2 logs" Enter
tmux split-window -h
tmux send-keys -t monitor "tail -f /var/log/nginx/access.log" Enter
tmux split-window -h
tmux send-keys -t monitor "tail -f /var/log/nginx/error.log" Enter

# Attach to session
tmux attach-session -t monitor
```

---

## Emergency Commands

### Stop Everything

```bash
pm2 stop all
sudo systemctl stop nginx
sudo systemctl stop postgresql
sudo systemctl stop redis-server
```

### Start Everything

```bash
sudo systemctl start postgresql
sudo systemctl start redis-server
pm2 start ecosystem.config.js
sudo systemctl start nginx
```

### Force Restart

```bash
pm2 restart all --force
sudo systemctl restart nginx
```

### Check Everything

```bash
pm2 status
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
df -h
free -h
```

---

## Scheduled Tasks (Cron)

```bash
# Edit crontab
crontab -e

# Example scheduled tasks
0 2 * * * pg_dump $DATABASE_URL > /opt/backups/db-$(date +\%Y\%m\%d).sql
0 3 * * * pnpm run db:maintenance
0 4 * * * find /var/log -mtime +30 -delete
0 0 * * 0 certbot renew --quiet
```

---

## Quick Reference Summary

| Task | Command |
|------|---------|
| Setup infrastructure | `sudo bash setup-production-infrastructure.sh` |
| Setup SSL | `sudo bash setup-ssl-certificates.sh` |
| Deploy to staging | `bash deploy-staging.sh` |
| Deploy to production | `bash deploy-production.sh blue/green` |
| Switch traffic | `sudo bash switch-traffic-to-green.sh` |
| Check status | `pm2 status` |
| View logs | `pm2 logs theecopy-blue` |
| Test health | `curl https://yourdomain.com/health` |
| Database backup | `pg_dump $DATABASE_URL > backup.sql` |
| Certificate check | `certbot certificates` |

