# 🧪 Staging Deployment Pipeline

**The Copy - Drama Analysis Platform**

Comprehensive guide for testing deployments in a staging environment before production release.

---

## Overview

The staging deployment pipeline allows you to:
- Test code in an environment identical to production
- Validate database migrations and schema changes
- Perform load testing and performance validation
- Verify SSL certificates and security configurations
- Test blue-green deployment process

---

## Staging Environment Setup

### 1. Create Staging Environment Files

Create `.env.staging` at root:

```bash
# ==========================================
# Staging Environment Configuration
# ==========================================
NODE_ENV=staging
ENVIRONMENT=staging
PORT=3003
APP_NAME=theeeecopy-staging

# ==========================================
# Database Configuration
# ==========================================
DATABASE_URL=postgresql://staging_user:staging_password@localhost:5432/theeeecopy_staging
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=staging_user
POSTGRES_PASSWORD=staging_password
POSTGRES_DB=theeeecopy_staging

# ==========================================
# Redis Configuration
# ==========================================
REDIS_URL=redis://localhost:6380/0
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=staging_redis_password

# ==========================================
# API Configuration
# ==========================================
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
BACKEND_URL=https://staging-api.yourdomain.com
FRONTEND_URL=https://staging.yourdomain.com
CORS_ORIGIN=https://staging.yourdomain.com

# ==========================================
# Authentication
# ==========================================
JWT_SECRET=staging_jwt_secret_key_32_chars_min
SESSION_SECRET=staging_session_secret_key
JWT_EXPIRES_IN=7d

# ==========================================
# Google Gemini AI
# ==========================================
GOOGLE_GENAI_API_KEY=your_staging_gemini_key

# ==========================================
# Sentry Configuration
# ==========================================
SENTRY_DSN=https://staging_key@your_sentry_id.ingest.sentry.io/staging_project_id
SENTRY_ENVIRONMENT=staging
SENTRY_RELEASE=1.0.0-staging
SENTRY_TRACING_ENABLED=true
SENTRY_SAMPLE_RATE=0.5

# ==========================================
# Logging
# ==========================================
LOG_LEVEL=debug
LOG_FILE=/var/log/theeeecopy/staging.log
LOG_FORMAT=json

# ==========================================
# Feature Flags
# ==========================================
FEATURE_ANALYTICS=true
FEATURE_ADVANCED_AI=true
FEATURE_BETA_UI=false

# ==========================================
# Rate Limiting (relaxed for testing)
# ==========================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ==========================================
# Performance Testing
# ==========================================
ENABLE_PROFILING=true
ENABLE_QUERY_LOGGING=true
SLOW_QUERY_THRESHOLD_MS=1000
```

### 2. Create Staging Database

```bash
#!/bin/bash
# scripts/setup-staging-db.sh

set -e

echo "🗄️ Creating staging database..."

sudo -u postgres psql <<EOF
  CREATE DATABASE IF NOT EXISTS theeeecopy_staging;
  CREATE USER IF NOT EXISTS staging_user WITH PASSWORD 'staging_password';
  ALTER ROLE staging_user SET client_encoding TO 'utf8';
  ALTER ROLE staging_user SET default_transaction_isolation TO 'read committed';
  GRANT ALL PRIVILEGES ON DATABASE theeeecopy_staging TO staging_user;
EOF

echo "✅ Staging database created"
```

### 3. Staging Docker Compose (Alternative)

Create `docker-compose.staging.yml`:

