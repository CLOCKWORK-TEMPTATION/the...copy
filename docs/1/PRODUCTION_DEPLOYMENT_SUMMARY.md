# 🚀 Production Deployment Complete Configuration Guide

**The Copy - Drama Analysis Platform**

A comprehensive production deployment setup with environment configuration, infrastructure provisioning, SSL/TLS security, staging validation, and monitoring.

---

## 📚 Documentation Index

This complete deployment package includes:

### 1. **PRODUCTION_DEPLOYMENT_SETUP.md**
   - Environment variable configuration (.env.blue, .env.green)
   - Infrastructure components (PostgreSQL, Redis, Nginx, PM2)
   - SSL/TLS with Let's Encrypt
   - Health check endpoints
   - Security headers and rate limiting

### 2. **STAGING_DEPLOYMENT.md**
   - Staging environment setup
   - Docker Compose for isolated testing
   - Complete deployment automation script
   - Integration tests with Vitest
   - Load testing with K6
   - Rollback procedures

### 3. **MONITORING_SETUP.md**
   - Sentry error tracking and performance monitoring
   - Application health checks
   - Prometheus metrics collection
   - Slack and email notifications
   - Grafana dashboards
   - Structured logging configuration
   - Alert rules and escalation

### 4. **DEPLOYMENT_CHECKLIST.md**
   - Pre-deployment verification (7 phases)
   - Blue-green deployment procedure
   - Rollback instructions
   - Quick reference commands
   - Post-deployment tasks
   - Troubleshooting guide
   - Emergency contacts

### 5. **Infrastructure Setup Scripts**
   - `scripts/setup-production-infrastructure.sh` - Complete server setup
   - `scripts/setup-ssl-certificates.sh` - SSL configuration with auto-renewal

---

## 🎯 Quick Start Guide

### Step 1: Review Configuration Documents (15 minutes)

```bash
# Read the main deployment guide
cat PRODUCTION_DEPLOYMENT_SETUP.md

# Review staging procedures
cat STAGING_DEPLOYMENT.md

# Check monitoring setup
cat MONITORING_SETUP.md

# Study deployment checklist
cat DEPLOYMENT_CHECKLIST.md
```

### Step 2: Prepare Credentials (30 minutes)

Update `.env.blue` and `.env.green` with:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/db
POSTGRES_USER=theecopy_user
POSTGRES_PASSWORD=secure_password_here

# Redis
REDIS_URL=redis://:password@redis-host:6379/0
REDIS_PASSWORD=secure_redis_password

# API Keys
GOOGLE_GENAI_API_KEY=your_gemini_api_key
JWT_SECRET=min_32_character_secure_secret

# Sentry
SENTRY_DSN=https://key@id.ingest.sentry.io/project
SENTRY_AUTH_TOKEN=your_sentry_token

# Domains
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# SMTP (for email alerts)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=app_specific_password

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Setup Production Server (1-2 hours)

```bash
# 1. SSH into your production server
ssh user@production-server.com

# 2. Download and run infrastructure setup
curl -O https://yourdomain.com/scripts/setup-production-infrastructure.sh
chmod +x setup-production-infrastructure.sh
sudo ./setup-production-infrastructure.sh production yourdomain.com

# 3. Verify installations
node --version  # v20+
psql --version  # PostgreSQL 15+
redis-cli ping  # PONG
pm2 --version   # PM2 installed
```

### Step 4: Configure SSL Certificates (30 minutes)

```bash
# 1. Run SSL setup script
sudo bash setup-ssl-certificates.sh yourdomain.com admin@yourdomain.com

# 2. Verify certificate
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# 3. Test HTTPS
curl -I https://yourdomain.com
```

### Step 5: Deploy to Staging (1 hour)

```bash
# 1. Run staging deployment
bash scripts/deploy-staging.sh

# 2. Run health checks
curl http://localhost:3003/health
curl http://localhost:3003/ready

# 3. Run integration tests
npm run test:integration

# 4. Run load tests
k6 run tests/load/staging-load-test.js
```

### Step 6: Configure Monitoring (1 hour)

```bash
# 1. Create Sentry project
# Visit https://sentry.io and create new project

# 2. Get DSN and update .env files
SENTRY_DSN=https://your_key@your_id.ingest.sentry.io/your_project

# 3. Configure Slack webhook
# Create incoming webhook in Slack workspace

# 4. Setup Grafana dashboard
# Import dashboard from MONITORING_SETUP.md

# 5. Test alerts
curl -X POST http://localhost:3003/test-alert
```

### Step 7: Deploy to Production (30 minutes)

```bash
# 1. Final pre-deployment checks
bash scripts/pre-deployment-checks.sh

# 2. Deploy to inactive slot (Green)
bash scripts/deploy-production.sh green

# 3. Run smoke tests
npm run smoke:tests

# 4. Switch traffic
sudo bash scripts/switch-traffic-to-green.sh

# 5. Monitor deployment
pm2 logs theecopy-green
tail -f /var/log/nginx/access.log
```

