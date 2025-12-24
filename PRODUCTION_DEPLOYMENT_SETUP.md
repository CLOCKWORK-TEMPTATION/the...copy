# 🚀 Production Deployment Setup Guide

**The Copy - Drama Analysis Platform**

Complete guide for configuring production environment with blue-green deployment strategy.

---

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Infrastructure Setup](#infrastructure-setup)
3. [SSL/TLS Configuration](#ssltls-configuration)
4. [Staging Deployment](#staging-deployment)
5. [Monitoring & Alerting](#monitoring--alerting)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)

---

## Environment Configuration

### 1. Update .env.blue (Primary Slot)

Location: `/.env.blue`

```bash
# ==========================================
# Production Blue Environment
# ==========================================
NODE_ENV=production
ENVIRONMENT=blue
PORT=3001
APP_NAME=theeeecopy-blue

# ==========================================
# Database Configuration (PostgreSQL/Neon)
# ==========================================
DATABASE_URL=postgresql://username:password@prod-blue.neon.tech:5432/theeeecopy_blue?sslmode=require
POSTGRES_HOST=prod-blue.neon.tech
POSTGRES_PORT=5432
POSTGRES_USER=username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=theeeecopy_blue

# ==========================================
# Redis Configuration (Production)
# ==========================================
REDIS_URL=redis://:redis_password@redis-prod.example.com:6379/0
REDIS_HOST=redis-prod.example.com
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_DB=0
REDIS_POOL_MIN=5
REDIS_POOL_MAX=20

# ==========================================
# API & Domain Configuration
# ==========================================
NEXT_PUBLIC_API_URL=https://api-blue.yourdomain.com
BACKEND_URL=https://api-blue.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
API_TIMEOUT_MS=30000

# ==========================================
# Authentication & JWT
# ==========================================
JWT_SECRET=your_highly_secure_jwt_secret_min_32_characters_long
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_highly_secure_session_secret
SESSION_TIMEOUT=1800000

# ==========================================
# Google Generative AI (Gemini)
# ==========================================
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TIMEOUT_MS=30000

# ==========================================
# Sentry Error Tracking & Performance
# ==========================================
SENTRY_DSN=https://your_public_key@your_sentry_id.ingest.sentry.io/your_project_id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=the-copy-blue
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ENVIRONMENT=production-blue
SENTRY_RELEASE=1.0.0
SENTRY_TRACING_ENABLED=true
SENTRY_SAMPLE_RATE=0.1
SENTRY_PROFILER_SAMPLE_RATE=0.1

# ==========================================
# Logging Configuration
# ==========================================
LOG_LEVEL=info
LOG_FILE=/var/log/theeeecopy/blue.log
LOG_MAX_SIZE=10M
LOG_MAX_FILES=14
LOG_FORMAT=json

# ==========================================
# Rate Limiting & Security
# ==========================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_KEY_PREFIX=rl:
CORS_CREDENTIALS=true
CORS_ALLOW_HEADERS=Content-Type,Authorization
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS

# ==========================================
# Health Check & Performance
# ==========================================
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
MEMORY_LIMIT_MB=1024
CPU_LIMIT_CORES=2
ENABLE_PROFILING=false

# ==========================================
# PM2 Process Management
# ==========================================
PM2_INSTANCES=auto
PM2_EXEC_MODE=cluster
PM2_MERGE_LOGS=true
PM2_NODE_ARGS=--max-old-space-size=1024

# ==========================================
# SSL/TLS Configuration
# ==========================================
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/blue.crt
SSL_KEY_PATH=/etc/ssl/private/blue.key
SSL_CHAIN_PATH=/etc/ssl/certs/blue.chain

# ==========================================
# Email & Notifications
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
SEND_GRID_API_KEY=your_sendgrid_api_key

# ==========================================
# Deployment & Version Control
# ==========================================
DEPLOYMENT_SLOT=blue
DEPLOYMENT_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_COMMIT=$(git rev-parse HEAD)
BUILD_NUMBER=1
```

### 2. Update .env.green (Standby Slot)

Create a copy of `.env.blue` and update:

```bash
ENVIRONMENT=green
PORT=3002
APP_NAME=theeeecopy-green
DATABASE_URL=postgresql://username:password@prod-green.neon.tech:5432/theeeecopy_green?sslmode=require
POSTGRES_DB=theeeecopy_green
REDIS_URL=redis://:redis_password@redis-prod.example.com:6379/1
REDIS_DB=1
NEXT_PUBLIC_API_URL=https://api-green.yourdomain.com
BACKEND_URL=https://api-green.yourdomain.com
SENTRY_PROJECT=the-copy-green
SENTRY_ENVIRONMENT=production-green
LOG_FILE=/var/log/theeeecopy/green.log
SSL_CERT_PATH=/etc/ssl/certs/green.crt
SSL_KEY_PATH=/etc/ssl/private/green.key
SSL_CHAIN_PATH=/etc/ssl/certs/green.chain
DEPLOYMENT_SLOT=green
```

### 3. Frontend Environment (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=https://your_public_key@your_sentry_id.ingest.sentry.io/your_project_id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your_google_analytics_id
```

---

## Infrastructure Setup

### Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Root or sudo access
- Domain name with DNS control
- SSL certificates (Let's Encrypt recommended)

### 1. Server Preparation

```bash
#!/bin/bash
# update-system.sh - Initial server setup

set -e

echo "🔄 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  python3 \
  python3-pip \
  vim \
  htop \
  net-tools

echo "📦 Installing Node.js 20+"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "📦 Installing pnpm"
sudo npm install -g pnpm@10.20.0

echo "✅ System preparation completed"
```

### 2. PostgreSQL Installation

```bash
#!/bin/bash
# install-postgresql.sh

set -e

echo "📦 Installing PostgreSQL 15..."
sudo apt-get install -y postgresql postgresql-contrib

echo "🔐 Configuring PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create databases for blue-green deployment
sudo -u postgres psql <<EOF
  CREATE DATABASE theeeecopy_blue;
  CREATE DATABASE theeeecopy_green;
  CREATE USER theecopy_user WITH PASSWORD 'secure_password_here';
  ALTER ROLE theecopy_user SET client_encoding TO 'utf8';
  ALTER ROLE theecopy_user SET default_transaction_isolation TO 'read committed';
  ALTER ROLE theecopy_user SET default_transaction_deferrable TO on;
  ALTER ROLE theecopy_user SET default_transaction_isolation TO 'read committed';
  GRANT ALL PRIVILEGES ON DATABASE theeeecopy_blue TO theecopy_user;
  GRANT ALL PRIVILEGES ON DATABASE theeeecopy_green TO theecopy_user;
EOF

echo "✅ PostgreSQL installation completed"
```

### 3. Redis Installation

```bash
#!/bin/bash
# install-redis.sh

set -e

echo "📦 Installing Redis..."
sudo apt-get install -y redis-server

echo "🔐 Securing Redis..."
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.bak

# Set Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "Redis password: $REDIS_PASSWORD"

sudo tee -a /etc/redis/redis.conf > /dev/null <<EOF
requirepass $REDIS_PASSWORD
maxmemory 2gb
maxmemory-policy allkeys-lru
timeout 300
tcp-keepalive 300
EOF

echo "🔄 Restarting Redis..."
sudo systemctl restart redis-server
sudo systemctl enable redis-server

echo "✅ Redis installation completed"
```

### 4. Nginx Installation & Configuration

```bash
#!/bin/bash
# install-nginx.sh

set -e

echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

echo "🔧 Creating Nginx configuration..."
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

echo "✅ Nginx installation completed"
```

---

## SSL/TLS Configuration

### Let's Encrypt Setup

```bash
#!/bin/bash
# setup-ssl.sh

set -e

DOMAIN="yourdomain.com"
DOMAIN_BLUE="api-blue.$DOMAIN"
DOMAIN_GREEN="api-green.$DOMAIN"

echo "🔒 Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

echo "🔐 Generating SSL certificates..."
# Create certificate for main domain
sudo certbot certonly \
  --nginx \
  --non-interactive \
  --agree-tos \
  --email admin@yourdomain.com \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "$DOMAIN_BLUE" \
  -d "$DOMAIN_GREEN"

echo "📋 Setting up auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ SSL setup completed"
```

### Nginx Configuration

Create `/etc/nginx/sites-available/theecopy`:

```nginx
# ========================================
# Nginx Configuration - The Copy Deployment
# ========================================

# Upstream definitions for blue-green deployment
upstream theecopy_blue {
    server 127.0.0.1:3001;
    server 127.0.0.1:3001;  # Second instance for load balancing
}

upstream theecopy_green {
    server 127.0.0.1:3002;
    server 127.0.0.1:3002;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com api-blue.yourdomain.com api-green.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Main HTTPS server (Blue slot active)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/atom+xml image/svg+xml;
    gzip_vary on;
    gzip_comp_level 6;
    
    # Rate limiting
    limit_req zone=general_limit burst=20 nodelay;
    
    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}

# Blue API server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api-blue.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    access_log /var/log/nginx/api-blue.log combined;
    error_log /var/log/nginx/api-blue-error.log warn;
    
    gzip on;
    gzip_types application/json text/plain;
    
    limit_req zone=api_limit burst=50 nodelay;
    
    # Health check endpoint
    location /health {
        proxy_pass http://theecopy_blue;
        proxy_read_timeout 5s;
        proxy_connect_timeout 2s;
        access_log off;
    }
    
    location / {
        proxy_pass http://theecopy_blue;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}

# Green API server (standby)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api-green.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location /health {
        proxy_pass http://theecopy_green;
        access_log off;
    }
    
    location / {
        proxy_pass http://theecopy_green;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/theecopy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## PM2 Process Management

Create `/home/ubuntu/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      // Blue slot
      name: 'theecopy-blue',
      script: './dist/server.js',
      cwd: '/home/ubuntu/theecopy-blue/backend',
      instances: 'auto',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_file: '/home/ubuntu/.env.blue',
      error_file: '/var/log/theecopy/blue-error.log',
      out_file: '/var/log/theecopy/blue-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      shutdown_with_message: true,
    },
    {
      // Green slot
      name: 'theecopy-green',
      script: './dist/server.js',
      cwd: '/home/ubuntu/theecopy-green/backend',
      instances: 'auto',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      env_file: '/home/ubuntu/.env.green',
      error_file: '/var/log/theecopy/green-error.log',
      out_file: '/var/log/theecopy/green-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      watch: false,
      autorestart: true,
      shutdown_with_message: true,
    },
  ],
};
```

---

## Staging Deployment

See [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md) for detailed staging setup.

---

## Monitoring & Alerting

See [MONITORING_SETUP.md](./MONITORING_SETUP.md) for comprehensive monitoring configuration.

---

## Health Checks

Create `/backend/src/routes/health.ts`:

```typescript
import { Router } from 'express';
import { checkDatabaseHealth, checkRedisHealth } from '../services';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const [dbHealth, redisHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const healthy = dbHealth.status === 'fulfilled' && redisHealth.status === 'fulfilled';

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth.status === 'fulfilled' ? 'ok' : 'error',
      redis: redisHealth.status === 'fulfilled' ? 'ok' : 'error',
      environment: process.env.ENVIRONMENT,
      version: process.env.BUILD_NUMBER,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/ready', async (req, res) => {
  // Startup probe - check if app is ready for traffic
  res.status(200).json({ ready: true });
});

export default router;
```

---

## Troubleshooting

### Check Service Status

```bash
# PM2
pm2 status
pm2 logs theecopy-blue
pm2 logs theecopy-green

# Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log

# PostgreSQL
sudo systemctl status postgresql

# Redis
redis-cli ping
```

### Common Issues

**503 Service Unavailable**
- Check PM2 logs: `pm2 logs`
- Verify database connection
- Check Redis connectivity

**SSL Certificate Errors**
- Renew certificate: `sudo certbot renew`
- Check certificate expiry: `sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem`

**High Memory Usage**
- Adjust `max_old_space_size` in PM2 config
- Check for memory leaks in application
- Monitor with `pm2 monit`

---

## Next Steps

1. Update `.env.blue` and `.env.green` with your credentials
2. Run setup scripts on production server
3. Test staging deployment
4. Configure monitoring and alerting
5. Plan blue-green deployment schedule

