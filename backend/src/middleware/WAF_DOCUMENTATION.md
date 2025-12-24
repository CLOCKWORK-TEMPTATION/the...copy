# Web Application Firewall (WAF) Documentation

## Overview

This document describes the Web Application Firewall (WAF) implementation for the Directors Studio backend. The WAF provides comprehensive protection against common web attacks based on OWASP Core Rule Set (CRS).

## Features

### Protection Categories

| Category | OWASP CRS ID | Description |
|----------|--------------|-------------|
| SQL Injection | 942xxx | Protects against SQL injection attacks |
| XSS | 941xxx | Protects against Cross-Site Scripting attacks |
| Command Injection | 932xxx | Protects against OS command injection |
| Path Traversal | 930xxx | Protects against directory traversal attacks |
| Protocol Attacks | 921xxx | Protects against HTTP protocol violations |
| Bot Protection | BOTxxx | Detects and blocks malicious bots |

### Additional Features

- **IP Blocking**: Runtime IP blacklisting
- **Rate Limiting**: Request rate limiting per IP
- **Custom Rules**: Add custom detection rules
- **Logging & Alerts**: Comprehensive event logging
- **Whitelist Support**: IP and path whitelisting
- **Monitor Mode**: Log-only mode for testing

## Configuration

### Default Configuration

```typescript
const defaultWAFConfig = {
  enabled: true,
  mode: "monitor", // "block" in production
  logLevel: "standard", // "minimal" | "standard" | "verbose"
  rules: {
    sqlInjection: true,
    xss: true,
    commandInjection: true,
    pathTraversal: true,
    protocolAttack: true,
    botProtection: true,
    rateLimit: true,
  },
  whitelist: {
    ips: ["127.0.0.1", "::1"],
    paths: ["/health", "/health/live", "/health/ready", "/metrics"],
    userAgents: [],
  },
  blacklist: {
    ips: [],
    countries: [],
    userAgents: ["sqlmap", "nikto", "nmap", "masscan", "zgrab"],
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    blockDurationMs: 300000, // 5 minutes
  },
  customRules: [],
};
```

### Environment-Based Behavior

