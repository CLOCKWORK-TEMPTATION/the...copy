# SLIs/SLOs/Error Budgets Documentation

## Overview

This document defines the Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budgets for The Copy application. These metrics are essential for maintaining service reliability and guiding engineering decisions.

---

## Service Level Indicators (SLIs)

SLIs are quantitative measures of service level. They answer "How well is the service performing?"

| Service | SLI | Description | Measurement |
|---------|-----|-------------|-------------|
| **API** | Availability | Percentage of successful requests | `(total_requests - 5xx_errors) / total_requests * 100` |
| **API** | Latency P95 | 95th percentile response time | `histogram_quantile(0.95, http_request_duration_ms)` |
| **Auth** | Success Rate | Percentage of successful login attempts | `successful_logins / total_login_attempts * 100` |
| **Gemini** | Success Rate | Percentage of successful AI responses | `successful_gemini_requests / total_gemini_requests * 100` |
| **Database** | Availability | Percentage of successful database queries | `successful_queries / total_queries * 100` |

### Prometheus Queries for SLIs

```promql
# API Availability SLI
sum(rate(the_copy_http_requests_total{status_code!~"5.."}[5m])) / sum(rate(the_copy_http_requests_total[5m])) * 100

# API Latency P95 SLI
histogram_quantile(0.95, sum(rate(the_copy_http_request_duration_ms_bucket[5m])) by (le))

# Auth Success Rate SLI
sum(rate(the_copy_slo_auth_logins_total{status="success"}[5m])) / sum(rate(the_copy_slo_auth_logins_total[5m])) * 100

# Gemini Success Rate SLI
sum(rate(the_copy_gemini_requests_total{status="success"}[5m])) / sum(rate(the_copy_gemini_requests_total[5m])) * 100

# Database Availability SLI
sum(rate(the_copy_db_queries_total{status="success"}[5m])) / sum(rate(the_copy_db_queries_total[5m])) * 100
```

---

## Service Level Objectives (SLOs)

SLOs are target values for SLIs. They answer "What level of reliability do we need?"

| Service | SLI | SLO Target | Monthly Budget |
|---------|-----|------------|----------------|
| **API** | Availability | 99.9% | 43.2 minutes downtime |
| **API** | Latency P95 | < 500ms | N/A |
| **Auth** | Success Rate | 99.5% | 216 minutes failures |
| **Gemini** | Success Rate | 95% | 36 hours failures |
| **Database** | Availability | 99.95% | 21.6 minutes downtime |

### SLO Targets Explained

#### API Availability: 99.9%
- **Target**: 99.9% of all requests should return non-5xx status codes
- **Monthly Error Budget**: 0.1% = 43.2 minutes of downtime/errors per month
- **Rationale**: Core functionality must be highly available

#### API Latency P95: < 500ms
- **Target**: 95% of requests should complete in under 500ms
- **Monthly Budget**: Number of requests exceeding 500ms should be < 5%
- **Rationale**: User experience degrades significantly above 500ms

#### Auth Success Rate: 99.5%
- **Target**: 99.5% of login attempts should succeed
- **Monthly Error Budget**: 0.5% = 216 minutes of authentication failures
- **Rationale**: Authentication is critical but can have legitimate failures

#### Gemini Success Rate: 95%
- **Target**: 95% of AI analysis requests should succeed
- **Monthly Error Budget**: 5% = 36 hours of AI failures
- **Rationale**: External API dependency with inherent variability

#### Database Availability: 99.95%
- **Target**: 99.95% of database queries should succeed
- **Monthly Error Budget**: 0.05% = 21.6 minutes of database issues
- **Rationale**: Database is the foundation; higher reliability required

---

## Error Budgets

Error Budget = 100% - SLO

### Budget Calculation

```
Error Budget Formula:
Budget (minutes/month) = (100% - SLO%) * 30 days * 24 hours * 60 minutes

Examples:
- API Availability: (100% - 99.9%) * 43,200 min = 43.2 minutes
- Auth Success Rate: (100% - 99.5%) * 43,200 min = 216 minutes
- Gemini Success Rate: (100% - 95%) * 43,200 min = 2,160 minutes (36 hours)
- Database Availability: (100% - 99.95%) * 43,200 min = 21.6 minutes
```