```yaml
version: '3.9'

services:
  # PostgreSQL Staging
  postgres-staging:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: theeeecopy_staging
      POSTGRES_USER: staging_user
      POSTGRES_PASSWORD: staging_password
    ports:
      - '5433:5432'
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
    networks:
      - theecopy-staging
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U staging_user']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Staging
  redis-staging:
    image: redis:7-alpine
    command: redis-server --requirepass staging_redis_password --port 6380
    ports:
      - '6380:6380'
    volumes:
      - redis_staging_data:/data
    networks:
      - theecopy-staging
    healthcheck:
      test: ['CMD', 'redis-cli', '-p', '6380', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Staging
  backend-staging:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: staging
      DATABASE_URL: postgresql://staging_user:staging_password@postgres-staging:5432/theeeecopy_staging
      REDIS_URL: redis://:staging_redis_password@redis-staging:6380/0
      PORT: 3003
    ports:
      - '3003:3003'
    depends_on:
      postgres-staging:
        condition: service_healthy
      redis-staging:
        condition: service_healthy
    networks:
      - theecopy-staging
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - .env.staging

  # Frontend Staging
  frontend-staging:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: staging
      NEXT_PUBLIC_API_URL: http://backend-staging:3003
    ports:
      - '3000:3000'
    depends_on:
      - backend-staging
    networks:
      - theecopy-staging
    volumes:
      - ./frontend:/app
      - /app/node_modules
    env_file:
      - .env.staging

volumes:
  postgres_staging_data:
  redis_staging_data:

networks:
  theecopy-staging:
    driver: bridge
```

---

## Staging Deployment Script

Create `scripts/deploy-staging.sh`:

