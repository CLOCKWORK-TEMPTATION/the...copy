# دليل استخدام Docker للـ Backend
# Docker Usage Guide for Backend

## ⚠️ تحذير أمني / Security Warning

**CRITICAL**: Never commit actual credentials to version control!
- Use `.env` files (already in `.gitignore`)
- Generate strong random secrets: `openssl rand -base64 32`
- Use Docker secrets or environment variables in production
- Rotate credentials regularly

## 🚀 البدء السريع / Quick Start

### المتطلبات / Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### 1️⃣ إعداد متغيرات البيئة / Environment Setup

أنشئ ملف `.env` في مجلد `backend/`:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

**المتغيرات المطلوبة:**

```env
# Runtime
NODE_ENV=production
PORT=3001

# AI Services (REQUIRED)
GOOGLE_GENAI_API_KEY=<YOUR_GEMINI_API_KEY>
# OR
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>

# Database (PostgreSQL)
DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@postgres:5432/<DATABASE>
POSTGRES_DB=<DATABASE_NAME>
POSTGRES_USER=<USERNAME>
POSTGRES_PASSWORD=<STRONG_PASSWORD>

# Security (REQUIRED - minimum 32 characters)
# Generate with: openssl rand -base64 32
JWT_SECRET=<GENERATE_RANDOM_32_CHAR_SECRET>

# CORS
CORS_ORIGIN=http://localhost:5000,https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (optional, for caching)
REDIS_PASSWORD=<REDIS_PASSWORD>
```

### 2️⃣ بناء وتشغيل الخدمات / Build and Run Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### 3️⃣ تشغيل ترحيلات قاعدة البيانات / Run Database Migrations

```bash
# Run Drizzle migrations
docker-compose exec backend pnpm run db:push

# Or generate new migrations
docker-compose exec backend pnpm run db:generate
```

### 4️⃣ التحقق من الصحة / Health Check

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Expected response:
# {
#   "success": true,
#   "status": "ok",
#   "timestamp": "2025-01-06T...",
#   "version": "1.0.0",
#   "uptime": 123.45
# }
```

---

## 🔧 الأوامر الشائعة / Common Commands

### إدارة الخدمات / Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View running containers
docker-compose ps

# View resource usage
docker stats
```

### السجلات والتشخيص / Logs & Debugging

```bash
# View all logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100 backend

# Follow logs for multiple services
docker-compose logs -f backend postgres

# Access container shell
docker-compose exec backend sh
```

### قاعدة البيانات / Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Create database backup
docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql

# Restore database backup
docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < backup_20250106.sql

# View database tables
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
```

### التنظيف / Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: deletes data!)
docker-compose down -v

# Remove unused images
docker system prune -a

# Remove specific volume
docker volume rm backend_postgres_data
```

---

## 🏭 الإنتاج / Production Deployment

### 1️⃣ إعدادات الأمان / Security Settings

```yaml
# In docker-compose.yml for production:
services:
  backend:
    restart: always  # Always restart on failure
    read_only: true  # Read-only container filesystem
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 2️⃣ استخدام أسرار Docker / Docker Secrets

```bash
# Create secrets (Swarm mode)
# WARNING: Never commit actual secrets to version control
echo "$JWT_SECRET" | docker secret create jwt_secret -
echo "$POSTGRES_PASSWORD" | docker secret create db_password -

# Reference in docker-compose.yml
secrets:
  - jwt_secret
  - db_password
```

### 3️⃣ المراقبة / Monitoring

```bash
# Install monitoring stack (Prometheus + Grafana)
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# View metrics
open http://localhost:9090  # Prometheus
open http://localhost:3000  # Grafana
```

### 4️⃣ النسخ الاحتياطي الآلي / Automated Backups

إنشاء cron job للنسخ الاحتياطي اليومي:

```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/backend && docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > /backups/the_copy_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔍 استكشاف الأخطاء / Troubleshooting

### المشكلة: Container يتوقف فوراً

```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - Invalid DATABASE_URL
# - Port already in use
```

**الحل:**
```bash
# Verify environment variables
docker-compose config

# Check if port is in use
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3001)
```

### المشكلة: فشل الاتصال بقاعدة البيانات

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready -U $POSTGRES_USER
```

**الحل:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Wait for database to be ready
docker-compose up -d postgres
sleep 10
docker-compose up -d backend
```

### المشكلة: Out of Memory

```bash
# Check memory usage
docker stats

# Increase container memory limit
# In docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

---

## 📊 قياس الأداء / Performance Tuning

### تحسين بناء الصورة / Optimize Build

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Multi-stage build layers
docker-compose build --no-cache
```

### تحسين قاعدة البيانات / Database Performance

```bash
# Increase PostgreSQL memory
# In docker-compose.yml:
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### تمكين Caching / Enable Caching

```bash
# Start Redis for caching
docker-compose up -d redis

# Update backend to use Redis
# See backend/src/services/cacheService.ts
```

---

## 🔄 التحديثات / Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Apply database migrations
docker-compose exec backend pnpm run db:push
```

---

## 📚 موارد إضافية / Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**آخر تحديث / Last Updated**: 2025-01-06
**المسؤول / Maintainer**: The Copy Team