### Budget Status Levels

| Status | Budget Remaining | Action |
|--------|-----------------|--------|
| **Healthy** | > 50% | Normal development velocity |
| **Warning** | 25-50% | Reduce risky deployments |
| **Critical** | 10-25% | Focus on reliability work |
| **Exhausted** | < 10% | Feature freeze, reliability only |

### Monthly Error Budget Table

| Service | SLO | Error Budget (%) | Budget (minutes) | Budget (hours) |
|---------|-----|------------------|------------------|----------------|
| API Availability | 99.9% | 0.1% | 43.2 | 0.72 |
| Auth Success Rate | 99.5% | 0.5% | 216 | 3.6 |
| Gemini Success Rate | 95% | 5% | 2,160 | 36 |
| Database Availability | 99.95% | 0.05% | 21.6 | 0.36 |

---

## Prometheus Alerts

### API Availability Alert

```yaml
groups:
  - name: slo_alerts
    rules:
      # API Availability dropping below SLO
      - alert: APIAvailabilityBelowSLO
        expr: |
          (
            sum(rate(the_copy_http_requests_total{status_code!~"5.."}[5m]))
            /
            sum(rate(the_copy_http_requests_total[5m]))
          ) * 100 < 99.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API Availability below SLO (99.9%)"
          description: "API availability is {{ $value | printf \"%.2f\" }}%, below the 99.9% SLO target."

      # API Latency P95 exceeding SLO
      - alert: APILatencyAboveSLO
        expr: |
          histogram_quantile(0.95, sum(rate(the_copy_http_request_duration_ms_bucket[5m])) by (le)) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API P95 Latency above SLO (500ms)"
          description: "API P95 latency is {{ $value | printf \"%.0f\" }}ms, above the 500ms SLO target."

      # Auth Success Rate below SLO
      - alert: AuthSuccessRateBelowSLO
        expr: |
          (
            sum(rate(the_copy_slo_auth_logins_total{status="success"}[5m]))
            /
            sum(rate(the_copy_slo_auth_logins_total[5m]))
          ) * 100 < 99.5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Auth Success Rate below SLO (99.5%)"
          description: "Authentication success rate is {{ $value | printf \"%.2f\" }}%, below the 99.5% SLO target."

      # Gemini Success Rate below SLO
      - alert: GeminiSuccessRateBelowSLO
        expr: |
          (
            sum(rate(the_copy_gemini_requests_total{status="success"}[5m]))
            /
            sum(rate(the_copy_gemini_requests_total[5m]))
          ) * 100 < 95
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Gemini Success Rate below SLO (95%)"
          description: "Gemini API success rate is {{ $value | printf \"%.2f\" }}%, below the 95% SLO target."

      # Database Availability below SLO
      - alert: DatabaseAvailabilityBelowSLO
        expr: |
          (
            sum(rate(the_copy_db_queries_total{status="success"}[5m]))
            /
            sum(rate(the_copy_db_queries_total[5m]))
          ) * 100 < 99.95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database Availability below SLO (99.95%)"
          description: "Database availability is {{ $value | printf \"%.2f\" }}%, below the 99.95% SLO target."
```

### Error Budget Burn Rate Alerts

```yaml
groups:
  - name: error_budget_alerts
    rules:
      # Fast burn rate (consuming 2% of monthly budget per hour)
      - alert: ErrorBudgetFastBurn
        expr: |
          (
            1 - (
              sum(rate(the_copy_http_requests_total{status_code!~"5.."}[1h]))
              /
              sum(rate(the_copy_http_requests_total[1h]))
            )
          ) > 0.02
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error budget burning too fast"
          description: "Error rate is {{ $value | printf \"%.2f\" }}% per hour. At this rate, the monthly error budget will be exhausted in {{ printf \"%.0f\" (div 1 $value) }} hours."

      # Error Budget < 25% remaining
      - alert: ErrorBudgetLow
        expr: |
          the_copy_slo_error_budget_remaining_ratio{service="api"} < 0.25
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Error budget low"
          description: "Only {{ $value | printf \"%.1f\" }}% of error budget remaining for {{ $labels.service }}."

      # Error Budget Exhausted
      - alert: ErrorBudgetExhausted
        expr: |
          the_copy_slo_error_budget_remaining_ratio < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error budget nearly exhausted"
          description: "Error budget for {{ $labels.service }} is at {{ $value | printf \"%.1f\" }}%. Consider feature freeze."
```