- **Development**: WAF runs in `monitor` mode (logs attacks but doesn't block)
- **Production**: WAF runs in `block` mode (blocks detected attacks)
- **Test**: WAF is configurable per test

## API Endpoints

### Get WAF Statistics
```http
GET /api/waf/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 150,
    "blockedRequests": 45,
    "monitoredRequests": 105,
    "eventsByType": {
      "SQL_INJECTION": 20,
      "XSS_ATTACK": 15,
      "BOT_DETECTED": 10
    },
    "eventsBySeverity": {
      "critical": 10,
      "high": 25,
      "medium": 60,
      "low": 55
    },
    "topBlockedIPs": [
      { "ip": "192.168.1.100", "count": 15 }
    ]
  }
}
```

### Get WAF Events
```http
GET /api/waf/events?limit=100
Authorization: Bearer <token>
```

### Get WAF Configuration
```http
GET /api/waf/config
Authorization: Bearer <token>
```

### Update WAF Configuration
```http
PUT /api/waf/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "mode": "block",
  "rules": {
    "sqlInjection": true
  }
}
```

### Get Blocked IPs
```http
GET /api/waf/blocked-ips
Authorization: Bearer <token>
```

### Block IP
```http
POST /api/waf/block-ip
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "reason": "Repeated attack attempts"
}
```

### Unblock IP
```http
POST /api/waf/unblock-ip
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

## Detection Rules

### SQL Injection (942xxx)

| Rule ID | Name | Severity |
|---------|------|----------|
| 942100 | SQL Injection via libinjection | Critical |
| 942110 | Common Injection Testing | Critical |
| 942120 | SQL Operator Detection | High |
| 942130 | SQL Tautology Detection | High |
| 942140 | DB Names Detection | Critical |

**Examples of blocked payloads:**
- `SELECT * FROM users WHERE id=1`
- `1' OR '1'='1`
- `UNION SELECT username, password FROM users`
- `'; DROP TABLE users--`

### XSS (941xxx)

| Rule ID | Name | Severity |
|---------|------|----------|
| 941100 | XSS via libinjection | Critical |
| 941110 | Script Tag Vector | Critical |
| 941120 | Event Handler Vector | High |
| 941130 | Attribute Vector | High |
| 941140 | JavaScript URI Vector | High |
| 941150 | Dangerous HTML Tags | Medium |

**Examples of blocked payloads:**
- `<script>alert('xss')</script>`
- `<img src=x onerror=alert(1)>`
- `javascript:alert('xss')`
- `<svg onload=alert(1)>`

### Command Injection (932xxx)

| Rule ID | Name | Severity |
|---------|------|----------|
| 932100 | Unix Command Injection | Critical |
| 932110 | Windows Command Injection | Critical |
| 932120 | Shell Injection | Critical |

**Examples of blocked payloads:**
- `; cat /etc/passwd`
- `| ls -la`
- `$(whoami)`
- `&& rm -rf /`

### Path Traversal (930xxx)

| Rule ID | Name | Severity |
|---------|------|----------|
| 930100 | Path Traversal (/../) | Critical |
| 930110 | OS File Access | Critical |
| 930120 | Encoded Traversal | High |

**Examples of blocked payloads:**
- `../../../etc/passwd`
- `%2e%2e%2f%2e%2e%2f`
- `/proc/self/environ`

### Bot Detection (BOTxxx)

| Rule ID | Name | Severity |
|---------|------|----------|
| BOT100 | Malicious Bot User-Agent | High |
| BOT110 | Missing User-Agent | Low |
| BOT120 | Automated Request Pattern | Low |

**Blocked User-Agents:**
- sqlmap, nikto, nmap, masscan, zgrab
- burp, hydra, gobuster, nuclei, acunetix

## Custom Rules

### Adding Custom Rules

```typescript
import { addCustomRule, WAFRule } from '@/middleware/waf.middleware';

const customRule: WAFRule = {
  id: "CUSTOM001",
  name: "Block Sensitive Keywords",
  description: "Blocks requests containing sensitive keywords",
  pattern: /sensitive-keyword/gi,
  locations: ["body", "query"],
  action: "block",
  severity: "high",
  enabled: true,
};

addCustomRule(customRule);
```

### Rule Locations

- `body`: Request body (JSON)
- `query`: URL query parameters
- `headers`: HTTP headers
- `path`: URL path
- `cookies`: Request cookies

### Rule Actions

- `block`: Block the request (403 Forbidden)
- `monitor`: Log only, allow request
- `challenge`: Reserved for future CAPTCHA integration

### Severity Levels

- `critical`: Immediate threat, always block
- `high`: Serious threat, block by default
- `medium`: Potential threat, configurable
- `low`: Informational, monitor only

## Logging

### Log Levels

1. **minimal**: Basic event info only
2. **standard**: Event info + IP, path, method
3. **verbose**: Full details including matched values

### WAF Event Structure

```typescript
interface WAFEvent {
  timestamp: Date;
  eventType: WAFEventType;
  ruleId: string;
  ruleName: string;
  severity: string;
  ip: string;
  method: string;
  path: string;
  userAgent: string;
  matchedValue: string;
  action: "blocked" | "monitored" | "challenged";
  details: Record<string, unknown>;
}
```

### Event Types

- `SQL_INJECTION`
- `XSS_ATTACK`
- `COMMAND_INJECTION`
- `PATH_TRAVERSAL`
- `PROTOCOL_ATTACK`
- `BOT_DETECTED`
- `RATE_LIMIT_EXCEEDED`
- `IP_BLOCKED`
- `GEO_BLOCKED`
- `CUSTOM_RULE_MATCH`

## Alert Integration

### Registering Alert Callbacks

```typescript
import { onWAFAlert, WAFEvent } from '@/middleware/waf.middleware';

onWAFAlert((event: WAFEvent) => {
  // Send to Slack, PagerDuty, etc.
  if (event.severity === 'critical') {
    sendSlackAlert(`Critical WAF Alert: ${event.ruleName}`);
  }
});
```

## Rate Limiting

### Configuration

```typescript
updateWAFConfig({
  rateLimit: {
    windowMs: 60000,      // Time window (1 minute)
    maxRequests: 100,      // Max requests per window
    blockDurationMs: 300000, // Block duration (5 minutes)
  },
});
```

### Behavior

1. Each IP has a request counter
2. Counter resets after `windowMs`
3. If exceeded, IP is blocked for `blockDurationMs`
4. `X-RateLimit-Remaining` header shows remaining requests

## Testing

### Running WAF Tests

```bash
cd backend
pnpm test src/middleware/waf.middleware.test.ts
```

### Test Categories

1. **Basic Functionality**: Enable/disable, whitelist/blacklist
2. **SQL Injection Detection**: Various payload types
3. **XSS Detection**: Script tags, event handlers, etc.
4. **Command Injection**: Unix/Windows commands
5. **Path Traversal**: Directory traversal patterns
6. **Bot Detection**: Malicious user agents
7. **Rate Limiting**: Request throttling
8. **Custom Rules**: Adding/removing rules
9. **Edge Cases**: Empty payloads, null values

## Best Practices

### Production Deployment

1. **Start in Monitor Mode**: Deploy with `mode: "monitor"` first
2. **Review Logs**: Analyze WAF events for false positives
3. **Tune Rules**: Disable rules causing false positives
4. **Switch to Block**: Enable `mode: "block"` after tuning
5. **Monitor Continuously**: Set up alerts for critical events

### Performance Considerations

1. WAF adds minimal latency (~1-5ms per request)
2. Rate limit store is in-memory (use Redis for distributed)
3. Event log is limited to 10,000 entries
4. Complex regex patterns may impact large payloads

### Security Recommendations

1. Keep WAF enabled in production
2. Use verbose logging for incident investigation
3. Set up alerts for critical severity events
4. Regularly review and update custom rules
5. Block IPs showing repeated attack patterns
6. Consider geo-blocking for regions not served

## Troubleshooting

### Common Issues

**Issue**: Legitimate requests being blocked
- Check if request matches any rules
- Add path or IP to whitelist
- Disable specific rule if too aggressive

**Issue**: Attacks not being detected
- Verify WAF is enabled
- Check if rule category is enabled
- Verify request location (body/query/headers)

**Issue**: High memory usage
- Reduce MAX_WAF_EVENTS limit
- Clear old rate limit entries
- Use Redis for distributed storage

### Debug Mode

```typescript
updateWAFConfig({
  logLevel: "verbose",
  mode: "monitor",
});
```

This logs full request details for debugging.

## Future Improvements

1. **Redis Integration**: Distributed rate limiting and event storage
2. **Geo-blocking**: Country-based blocking using IP geolocation
3. **CAPTCHA Challenge**: Interactive verification for suspicious requests
4. **Machine Learning**: Anomaly detection for unknown attack patterns
5. **Dashboard**: Web UI for WAF management
6. **Metrics Export**: Prometheus metrics for WAF events
