# 📋 Production Deployment Checklist & Quick Reference

**The Copy - Drama Analysis Platform**

Complete checklist and quick reference guide for production deployment.

---

## Pre-Deployment Checklist

### Phase 1: Planning & Preparation (1-2 days before)

- [ ] **Stakeholder Communication**
  - [ ] Notify team members of deployment window
  - [ ] Schedule deployment meeting
  - [ ] Define rollback strategy
  - [ ] Prepare runbooks for incidents

- [ ] **Code Verification**
  - [ ] All tests passing locally
  - [ ] No console.log or debug code
  - [ ] No hardcoded secrets or API keys
  - [ ] All dependencies up to date
  - [ ] No deprecated APIs used

- [ ] **Documentation Review**
  - [ ] Deployment guide updated
  - [ ] Runbooks documented
  - [ ] Troubleshooting guide current
  - [ ] Team members trained

### Phase 2: Infrastructure Setup (2-3 days before)

- [ ] **Server Preparation**
  - [ ] Production server provisioned
  - [ ] SSH access configured
  - [ ] Security groups configured
  - [ ] SSH keys distributed to team

- [ ] **Environment Files**
  - [ ] `.env.blue` created with credentials
  - [ ] `.env.green` created with credentials
  - [ ] Secrets stored in secure vault
  - [ ] Database credentials generated
  - [ ] API keys obtained and verified

- [ ] **Infrastructure Installation**
  - [ ] Run `setup-production-infrastructure.sh`
  - [ ] Verify Node.js version (20+)
  - [ ] Verify pnpm installation
  - [ ] Verify PostgreSQL installation
  - [ ] Verify Redis installation
  - [ ] Verify Nginx installation
  - [ ] Verify PM2 installation

- [ ] **Database Setup**
  - [ ] PostgreSQL started and enabled
  - [ ] Databases created (blue & green)
  - [ ] Database users created
  - [ ] Permissions set correctly
  - [ ] Backup strategy configured

- [ ] **Redis Setup**
  - [ ] Redis started and enabled
  - [ ] Password configured
  - [ ] Memory limits set
  - [ ] Persistence configured
  - [ ] Backup strategy configured

### Phase 3: SSL/TLS Configuration (1-2 days before)

- [ ] **Certificate Generation**
  - [ ] Run `setup-ssl-certificates.sh`
  - [ ] Certificates obtained from Let's Encrypt
  - [ ] Certificate files verified
  - [ ] Auto-renewal configured
  - [ ] Certificate backup created

- [ ] **Nginx Configuration**
  - [ ] Nginx config validated
  - [ ] SSL parameters configured
  - [ ] HTTP to HTTPS redirect working
  - [ ] Security headers added
  - [ ] Rate limiting configured
  - [ ] CORS properly configured

- [ ] **SSL Verification**
  - [ ] Test HTTPS access: `curl -I https://yourdomain.com`
  - [ ] Check certificate: `openssl x509 -in cert.pem -text -noout`
  - [ ] Verify HSTS header
  - [ ] Run SSL Labs test: https://www.ssllabs.com/ssltest/

### Phase 4: Application Setup

- [ ] **Code Deployment**
  - [ ] Code pushed to production branch
  - [ ] CI/CD pipeline passing
  - [ ] Build artifacts ready
  - [ ] Dependencies resolved

- [ ] **Database Migrations**
  - [ ] Migrations tested in staging
  - [ ] Backup of current database created
  - [ ] Rollback plan documented
  - [ ] No breaking schema changes

- [ ] **Configuration**
  - [ ] Environment variables set
  - [ ] Database URLs configured
  - [ ] Redis URLs configured
  - [ ] API keys configured
  - [ ] Sentry DSN configured
  - [ ] Logging configured

### Phase 5: Staging Validation (1 day before)

- [ ] **Staging Deployment**
  - [ ] Application deployed to staging
  - [ ] All services started successfully
  - [ ] Health checks passing
  - [ ] Database migrations successful