---

## 🏗️ Architecture Overview

### Blue-Green Deployment Strategy

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
│     Routes traffic to active slot       │
└────────────┬──────────────────┬─────────┘
             │                  │
      (Active Port 3001)  (Standby Port 3002)
             │                  │
    ┌────────▼────────┐   ┌──────▼──────────┐
    │    Blue Slot    │   │   Green Slot    │
    │  (Production)   │   │   (Staging)     │
    │   Instance 1    │   │   Instance 1    │
    │   Instance 2    │   │   Instance 2    │
    └────────┬────────┘   └──────┬──────────┘
             │                    │
             └────────┬───────────┘
                      │
            ┌─────────▼──────────┐
            │  PostgreSQL + Redis│
            │   Shared Database  │
            └────────────────────┘
```

### Service Topology

```
                    ┌──────────────────┐
                    │   Let's Encrypt  │
                    │   SSL Certificate│
                    └─────────┬────────┘
                              │
                    ┌─────────▼────────┐
                    │      Nginx       │
                    │  (Reverse Proxy) │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
    ┌───▼──────┐         ┌────▼────┐           ┌────▼────┐
    │ Frontend  │         │ Backend  │           │ Backend  │
    │ Port 3000 │         │ Blue:3001│           │Green:3002│
    │ (Next.js) │         │(Express) │           │(Express) │
    └───┬──────┘         └────┬─────┘           └────┬─────┘
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
            ┌───▼────────┐           ┌──────▼────┐
            │ PostgreSQL │           │   Redis   │
            │  Neon DB   │           │ Cache/Jobs│
            └────────────┘           └───────────┘
```

---

## 🔒 Security Configuration

### SSL/TLS Settings

- **Protocols**: TLSv1.2 - TLSv1.3
- **Certificate**: Let's Encrypt auto-renewal
- **HSTS**: max-age=63072000
- **OCSP Stapling**: Enabled
- **Ciphers**: Modern cryptographic algorithms

### Security Headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: restrictive policy
Referrer-Policy: strict-origin-when-cross-origin
```

### Access Control

- **Firewall**: UFW with specific port rules
- **Rate Limiting**: 100 req/s per IP
- **CORS**: Restricted to production domains
- **fail2ban**: Automatic IP blocking for brute force
- **SSH**: Key-based authentication only

---

## 📊 Monitoring & Observability

### Error Tracking

- **Sentry Integration**: Automatic error capture
- **Sample Rate**: 10% of errors tracked
- **Profiling**: 10% of transactions profiled
- **Custom Events**: Application-specific events

### Performance Metrics

- **Request Duration**: p95 < 500ms target
- **Error Rate**: < 0.1% target
- **Cache Hit Rate**: > 80% target
- **Database Performance**: < 100ms p95 latency

### Health Checks

```bash
# Liveness probe (is app running?)
GET /health/alive → 200 OK

# Readiness probe (can accept traffic?)
GET /health/ready → 200 OK

# Full health check (component status)
GET /health → {
  "status": "healthy",
  "database": "ok",
  "redis": "ok",
  "memory": {...}
}
```

### Alerting

- **Slack**: Real-time notifications
- **Email**: Daily digest and critical alerts
- **Webhook**: Custom integrations
- **PagerDuty**: Escalation (optional)

---

## 📝 Environment Variables Summary

### Database

```
DATABASE_URL              # PostgreSQL connection string
POSTGRES_HOST             # Database host
POSTGRES_PORT             # Database port
POSTGRES_USER             # Database user
POSTGRES_PASSWORD         # Database password
POSTGRES_DB               # Database name
```

### Redis

```
REDIS_URL                 # Redis connection string
REDIS_HOST                # Redis host
REDIS_PORT                # Redis port
REDIS_PASSWORD            # Redis password
REDIS_DB                  # Redis database number
```

### API Configuration

```
NEXT_PUBLIC_API_URL       # Frontend API URL
BACKEND_URL               # Backend internal URL
FRONTEND_URL              # Frontend URL
CORS_ORIGIN               # Allowed CORS origins
API_TIMEOUT_MS            # API timeout milliseconds
```

### Authentication

```
JWT_SECRET                # JWT signing secret (32+ chars)
JWT_ALGORITHM             # Algorithm (HS256)
JWT_EXPIRES_IN            # Token expiry (7d)
SESSION_SECRET            # Session secret (32+ chars)
SESSION_TIMEOUT           # Session timeout (ms)
```

### Monitoring

```
SENTRY_DSN                # Sentry project DSN
SENTRY_AUTH_TOKEN         # Sentry API token
SENTRY_ENVIRONMENT        # Environment (production-blue)
SENTRY_SAMPLE_RATE        # Sampling rate (0.1 = 10%)
SLACK_WEBHOOK_URL         # Slack webhook URL
SMTP_HOST                 # Email SMTP host
SMTP_USER                 # Email user
SMTP_PASSWORD             # Email password
```

