/**
 * Security Logging Middleware
 *
 * Comprehensive security event logging and audit trail
 * Tracks:
 * - Failed authentication attempts
 * - Suspicious activity patterns
 * - Security violations
 * - Rate limit violations
 * - CORS violations
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { captureMessage } from '@/config/sentry';

// Security event types
export enum SecurityEventType {
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_INPUT = 'SUSPICIOUS_INPUT',
  CORS_VIOLATION = 'CORS_VIOLATION',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

// In-memory store for tracking suspicious IPs
// In production, use Redis for distributed tracking
const suspiciousIPs = new Map<string, {
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  events: SecurityEventType[];
}>();

/**
 * Log security event with detailed context
 */
export function logSecurityEvent(
  type: SecurityEventType,
  req: Request,
  details?: Record<string, any>
) {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  const securityEvent = {
    type,
    timestamp: new Date().toISOString(),
    ip: clientIP,
    userAgent,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id || null,
    ...details,
  };

  // Log to Winston logger
  logger.warn('🚨 Security Event', securityEvent);

  // Track suspicious IP
  trackSuspiciousIP(clientIP, type);

  // Send to Sentry for critical events
  if (isCriticalEvent(type)) {
    captureMessage(
      `Security Event: ${type}`,
      'warning',
      securityEvent
    );
  }

  // Auto-ban logic for repeated violations
  if (shouldBanIP(clientIP)) {
    logger.error(`🔒 IP ${clientIP} flagged for automatic blocking due to repeated security violations`);
    captureMessage(
      `IP Auto-Ban Triggered: ${clientIP}`,
      'error',
      { ip: clientIP, violations: suspiciousIPs.get(clientIP) }
    );
  }
}

/**
 * Track suspicious IP addresses
 */
function trackSuspiciousIP(ip: string, event: SecurityEventType) {
  const existing = suspiciousIPs.get(ip);

  if (existing) {
    existing.count++;
    existing.lastSeen = new Date();
    existing.events.push(event);
  } else {
    suspiciousIPs.set(ip, {
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
      events: [event],
    });
  }

  // Clean old entries (older than 24 hours)
  cleanOldEntries();
}

/**
 * Clean old suspicious IP entries
 */
function cleanOldEntries() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const [ip, data] of suspiciousIPs.entries()) {
    if (data.lastSeen < oneDayAgo) {
      suspiciousIPs.delete(ip);
    }
  }
}

/**
 * Check if event is critical
 */
function isCriticalEvent(type: SecurityEventType): boolean {
  return [
    SecurityEventType.SQL_INJECTION_ATTEMPT,
    SecurityEventType.XSS_ATTEMPT,
    SecurityEventType.PATH_TRAVERSAL_ATTEMPT,
  ].includes(type);
}

/**
 * Determine if IP should be banned
 */
function shouldBanIP(ip: string): boolean {
  const data = suspiciousIPs.get(ip);
  if (!data) return false;

  // Ban if more than 10 violations in 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return data.count > 10 && data.firstSeen > oneHourAgo;
}

/**
 * Middleware to log all authentication attempts
 */
export function logAuthAttempts(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Check if this is an auth endpoint response
    if (req.path.includes('/auth/')) {
      if (data.success) {
        logSecurityEvent(
          SecurityEventType.AUTH_SUCCESS,
          req,
          {
            userId: data.data?.id,
            email: data.data?.email,
          }
        );
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        logSecurityEvent(
          SecurityEventType.AUTH_FAILED,
          req,
          {
            email: req.body?.email,
            reason: data.error,
          }
        );
      }
    }

    return originalJson(data);
  };

  next();
}

/**
 * Middleware to detect and log rate limit violations
 */
export function logRateLimitViolations(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send.bind(res);

  res.send = function (data: any) {
    if (res.statusCode === 429) {
      logSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        req,
        {
          path: req.path,
          limit: res.getHeader('X-RateLimit-Limit'),
          remaining: res.getHeader('X-RateLimit-Remaining'),
        }
      );
    }

    return originalSend(data);
  };

  next();
}

/**
 * Get suspicious IPs report
 */
export function getSuspiciousIPsReport() {
  const report: any[] = [];

  for (const [ip, data] of suspiciousIPs.entries()) {
    report.push({
      ip,
      totalViolations: data.count,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
      recentEvents: data.events.slice(-10), // Last 10 events
    });
  }

  return report.sort((a, b) => b.totalViolations - a.totalViolations);
}

/**
 * Clear suspicious IP tracking (for testing)
 */
export function clearSuspiciousIPs() {
  suspiciousIPs.clear();
}