- [ ] **Integration Testing**
  - [ ] API endpoints responding
  - [ ] Database connectivity verified
  - [ ] Redis connectivity verified
  - [ ] Authentication working
  - [ ] CORS properly configured
  - [ ] Rate limiting working

- [ ] **Performance Testing**
  - [ ] Load tests completed
  - [ ] Response times acceptable (p95 < 500ms)
  - [ ] Memory usage stable
  - [ ] CPU usage acceptable
  - [ ] Database query performance acceptable

- [ ] **Smoke Tests**
  - [ ] Health endpoint responding
  - [ ] Ready endpoint responding
  - [ ] Main API endpoints working
  - [ ] Frontend serving correctly
  - [ ] Error pages working

### Phase 6: Monitoring & Alerting (1 day before)

- [ ] **Sentry Configuration**
  - [ ] Sentry project created
  - [ ] DSN configured in .env
  - [ ] Test error capture working
  - [ ] Alert rules created
  - [ ] Team members added

- [ ] **Health Checks**
  - [ ] Liveness probe configured
  - [ ] Readiness probe configured
  - [ ] Health endpoint monitored
  - [ ] Alerting configured

- [ ] **Logging**
  - [ ] Log rotation configured
  - [ ] Log files permissions correct
  - [ ] Log aggregation configured
  - [ ] Log queries working

- [ ] **Dashboards**
  - [ ] Grafana dashboard created
  - [ ] Key metrics visible
  - [ ] Alert visualization configured
  - [ ] Team access granted

- [ ] **Notification Channels**
  - [ ] Slack webhooks configured
  - [ ] Email notifications configured
  - [ ] PagerDuty integration (if applicable)
  - [ ] Escalation policies defined

### Phase 7: Final Preparations (Day of deployment)

- [ ] **Pre-Deployment Review**
  - [ ] All checklist items completed
  - [ ] Rollback plan reviewed
  - [ ] Team on standby
  - [ ] Communication channels open
  - [ ] Incident response plan reviewed

- [ ] **Deployment Window**
  - [ ] Schedule confirmed with stakeholders
  - [ ] Team members available
  - [ ] Backup system ready
  - [ ] Support team notified

- [ ] **Final Tests**
  - [ ] Local builds passing
  - [ ] Staging tests passing
  - [ ] Database backup confirmed
  - [ ] Rollback scripts tested

---

## Deployment Procedures

### Blue-Green Deployment Process

```bash
# 1. Deploy to inactive slot (Green)
./scripts/deploy-production.sh green

# 2. Run health checks on Green
curl https://api-green.yourdomain.com/health
curl https://api-green.yourdomain.com/ready

# 3. Run smoke tests
npm run smoke:tests

# 4. Switch traffic to Green
./scripts/switch-traffic-to-green.sh

# 5. Verify Blue is idle
pm2 status theecopy-blue

# 6. Monitor Green in production
pm2 logs theecopy-green
tail -f /var/log/nginx/access.log

# 7. If issues, rollback to Blue
./scripts/switch-traffic-to-blue.sh
```

### Rollback Procedure

```bash
# 1. Immediate traffic switch
./scripts/switch-traffic-to-blue.sh

# 2. Verify services
pm2 status

# 3. Check logs
pm2 logs theecopy-blue

# 4. Monitor metrics
# Check Sentry, dashboards, etc.

# 5. Notify team
# Send Slack message about incident

# 6. Post-mortem
# Schedule incident review
```

---

## Quick Commands Reference

### Service Management

```bash
# Start all services
pm2 start ecosystem.config.js

# Stop services
pm2 stop theecopy-blue
pm2 stop theecopy-green

# Restart services
pm2 restart theecopy-blue
pm2 restart theecopy-green

# View status
pm2 status
pm2 monit

# View logs
pm2 logs theecopy-blue
pm2 logs theecopy-green
pm2 logs --tail 100

# Delete service
pm2 delete theecopy-blue
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (zero downtime)
sudo systemctl reload nginx

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log

# Check Nginx status
systemctl status nginx
```