```bash
#!/bin/bash
# Deploy to staging environment with validation

set -e

# Configuration
STAGING_DIR="/opt/theecopy-staging"
STAGING_BLUE_DIR="$STAGING_DIR/blue"
STAGING_GREEN_DIR="$STAGING_DIR/green"
REGISTRY="docker.io/yourusername"
IMAGE_NAME="theecopy"
LOG_FILE="/var/log/staging-deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
  exit 1
}

info() {
  echo -e "${YELLOW}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
  log "🔍 Running pre-deployment checks..."
  
  # Check git status
  if [[ $(git status -s) ]]; then
    error "❌ Uncommitted changes detected. Commit or stash changes."
  fi
  
  # Check branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "develop" ]]; then
    error "❌ Can only deploy from main or develop branch. Current: $CURRENT_BRANCH"
  fi
  
  # Verify .env.staging exists
  if [[ ! -f .env.staging ]]; then
    error "❌ .env.staging not found"
  fi
  
  log "✅ Pre-deployment checks passed"
}

# Build stage
build_stage() {
  log "🔨 Building application..."
  
  # Frontend
  log "📦 Building frontend..."
  cd frontend
  pnpm install --frozen-lockfile || error "Frontend install failed"
  pnpm build || error "Frontend build failed"
  pnpm test || error "Frontend tests failed"
  cd ..
  
  # Backend
  log "📦 Building backend..."
  cd backend
  pnpm install --frozen-lockfile || error "Backend install failed"
  pnpm build || error "Backend build failed"
  pnpm test || error "Backend tests failed"
  cd ..
  
  log "✅ Build completed successfully"
}

# Test stage
test_stage() {
  log "🧪 Running tests..."
  
  # Type checking
  log "🔎 Type checking..."
  pnpm typecheck || error "Type checking failed"
  
  # Linting
  log "📋 Running linter..."
  pnpm lint || error "Linting failed"
  
  # Unit tests
  log "🧪 Running unit tests..."
  cd frontend && pnpm test || error "Frontend tests failed"
  cd ..
  cd backend && pnpm test || error "Backend tests failed"
  cd ..
  
  # E2E tests (if needed)
  if [[ -f "cypress.config.ts" ]]; then
    log "🎭 Running E2E tests..."
    pnpm test:e2e || error "E2E tests failed"
  fi
  
  log "✅ All tests passed"
}

# Database migration
migrate_database() {
  log "🗄️ Running database migrations..."
  
  # Load staging env
  set -a
  source .env.staging
  set +a
  
  cd backend
  
  # Backup existing database
  log "💾 Backing up database..."
  pg_dump "$DATABASE_URL" > "/var/backups/staging-db-$(date +%Y%m%d-%H%M%S).sql"
  
  # Run migrations
  log "⬆️ Running Drizzle migrations..."
  pnpm db:push || error "Database migration failed"
  
  cd ..
  log "✅ Database migration completed"
}

# Deploy to staging
deploy_to_staging() {
  log "🚀 Deploying to staging..."
  
  # Prepare staging directories
  mkdir -p "$STAGING_DIR/logs" "$STAGING_DIR/backups"
  
  # Copy application
  log "📂 Copying application files..."
  if [[ -d "$STAGING_BLUE_DIR" ]]; then
    mv "$STAGING_BLUE_DIR" "$STAGING_BLUE_DIR.backup-$(date +%Y%m%d-%H%M%S)"
  fi
  
  cp -r . "$STAGING_BLUE_DIR"
  
  # Copy environment file
  cp .env.staging "$STAGING_BLUE_DIR/.env"
  
  # Install dependencies
  log "📦 Installing dependencies..."
  cd "$STAGING_BLUE_DIR"
  pnpm install --frozen-lockfile || error "Dependency installation failed"
  
  log "✅ Deployment to staging completed"
}

# Start services
start_services() {
  log "🟢 Starting services..."
  
  # Install PM2 globally if not present
  if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
  fi
  
  # Create PM2 ecosystem config for staging
  cat > "$STAGING_DIR/ecosystem.staging.config.js" <<EOF
module.exports = {
  apps: [
    {
      name: 'theecopy-staging-backend',
      script: './backend/dist/server.js',
      cwd: '$STAGING_BLUE_DIR',
      instances: 2,
      exec_mode: 'cluster',
      env_file: '$STAGING_BLUE_DIR/.env',
      error_file: '$STAGING_DIR/logs/backend-error.log',
      out_file: '$STAGING_DIR/logs/backend-out.log',
      max_memory_restart: '512M',
      merge_logs: true,
    },
    {
      name: 'theecopy-staging-frontend',
      script: 'start',
      cwd: '$STAGING_BLUE_DIR/frontend',
      env_file: '$STAGING_BLUE_DIR/.env',
      error_file: '$STAGING_DIR/logs/frontend-error.log',
      out_file: '$STAGING_DIR/logs/frontend-out.log',
      merge_logs: true,
    },
  ],
};
EOF
  
  # Start applications
  pm2 start "$STAGING_DIR/ecosystem.staging.config.js" || error "Failed to start services"
  pm2 save
  
  log "✅ Services started"
}

# Health checks
health_check() {
  log "🏥 Running health checks..."
  
  # Wait for services to start
  sleep 5
  
  # Check backend
  log "🔍 Checking backend health..."
  for i in {1..30}; do
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
      log "✅ Backend is healthy"
      break
    fi
    if [[ $i -eq 30 ]]; then
      error "❌ Backend health check failed"
    fi
    sleep 1
  done
  
  # Check frontend
  log "🔍 Checking frontend health..."
  for i in {1..30}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
      log "✅ Frontend is healthy"
      break
    fi
    if [[ $i -eq 30 ]]; then
      error "❌ Frontend health check failed"
    fi
    sleep 1
  done
  
  log "✅ All health checks passed"
}

# Smoke tests
smoke_tests() {
  log "🔥 Running smoke tests..."
  
  # Test API endpoints
  log "🧪 Testing API endpoints..."
  curl -f http://localhost:3003/health || error "Health endpoint failed"
  curl -f http://localhost:3003/api/status || error "Status endpoint failed"
  
  # Test database connectivity
  log "🧪 Testing database connectivity..."
  curl -f -X POST http://localhost:3003/api/health/db || error "Database test failed"
  
  log "✅ Smoke tests passed"
}

# Deployment report
generate_report() {
  log "📊 Generating deployment report..."
  
  cat > "$LOG_FILE.report" <<EOF
===========================================
Staging Deployment Report
===========================================
Date: $(date)
Status: SUCCESS
Build Version: $(git rev-parse --short HEAD)
Branch: $CURRENT_BRANCH

Checks Completed:
✅ Pre-deployment checks
✅ Build stage
✅ Test stage
✅ Database migration
✅ Service deployment
✅ Health checks
✅ Smoke tests

Deployed Application:
Location: $STAGING_BLUE_DIR
Environment: staging
Backend: http://localhost:3003
Frontend: http://localhost:3000

Next Steps:
1. Run integration tests
2. Perform load testing
3. Test blue-green deployment
4. Verify SSL certificates
5. Check monitoring and alerting

===========================================
EOF
  
  cat "$LOG_FILE.report"
  log "✅ Deployment report generated"
}

# Main execution
main() {
  log "🚀 Starting staging deployment..."
  
  pre_deployment_checks
  build_stage
  test_stage
  migrate_database
  deploy_to_staging
  start_services
  sleep 10  # Give services time to start
  health_check
  smoke_tests
  generate_report
  
  log "🎉 Staging deployment completed successfully!"
  log "📋 Logs available at: $LOG_FILE"
}

# Run main function
main
```

