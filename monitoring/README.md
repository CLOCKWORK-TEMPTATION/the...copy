# Monitoring Setup - The Copy Application

This directory contains monitoring and observability configurations for The Copy application using Prometheus and Grafana.

## =Ê Overview

The Copy application exposes Prometheus-compatible metrics at the `/metrics` endpoint. These metrics can be scraped by Prometheus and visualized in Grafana.

## =€ Quick Start

### Option 1: Using Docker Compose

1. **Start Prometheus and Grafana:**
   ```bash
   cd monitoring
   docker-compose up -d
   ```

2. **Access the dashboards:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

### Option 2: Manual Setup

#### Install Prometheus

**Linux/Mac:**
```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*
./prometheus --config.file=../monitoring/prometheus.yml
```

**Docker:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

#### Install Grafana

**Docker:**
```bash
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

## =È Available Metrics

### HTTP Metrics
- `the_copy_http_requests_total` - Total HTTP requests
- `the_copy_http_request_duration_ms` - HTTP request duration
- `the_copy_http_active_connections` - Active HTTP connections

### Database Metrics
- `the_copy_db_queries_total` - Total database queries
- `the_copy_db_query_duration_ms` - Database query duration
- `the_copy_db_slow_queries_total` - Slow queries count

### Redis Metrics
- `the_copy_redis_cache_hits_total` - Cache hits
- `the_copy_redis_cache_misses_total` - Cache misses
- `the_copy_redis_memory_usage_bytes` - Redis memory usage
- `the_copy_redis_connected_clients` - Connected clients

### Queue Metrics (BullMQ)
- `the_copy_queue_jobs_total` - Total jobs in queue
- `the_copy_queue_jobs_active` - Active jobs
- `the_copy_queue_jobs_completed` - Completed jobs
- `the_copy_queue_jobs_failed` - Failed jobs

### Gemini API Metrics
- `the_copy_gemini_requests_total` - Total Gemini API requests
- `the_copy_gemini_request_duration_ms` - Gemini request duration
- `the_copy_gemini_cache_hits_total` - Gemini cache hits
- `the_copy_gemini_cache_misses_total` - Gemini cache misses

### System Metrics (Node.js)
- `the_copy_process_cpu_user_seconds_total` - CPU usage
- `the_copy_process_resident_memory_bytes` - Memory usage
- `the_copy_nodejs_eventloop_lag_seconds` - Event loop lag
- `the_copy_nodejs_active_handles_total` - Active handles

## <¯ Grafana Dashboard

### Import Dashboard

1. Open Grafana at http://localhost:3001
2. Login (default: admin/admin)
3. Go to Dashboards ’ Import
4. Upload `monitoring/grafana/dashboards/the-copy-dashboard.json`

### Dashboard Panels

The dashboard includes:
- **System Health**: Overall system status and alerts
- **HTTP Performance**: Request rate, latency, error rate
- **Database Performance**: Query rate, slow queries
- **Redis Cache**: Hit ratio, memory usage
- **Queue Status**: Job distribution and processing
- **Gemini API**: Request rate, cache performance
- **Resource Usage**: CPU, memory, event loop

## = Alerting

### Configure Alerts in Prometheus

Create alert rules in `monitoring/alerts/rules.yml`:

```yaml
groups:
  - name: the-copy-alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(the_copy_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} requests/sec"
```

### Configure Alertmanager

Edit `monitoring/alertmanager.yml` to configure notification channels (Slack, email, etc.)

## =Ê Prometheus Queries

### Useful PromQL Queries

**Error Rate:**
```promql
rate(the_copy_http_requests_total{status_code=~"5.."}[5m])
```

**Average Response Time:**
```promql
rate(the_copy_http_request_duration_ms_sum[5m]) / rate(the_copy_http_request_duration_ms_count[5m])
```

**Cache Hit Ratio:**
```promql
sum(rate(the_copy_redis_cache_hits_total[5m])) / (sum(rate(the_copy_redis_cache_hits_total[5m])) + sum(rate(the_copy_redis_cache_misses_total[5m])))
```

**Queue Throughput:**
```promql
rate(the_copy_queue_jobs_completed[5m])
```

**P95 Response Time:**
```promql
histogram_quantile(0.95, rate(the_copy_http_request_duration_ms_bucket[5m]))
```

## =' Integration with The Copy Dashboard

The Copy application provides its own metrics dashboard at `/metrics-dashboard` which:
- Fetches data from the backend API
- Auto-refreshes every 30 seconds
- Shows real-time system status
- Displays performance alerts and recommendations

**Access:**
```
http://localhost:5000/metrics-dashboard
```

## =3 Docker Compose Setup

Create `monitoring/docker-compose.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: the-copy-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: the-copy-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
    driver: bridge
```

## =Ú Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Library](https://github.com/siimon/prom-client)
- [BullMQ Metrics](https://docs.bullmq.io/guide/metrics)

## = Troubleshooting

### Metrics endpoint not accessible

Check if the backend server is running:
```bash
curl http://localhost:3000/metrics
```

### Prometheus can't scrape metrics

1. Check Prometheus targets: http://localhost:9090/targets
2. Verify the backend is running on the correct port
3. Check firewall rules

### Grafana dashboard shows no data

1. Verify Prometheus datasource is configured
2. Check Prometheus is scraping successfully
3. Verify metric names match the queries

## =á Security Considerations

1. **Authentication**: The `/metrics` endpoint should be protected in production
2. **Network Security**: Use firewalls to restrict access to Prometheus/Grafana
3. **HTTPS**: Enable TLS for production deployments
4. **Rate Limiting**: Implement rate limiting on metrics endpoints

## =Ý Best Practices

1. **Retention**: Configure appropriate data retention periods
2. **High Cardinality**: Avoid labels with high cardinality (user IDs, timestamps)
3. **Sampling**: Use histograms for latency metrics
4. **Alerting**: Set up meaningful alerts with appropriate thresholds
5. **Documentation**: Keep metric naming consistent and well-documented

---

**Note**: This monitoring setup is designed for development and testing. For production deployments, consider:
- Using managed Prometheus services (AWS Managed Prometheus, Google Cloud Monitoring)
- Implementing authentication and authorization
- Setting up proper data retention and backup policies
- Configuring high availability for Prometheus and Grafana