---

## 🔄 Maintenance & Operations

### Daily Tasks

```bash
# Monitor logs
pm2 logs theecopy-blue
pm2 logs theecopy-green

# Check system resources
htop
df -h
free -h

# Verify SSL certificate
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
```

### Weekly Tasks

```bash
# Review error logs
tail -n 1000 /var/log/theecopy/blue.log | grep ERROR

# Check database performance
psql -c "SELECT * FROM pg_stat_statements LIMIT 10;"

# Verify backups
ls -lah /opt/backups/
```

### Monthly Tasks

```bash
# Database maintenance
psql -c "VACUUM ANALYZE;"
psql -c "REINDEX DATABASE theeeecopy_blue;"

# SSL certificate check
certbot certificates

# Update dependencies
npm update
pnpm update
```

---

## 🆘 Troubleshooting Guide

### Application Issues

| Issue | Solution |
|-------|----------|
| App won't start | Check logs: `pm2 logs`, verify .env files, test database connection |
| High memory usage | Restart: `pm2 restart theecopy-blue`, increase max_memory_restart |
| Database errors | Check PostgreSQL: `systemctl status postgresql`, verify credentials |
| Redis errors | Check Redis: `redis-cli ping`, verify password, check memory |
| SSL errors | Check certificate: `openssl x509 -in cert.pem`, renew if needed |

### Performance Issues

| Issue | Solution |
|-------|----------|
| Slow API responses | Check database query logs, review slow_query_threshold |
| High CPU usage | Profile with `pm2 monit`, review application code |
| OOM (Out of Memory) | Increase node memory: `--max-old-space-size=2048` |
| Connection timeouts | Increase timeout values, check network connectivity |

### Deployment Issues

| Issue | Solution |
|-------|----------|
| Health check fails | Verify database/Redis connectivity, check logs |
| Traffic switch fails | Check both slots running, verify health endpoints |
| Rollback needed | Run `switch-traffic-to-blue.sh`, investigate root cause |

---

## 📞 Support & Resources

### Getting Help

1. **Check Logs**: `pm2 logs`, `/var/log/nginx/error.log`
2. **Verify Status**: `pm2 status`, `systemctl status postgresql`
3. **Review Guides**: Check relevant markdown files
4. **Contact Team**: Slack #deployments channel

### Useful Commands

```bash
# Service management
pm2 start/stop/restart/delete theecopy-blue

# Monitoring
pm2 monit
pm2 logs theecopy-blue --tail 100
htop

# Database
psql -d theeeecopy_blue -c "SELECT * FROM pg_stat_activity;"

# System
systemctl status theecopy
journalctl -u theecopy.service -f

# Certificates
certbot renew --dry-run
openssl x509 -enddate -noout -in cert.pem
```

---

## ✅ Deployment Verification

After deployment, verify:

- [ ] Health endpoints responding
- [ ] Database connectivity working
- [ ] Redis connectivity working
- [ ] SSL certificates valid
- [ ] Logs showing normal operation
- [ ] Sentry receiving events
- [ ] Slack notifications working
- [ ] Email alerts configured
- [ ] Monitoring dashboards updated
- [ ] Team members notified

---

## 📅 Next Steps

1. **Week 1**: Deploy to staging, validate thoroughly
2. **Week 2**: Deploy to production during low-traffic period
3. **Week 3**: Monitor and optimize based on metrics
4. **Week 4**: Document lessons learned, plan improvements

---

## 📖 Document Structure

```
project-root/
├── PRODUCTION_DEPLOYMENT_SETUP.md      # Environment & infrastructure
├── STAGING_DEPLOYMENT.md                # Staging validation
├── MONITORING_SETUP.md                  # Monitoring & alerting
├── DEPLOYMENT_CHECKLIST.md              # Pre/post deployment
├── PRODUCTION_DEPLOYMENT_SUMMARY.md     # This file
├── scripts/
│   ├── setup-production-infrastructure.sh
│   ├── setup-ssl-certificates.sh
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   └── ...
├── .env.blue                            # Blue slot config
├── .env.green                           # Green slot config
└── monitoring/
    ├── prometheus-rules.yml
    └── grafana-dashboard.json
```

---

## 🎉 Conclusion

You now have a complete, production-ready deployment setup for The Copy platform with:

✅ Secure environment configuration
✅ Automated infrastructure provisioning
✅ SSL/TLS with Let's Encrypt
✅ Blue-green deployment strategy
✅ Comprehensive monitoring and alerting
✅ Staging validation pipeline
✅ Complete documentation
✅ Emergency procedures

**Ready to deploy!** Follow the checklist and deployment procedures to go live.

