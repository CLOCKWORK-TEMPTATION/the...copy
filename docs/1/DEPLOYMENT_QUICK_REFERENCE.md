# ⚡ Production Deployment Quick Reference Card

**The Copy - Drama Analysis Platform**

Laminate this card for quick access during deployment operations.

---

## 🚀 5-Minute Deployment Start

```
Step 1: Setup Infrastructure (30 min)
$ sudo bash scripts/setup-production-infrastructure.sh

Step 2: Configure SSL (5 min)
$ sudo bash scripts/setup-ssl-certificates.sh yourdomain.com admin@yourdomain.com

Step 3: Deploy to Staging (15 min)
$ bash scripts/deploy-staging.sh

Step 4: Deploy to Production (10 min)
$ bash scripts/deploy-production.sh blue

Step 5: Switch Traffic (2 min)
$ sudo bash scripts/switch-traffic-to-green.sh

Step 6: Monitor (Ongoing)
$ pm2 logs theecopy-blue
```

---

## 📋 Pre-Deployment Checklist

**Code**
- [ ] All tests passing
- [ ] No console.log or debug code
- [ ] No hardcoded secrets
- [ ] Dependencies up to date

**Environment**
- [ ] .env.blue configured
- [ ] .env.green configured
- [ ] Sentry DSN set
- [ ] Slack webhook ready

**Infrastructure**
- [ ] Server provisioned
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Nginx configured
- [ ] SSL certificates ready

**Team**
- [ ] Deployment window scheduled
- [ ] Team on standby
- [ ] Runbooks reviewed
- [ ] Communication plan set

---

## 🔥 Emergency Commands

```bash
# Immediate rollback
sudo bash scripts/switch-traffic-to-blue.sh

# Stop everything
pm2 stop all
sudo systemctl stop nginx

# Start everything
sudo systemctl start postgresql
sudo systemctl start redis-server
pm2 start ecosystem.config.js
sudo systemctl start nginx

# Check status
pm2 status
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
```

---

## 📊 Health Check URLs

```
API Health:        https://yourdomain.com/health
Readiness:         https://yourdomain.com/ready
Liveness:          https://yourdomain.com/alive
Database Check:    https://yourdomain.com/health/db
```

Expected response: `200 OK` with healthy status

---

## 🔐 SSL Certificate Commands

```bash
# Check expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# Force renewal
certbot renew --force-renewal

# List all
certbot certificates

# Test SSL
openssl s_client -connect yourdomain.com:443
```

---

## 🗄️ Database Commands

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Connect
psql $DATABASE_URL

# Check size
psql -c "SELECT pg_size_pretty(pg_database_size('theeeecopy_blue'));"

# Active connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📈 Monitoring Commands

```bash
# PM2 monitoring
pm2 monit
pm2 logs theecopy-blue --tail 100
pm2 describe theecopy-blue

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System resources
htop
df -h
free -h

# Process info
ps aux | grep node
lsof -i :3001
```

---

## 🔧 Service Management

```bash
# PM2
pm2 start ecosystem.config.js
pm2 restart theecopy-blue
pm2 stop theecopy-green
pm2 delete theecopy-blue

# Nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo nginx -t

# PostgreSQL
sudo systemctl restart postgresql
sudo systemctl status postgresql

# Redis
redis-cli ping
redis-cli FLUSHALL
```

---

## ✅ Post-Deployment Tasks

**Immediate (0-1 hour)**
- [ ] Monitor logs
- [ ] Verify endpoints
- [ ] Check Sentry
- [ ] Monitor database
- [ ] Watch memory/CPU
- [ ] Verify SSL

**Short-term (1-24 hours)**
- [ ] Review error logs
- [ ] Verify backups
- [ ] Check database performance
- [ ] Monitor cache hit rate
- [ ] Test critical flows

**Daily (ongoing)**
- [ ] Review logs
- [ ] Check dashboards
- [ ] Verify backups
- [ ] Monitor metrics
- [ ] Update runbooks

---

## 📞 Quick Troubleshooting

**App won't start**
```bash
pm2 logs theecopy-blue
env | grep DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

**High memory**
```bash
pm2 monit
pm2 restart theecopy-blue
# Edit ecosystem.config.js: max_memory_restart: '2G'
```

**Database errors**
```bash
systemctl status postgresql
psql $DATABASE_URL -c "SELECT 1"
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**SSL issues**
```bash
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
certbot renew --force-renewal
sudo systemctl reload nginx
```

