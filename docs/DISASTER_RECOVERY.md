# Disaster Recovery Plan (DRP)

## 1. Overview
This document outlines the Disaster Recovery Plan for the **Drama Engine ("The Copy")** platform. It defines the strategies, procedures, and responsibilities for restoring critical business functions in the event of a major disruption.

Last Updated: 2025-12-25
Status: **Draft / Active**

## 2. Recovery Objectives (SLAs)

### 2.1 Recovery Time Objective (RTO)
The maximum acceptable length of time that the application can be offline.
- **Critical Services (API, Auth, Database):** 1 Hour
- **Non-Critical Services (Reporting, Analytics):** 4 Hours

### 2.2 Recovery Point Objective (RPO)
The maximum acceptable amount of data loss measured in time.
- **Database (Transactions):** 5 Minutes (via Neon PITR)
- **Object Storage (Project Assets):** 24 Hours (Daily Backups)

## 3. Architecture & Redundancy

### 3.1 Database (Neon Postgres)
- **Provider:** Neon.tech (Serverless Postgres)
- **Backup Strategy:** 
  - Continuous WAL archiving (Point-In-Time Recovery coverage: 7 days).
  - Daily logical backups to external storage (S3/R2).
- **Failover:** Neon separates compute from storage. Compute restart is automatic < 5s.

### 3.2 Caching (Redis)
- **Architecture:** Redis Sentinel (3 nodes: 1 Master, 2 Replicas).
- **Failover:** Automatic promotion of replica if master fails.
- **Configuration:** `REDIS_SENTINEL_ENABLED=true` in Production.

### 3.3 Application Layer
- **Strategy:** Blue-Green Deployment.
- **Redundancy:** Multiple instance processes managed by PM2/Docker.
- **Load Balancing:** Nginx / Cloudflare.

## 4. Recovery Procedures

### 4.1 Scenario A: Database Corruption or Loss

**Severity:** Critical
**Trigger:** Data corruption, accidental deletion, or region outage.
**Steps:**
1. **Acknowledge:** On-call engineer receives PagerDuty alert.
2. **Verify:** Run `npm run db:verify-backup` to check latest valid restore point.
3. **Restore:**
   - Log into Neon Console or use CLI.
   - Select "Restore to Point in Time" (before the incident timestamp).
   - Restore to a **new branch** first to verify integrity.
4. **Switch:** Update `DATABASE_URL` in `.env.production` to point to the new branch.
5. **Restart:** Restart application services: `pm2 restart all` or `docker compose restart`.

### 4.2 Scenario B: Redis Master Failure

**Severity:** High
**Trigger:** Redis connectivity timeouts.
**Steps:**
1. **Manual Intervention (if auto-failover fails):**
   - Connect to a surviving Sentinel: `redis-cli -p 26379 sentinel get-master-addr-by-name mymaster`.
   - Force failover: `redis-cli -p 26379 sentinel failover mymaster`.
2. **Verify:** Check logs for "switched to new master".

### 4.3 Scenario C: Bad Deployment (Blue-Green Rollback)

**Severity:** Medium
**Trigger:** High error rate after deployment.
**Steps:**
1. **Identify:** Warning alerts from SLO Middleware.
2. **Rollback:** Run `npm run deploy:rollback` or `scripts/deploy/switch-traffic.js rollback`.
3. **Verify:** Ensure traffic is routed to the previous "Color" (e.g., from Green back to Blue).

## 5. Cost & Monitoring

- **SLO Dashboard:** `/metrics` endpoint monitored by Prometheus/Grafana.
- **Cost Alerts:** Gemini usage monitored daily. Limits enforced at $50/day (Soft Limit).

## 6. Contacts

| Role | Contact |
|------|---------|
| DevOps Lead | devops@the-copy.internal |
| Database Vendor | support@neon.tech |