---

## Integration Tests

Create `tests/integration/staging.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.BACKEND_URL || 'http://localhost:3003';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

describe('Staging Deployment Integration Tests', () => {
  let api: typeof axios;

  beforeAll(() => {
    api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
    });
  });

  describe('Backend Health', () => {
    it('should return health status', async () => {
      const response = await api.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });

    it('should return database status', async () => {
      const response = await api.get('/health');
      expect(response.data).toHaveProperty('database');
      expect(response.data.database).toBe('ok');
    });

    it('should return redis status', async () => {
      const response = await api.get('/health');
      expect(response.data).toHaveProperty('redis');
      expect(response.data.redis).toBe('ok');
    });
  });

  describe('Frontend', () => {
    it('should serve frontend application', async () => {
      const response = await axios.get(FRONTEND_URL);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should have required meta tags', async () => {
      const response = await axios.get(FRONTEND_URL);
      expect(response.data).toContain('<title>');
    });
  });

  describe('API Endpoints', () => {
    it('should handle authentication', async () => {
      try {
        await api.get('/api/protected');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should handle CORS', async () => {
      const response = await api.options('/api/status', {
        headers: {
          Origin: 'http://localhost:3000',
        },
      });
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Database', () => {
    it('should query database successfully', async () => {
      const response = await api.get('/api/health/db');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('connected', true);
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await api.get('/health');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});
```

---

## Load Testing

Create `tests/load/staging-load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3003';

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Ramp up to 100 users
    { duration: '2m', target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // API request
  res = http.get(`${BASE_URL}/api/status`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Run load test:

```bash
k6 run tests/load/staging-load-test.js --vus 10 --duration 30s
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All staging tests pass
- [ ] Load tests successful (< 500ms p95 latency)
- [ ] Database migrations completed without errors
- [ ] Health checks all green
- [ ] Smoke tests passed
- [ ] Integration tests passed
- [ ] SSL certificates valid and renewed
- [ ] Sentry alerts configured
- [ ] Monitoring dashboards created
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Database backup created
- [ ] Blue-green deployment tested

---

## Rollback Procedure

```bash
#!/bin/bash
# scripts/rollback-staging.sh

echo "⏮️ Rolling back staging deployment..."

STAGING_DIR="/opt/theecopy-staging"
BACKUP_DIR="$STAGING_DIR.backup-latest"

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "❌ No backup found"
  exit 1
fi

# Stop current services
pm2 stop theecopy-staging-backend theecopy-staging-frontend
pm2 delete theecopy-staging-backend theecopy-staging-frontend

# Restore previous version
rm -rf "$STAGING_DIR"
cp -r "$BACKUP_DIR" "$STAGING_DIR"

# Restart services
pm2 start "$STAGING_DIR/ecosystem.staging.config.js"

echo "✅ Rollback completed"
```