**High latency**
```bash
# Check database
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check Redis
redis-cli --stat

# Check Nginx
tail -f /var/log/nginx/access.log | grep "HTTP/[1-9]"
```

---

## 🌐 Environment Variables Quick Reference

| Variable | Example | Notes |
|----------|---------|-------|
| DATABASE_URL | postgresql://user:pass@host/db | Neon PostgreSQL |
| REDIS_URL | redis://:pass@host:6379/0 | 0 for blue, 1 for green |
| NEXT_PUBLIC_API_URL | https://api.yourdomain.com | Frontend API URL |
| JWT_SECRET | 32+ character random string | Keep secure! |
| SENTRY_DSN | https://key@id.ingest... | Error tracking |
| SLACK_WEBHOOK_URL | https://hooks.slack.com/... | Alerts to Slack |
| SMTP_HOST | smtp.gmail.com | Email notifications |

---

## 🎯 Key Ports

| Port | Service | Role |
|------|---------|------|
| 22 | SSH | Server access |
| 80 | HTTP | Redirects to HTTPS |
| 443 | HTTPS | Main traffic |
| 3000 | Frontend | Next.js |
| 3001 | Backend Blue | Production |
| 3002 | Backend Green | Standby |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Cache |

---

## 📊 Target Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| API Latency (p95) | < 500ms | > 1s |
| Error Rate | < 0.1% | > 0.5% |
| CPU Usage | < 70% | > 80% |
| Memory Usage | < 70% | > 80% |
| Uptime | > 99.9% | < 99% |
| Cache Hit Rate | > 80% | < 60% |

---

## 🔄 Blue-Green Deployment Flow

```
1. Deploy to GREEN (inactive slot)
   └─ scripts/deploy-production.sh green

2. Verify GREEN is healthy
   └─ curl https://api-green.yourdomain.com/health

3. Run smoke tests
   └─ npm run smoke:tests

4. Switch traffic to GREEN
   └─ sudo scripts/switch-traffic-to-green.sh

5. Keep BLUE running as backup
   └─ pm2 status

6. Monitor GREEN in production
   └─ pm2 logs theecopy-green

7. If issues: Rollback to BLUE
   └─ sudo scripts/switch-traffic-to-blue.sh
```

---

## 📋 Deployment Slot Info

**BLUE Slot (Currently Active)**
- Port: 3001
- Database: theeeecopy_blue
- Redis DB: 0
- Nginx upstream: theecopy_blue
- PM2 process: theecopy-blue

**GREEN Slot (Standby)**
- Port: 3002
- Database: theeeecopy_green
- Redis DB: 1
- Nginx upstream: theecopy_green
- PM2 process: theecopy-green

---

## 🚨 Critical Error Responses

| Issue | Immediate Action | Escalation |
|-------|------------------|------------|
| App crash (5xx errors) | Check logs, restart service | Notify lead dev |
| Database unreachable | Check PostgreSQL, verify credentials | Notify DBA |
| High memory (> 90%) | Restart process, review code | Optimize memory usage |
| SSL certificate expired | Force renew certificate | Check renewal automation |
| Traffic not switching | Verify Nginx config, test reload | Manual revert to previous |
| Redis connection error | Check Redis service, verify password | Restart Redis |

---

## 💾 Backup Commands

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup-20240101-120000.sql

# SSL certificate backup
cp -r /etc/letsencrypt/live/yourdomain.com /opt/backups/ssl-$(date +%Y%m%d)

# Application backup (PM2)
pm2 save
```

---

## 📞 Team Escalation

**Level 1**: Developer on-call
- Response: 5 minutes
- Issues: Non-critical errors, slow queries

**Level 2**: Tech Lead
- Response: 15 minutes  
- Issues: Service unavailability, data corruption

**Level 3**: DevOps Engineer
- Response: 30 minutes
- Issues: Infrastructure failure, security breach

**Level 4**: Management
- Response: 60 minutes
- Issues: Major incident, extended outage

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All health checks pass
- ✅ Error rate < 0.1%
- ✅ API latency p95 < 500ms
- ✅ Sentry not showing new errors
- ✅ Database connections stable
- ✅ Cache hit rate > 80%
- ✅ CSS/JS assets loading
- ✅ User authentication working
- ✅ All critical flows tested
- ✅ Team notified

---

## 📌 Keep This Card Handy!

**Print and Laminate**:
- Keep by your desk during deployment
- Reference during incident response
- Share with on-call team members
- Update with team-specific info

**Last Updated**: December 2024
**Next Review**: March 2025