---

## Grafana Dashboard Configuration

### Dashboard JSON

```json
{
  "title": "SLO Dashboard",
  "uid": "slo-dashboard",
  "panels": [
    {
      "title": "API Availability (SLO: 99.9%)",
      "type": "gauge",
      "targets": [
        {
          "expr": "sum(rate(the_copy_http_requests_total{status_code!~\"5..\"}[5m])) / sum(rate(the_copy_http_requests_total[5m])) * 100"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "min": 95,
          "max": 100,
          "thresholds": {
            "steps": [
              { "value": 0, "color": "red" },
              { "value": 99, "color": "yellow" },
              { "value": 99.9, "color": "green" }
            ]
          }
        }
      }
    },
    {
      "title": "API Latency P95 (SLO: <500ms)",
      "type": "gauge",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(the_copy_http_request_duration_ms_bucket[5m])) by (le))"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "min": 0,
          "max": 1000,
          "thresholds": {
            "steps": [
              { "value": 0, "color": "green" },
              { "value": 500, "color": "yellow" },
              { "value": 750, "color": "red" }
            ]
          }
        }
      }
    },
    {
      "title": "Error Budget Remaining",
      "type": "bargauge",
      "targets": [
        {
          "expr": "the_copy_slo_error_budget_remaining_ratio * 100",
          "legendFormat": "{{ service }}"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "min": 0,
          "max": 100,
          "unit": "percent",
          "thresholds": {
            "steps": [
              { "value": 0, "color": "red" },
              { "value": 10, "color": "orange" },
              { "value": 25, "color": "yellow" },
              { "value": 50, "color": "green" }
            ]
          }
        }
      }
    },
    {
      "title": "SLO Compliance Over Time",
      "type": "timeseries",
      "targets": [
        {
          "expr": "the_copy_slo_compliance_ratio{service=\"api\"} * 100",
          "legendFormat": "API Availability"
        },
        {
          "expr": "the_copy_slo_compliance_ratio{service=\"auth\"} * 100",
          "legendFormat": "Auth Success Rate"
        },
        {
          "expr": "the_copy_slo_compliance_ratio{service=\"gemini\"} * 100",
          "legendFormat": "Gemini Success Rate"
        },
        {
          "expr": "the_copy_slo_compliance_ratio{service=\"database\"} * 100",
          "legendFormat": "Database Availability"
        }
      ]
    }
  ]
}
```

---

## Implementation Notes

### Metrics Collection

The SLO metrics are collected via:
- [slo-metrics.middleware.ts](../../backend/src/middleware/slo-metrics.middleware.ts) - Main SLO metrics middleware
- [metrics.middleware.ts](../../backend/src/middleware/metrics.middleware.ts) - Base Prometheus metrics

### Key Metrics

| Metric Name | Type | Description |
|-------------|------|-------------|
| `the_copy_slo_compliance_ratio` | Gauge | Current SLO compliance (0-1) |
| `the_copy_slo_error_budget_remaining_ratio` | Gauge | Remaining error budget (0-1) |
| `the_copy_slo_violations_total` | Counter | Total SLO violations |
| `the_copy_slo_auth_logins_total` | Counter | Auth login attempts by status |

### Calculation Windows

- **Real-time compliance**: 5-minute sliding window
- **Error budget**: 30-day rolling window
- **Alert evaluation**: 2-5 minutes depending on severity

---

## Runbook References

When SLO alerts fire, refer to:
- [EMERGENCY_RUNBOOK.md](./EMERGENCY_RUNBOOK.md) - Emergency response procedures
- [RUNBOOKS.md](./RUNBOOKS.md) - Detailed troubleshooting guides

---

## Review Schedule

- **Weekly**: Review SLO compliance metrics
- **Monthly**: Analyze error budget consumption patterns
- **Quarterly**: Reassess SLO targets based on business needs