### Database Management

```bash
# Connect to database
psql -U theecopy_user -d theeeecopy_blue

# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240101.sql

# Check connections
psql -U theecopy_user -d theeeecopy_blue -c "SELECT * FROM pg_stat_activity;"

# Run migrations
cd backend && pnpm db:push
```

### Redis Management

```bash
# Connect to Redis
redis-cli -p 6379 -a password

# Check Redis status
redis-cli ping

# View memory usage
redis-cli info memory

# Clear cache
redis-cli FLUSHALL

# Monitor Redis
redis-cli monitor
```

### Monitoring & Logs

```bash
# View system logs
journalctl -u theecopy.service -f

# Check system resources
htop
df -h
free -h

# View SSL certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
```

---

## Post-Deployment Tasks

### Immediately After Deployment

- [ ] Monitor health checks and logs
- [ ] Verify all endpoints responding
- [ ] Check Sentry for errors
- [ ] Monitor database connections
- [ ] Watch memory and CPU usage
- [ ] Verify SSL certificates
- [ ] Test all critical user workflows
- [ ] Check monitoring dashboards

### Within 1 Hour

- [ ] Verify database performance
- [ ] Check error rates
- [ ] Confirm no unusual patterns in logs
- [ ] Verify cron jobs running
- [ ] Check background queue processing
- [ ] Monitor cache hit rates

### Within 24 Hours

- [ ] Review all error logs
- [ ] Verify backup completion
- [ ] Update documentation if needed
- [ ] Gather performance metrics
- [ ] Schedule post-deployment review
- [ ] Plan any follow-up improvements

---

## Common Issues & Solutions

### Application won't start

```bash
# Check logs
pm2 logs theecopy-blue

# Check environment variables
env | grep DATABASE_URL

# Check permissions
ls -la /opt/theecopy-blue/

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### High memory usage

```bash
# Check process memory
pm2 monit

# Restart process
pm2 restart theecopy-blue

# Increase max memory
# Edit ecosystem.config.js: max_memory_restart: '2G'
```

### Database connection errors

```bash
# Check PostgreSQL status
systemctl status postgresql

# Verify credentials
psql -U theecopy_user -d theeeecopy_blue -c "SELECT 1"

# Check firewall
ufw status

# Monitor connections
psql -d theeeecopy_blue -c "SELECT count(*) FROM pg_stat_activity;"
```

### SSL certificate issues

```bash
# Check certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Force renewal
certbot renew --force-renewal

# Check Nginx SSL config
openssl s_client -connect yourdomain.com:443
```

### High latency

```bash
# Check slow queries
# Enable slow query log in backend
LOG_LEVEL=debug

# Monitor database
# Check for lock tables
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check Redis performance
redis-cli --stat
```

---

## Emergency Contacts & Escalation

| Role | Contact | On-Call? |
|------|---------|----------|
| Lead Developer | name@email.com | Yes |
| DevOps Engineer | name@email.com | Yes |
| Database Admin | name@email.com | No |
| Operations | name@email.com | Yes |

---

## Support & Resources

- **Documentation**: `/PRODUCTION_DEPLOYMENT_SETUP.md`
- **Staging Guide**: `/STAGING_DEPLOYMENT.md`
- **Monitoring Guide**: `/MONITORING_SETUP.md`
- **Sentry**: https://sentry.io/organizations/your-org/
- **Grafana**: https://grafana.yourdomain.com/
- **Slack Channel**: #deployments

---

## Deployment Sign-Off

```
✅ Deployment Completed Successfully
   Date: _______________
   Time: _______________
   Deployed By: _______________
   Approved By: _______________

✅ Post-Deployment Verification
   Health Checks: ☐ Pass ☐ Fail
   Performance: ☐ Good ☐ Acceptable ☐ Poor
   Errors: ☐ None ☐ Minor ☐ Critical

✅ Team Notification
   ☐ Team Lead Notified
   ☐ Slack Message Posted
   ☐ Status Page Updated
```

