/**
 * Multi-Layer Cache Service
 *
 * Implements a two-tier caching strategy:
 * - L1: In-memory LRU cache for ultra-fast access
 * - L2: Redis cache for persistence and distributed caching
 *
 * Features:
 * - Automatic fallback to L1 if Redis is unavailable
 * - TTL (Time To Live) support
 * - Stale-while-revalidate pattern
 * - Cache key generation with hashing
 * - Metrics tracking (hit/miss rates, Redis health)
 * - Sentry performance monitoring integration
 */

import { createClient, RedisClientType } from 'redis';
import crypto from 'crypto';
import { env } from '@/config/env';

// Safe logger import for testing compatibility
let logger: any;
try {
  logger = require('@/utils/logger').logger;
} catch {
  // Fallback logger for testing or when logger is not available
  logger = {
    info: (...args: any[]) => console.log('[INFO]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
    warn: (...args: any[]) => console.warn('[WARN]', ...args),
    debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
  };
}

// Optional Sentry import (only if SENTRY_DSN is configured)
let Sentry: typeof import('@sentry/node') | null = null;
try {
  if (env.SENTRY_DSN) {
    // Dynamic import to avoid errors if @sentry/node is not installed
    const sentryModule = require('@sentry/node');
    Sentry = sentryModule;
  }
} catch {
  // Sentry not installed or not configured - this is fine, monitoring is optional
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheMetrics {
  hits: {
    l1: number;
    l2: number;
    total: number;
  };
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  redisConnectionHealth: {
    status: 'connected' | 'disconnected' | 'error';
    lastCheck: number;
    consecutiveFailures: number;
  };
}

export class CacheService {
  private redis: RedisClientType | null = null;
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly MAX_MEMORY_CACHE_SIZE = 100; // Maximum items in L1 cache
  private readonly DEFAULT_TTL = 1800; // 30 minutes in seconds
  private readonly MAX_TTL = 86400; // 24 hours maximum
  private readonly MAX_VALUE_SIZE = 1024 * 1024; // 1MB maximum value size
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metrics: CacheMetrics = {
    hits: {
      l1: 0,
      l2: 0,
      total: 0,
    },
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    redisConnectionHealth: {
      status: 'disconnected',
      lastCheck: Date.now(),
      consecutiveFailures: 0,
    },
  };

  constructor() {
    this.initializeRedis();
    this.startMemoryCacheCleanup();
  }

  /**
   * Initialize Redis connection with retry strategy
   * Supports both REDIS_URL and individual REDIS_HOST/PORT/PASSWORD
   */
  private initializeRedis(): void {
    try {
      // Prefer REDIS_URL if provided, otherwise construct from individual variables
      let redisConfig: any;

      if (process.env.REDIS_URL) {
        redisConfig = {
          url: process.env.REDIS_URL,
        };
      } else {
        redisConfig = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        };
      }

      // Add retry strategy
      redisConfig.retry_strategy = (options: any) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis connection refused');
          return new Error('Redis Server Connection Error');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        // reconnect after
        const delay = Math.min(options.attempt * 100, 3000);
        logger.debug(`Redis retry attempt ${options.attempt}, delay: ${delay}ms`);
        return delay;
      };

      this.redis = createClient(redisConfig);

      this.redis.on('error', (error) => {
        logger.warn('Redis connection error, falling back to memory cache:', error.message);
        this.updateRedisHealth('error');
        this.metrics.errors++;

        // Report to Sentry if configured
        if (Sentry) {
          Sentry.captureException(error, {
            tags: { component: 'cache-service', layer: 'redis' },
            level: 'warning',
          });
        }
      });

      this.redis.on('connect', () => {
        logger.info('Redis cache connected successfully');
        this.updateRedisHealth('connected');
      });

      this.redis.on('end', () => {
        logger.warn('Redis connection closed');
        this.updateRedisHealth('disconnected');
      });

      // Attempt to connect
      this.redis.connect().catch((error) => {
        logger.warn('Redis initial connection failed, using memory cache only:', error.message);
        this.updateRedisHealth('error');
        this.redis = null;
      });

    } catch (error) {
      logger.warn('Redis initialization failed, using memory cache only:', error);
      this.updateRedisHealth('error');
      this.redis = null;
      this.metrics.errors++;
    }
  }

  /**
   * Update Redis connection health status
   */
  private updateRedisHealth(status: 'connected' | 'disconnected' | 'error'): void {
    this.metrics.redisConnectionHealth.status = status;
    this.metrics.redisConnectionHealth.lastCheck = Date.now();
    
    if (status === 'error' || status === 'disconnected') {
      this.metrics.redisConnectionHealth.consecutiveFailures++;
    } else {
      this.metrics.redisConnectionHealth.consecutiveFailures = 0;
    }
  }

  /**
   * Generate a cache key from prefix and data
   */
  generateKey(prefix: string, data: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
    return `${prefix}:${hash}`;
  }

  /**
   * Get value from cache (L1 -> L2 -> null)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try L1 cache first
      const memEntry = this.memoryCache.get(key);
      if (memEntry) {
        const age = Date.now() - memEntry.timestamp;
        const maxAge = memEntry.ttl * 1000;

        if (age < maxAge) {
          logger.debug(`Cache hit (L1): ${key}`);
          this.metrics.hits.l1++;
          this.metrics.hits.total++;
          
          
          return memEntry.data as T;
        } else {
          // Expired, remove from L1
          this.memoryCache.delete(key);
        }
      }

      // Try L2 (Redis) cache
      if (this.redis && this.redis.isOpen) {
        const redisStartTime = Date.now();
        try {
          const value = await this.redis.get(key);
          const redisLatency = Date.now() - redisStartTime;
          
          if (value) {
            logger.debug(`Cache hit (L2): ${key}`);
            const parsed = JSON.parse(value) as T;

            // Populate L1 cache
            this.setMemoryCache(key, parsed, this.DEFAULT_TTL);

            this.metrics.hits.l2++;
            this.metrics.hits.total++;
            this.updateRedisHealth('connected');
            

            return parsed;
          }
        } catch (redisError) {
          logger.error('Redis get error:', redisError);
          this.metrics.errors++;
          this.updateRedisHealth('error');
          
          if (Sentry) {
            Sentry.captureException(redisError, {
              tags: { component: 'cache-service', operation: 'get', layer: 'redis' },
              level: 'warning',
            });
          }
        }
      }

      logger.debug(`Cache miss: ${key}`);
      this.metrics.misses++;
      
      
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      this.metrics.errors++;
      
      
      if (Sentry) {
        Sentry.captureException(error, {
          tags: { component: 'cache-service', operation: 'get' },
        });
      }
      
      return null;
    }
  }

  /**
   * Set value in cache (L1 + L2)
   */
  async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      // Validate TTL
      if (ttl <= 0 || ttl > this.MAX_TTL) {
        logger.warn(`Invalid TTL ${ttl}, using default: ${this.DEFAULT_TTL}`);
        ttl = this.DEFAULT_TTL;
      }

      // Validate value size
      const serialized = JSON.stringify(value);
      if (serialized.length > this.MAX_VALUE_SIZE) {
        logger.warn(`Value too large (${serialized.length} bytes), skipping cache`);
        return;
      }

      // Set in L1 (memory)
      this.setMemoryCache(key, value, ttl);

      // Set in L2 (Redis)
      if (this.redis && this.redis.isOpen) {
        const redisStartTime = Date.now();
        try {
          await this.redis.setEx(key, ttl, serialized);
          const redisLatency = Date.now() - redisStartTime;
          
          logger.debug(`Cache set (L1+L2): ${key}, TTL: ${ttl}s`);
          this.metrics.sets++;
          this.updateRedisHealth('connected');
          
        } catch (redisError) {
          logger.error('Redis set error:', redisError);
          this.metrics.errors++;
          this.updateRedisHealth('error');
          
          
          if (Sentry) {
            Sentry.captureException(redisError, {
              tags: { component: 'cache-service', operation: 'set', layer: 'redis' },
              level: 'warning',
            });
          }
        }
      } else {
        logger.debug(`Cache set (L1 only): ${key}, TTL: ${ttl}s`);
        this.metrics.sets++;
        
      }
    } catch (error) {
      logger.error('Cache set error:', error);
      this.metrics.errors++;
      
      
      if (Sentry) {
        Sentry.captureException(error, {
          tags: { component: 'cache-service', operation: 'set' },
        });
      }
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from L1
      this.memoryCache.delete(key);

      // Delete from L2
      if (this.redis && this.redis.isOpen) {
        await this.redis.del(key);
      }

      this.metrics.deletes++;
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
      this.metrics.errors++;
      
      if (Sentry) {
        Sentry.captureException(error, {
          tags: { component: 'cache-service', operation: 'delete' },
          level: 'warning',
        });
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Clear specific pattern
        const keysToDelete: string[] = [];

        this.memoryCache.forEach((_, key) => {
          if (key.startsWith(pattern)) {
            keysToDelete.push(key);
          }
        });

        keysToDelete.forEach(key => this.memoryCache.delete(key));

        if (this.redis && this.redis.isOpen) {
          const keys = await this.redis.keys(`${pattern}*`);
          if (keys.length > 0) {
            await this.redis.del(keys);
          }
        }

        logger.info(`Cache cleared for pattern: ${pattern}`);
      } else {
        // Clear all
        this.memoryCache.clear();

        if (this.redis && this.redis.isOpen) {
          await this.redis.flushDb();
        }

        logger.info('All cache cleared');
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Set value in L1 memory cache with LRU eviction
   */
  private setMemoryCache<T>(key: string, value: T, ttl: number): void {
    // Implement simple LRU: if cache is full, remove oldest entry
    if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Start periodic cleanup of expired memory cache entries
   */
  private startMemoryCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.memoryCache.forEach((entry, key) => {
        const age = now - entry.timestamp;
        const maxAge = entry.ttl * 1000;

        if (age >= maxAge) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.memoryCache.delete(key));

      if (keysToDelete.length > 0) {
        logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
      }
    }, 60000); // Run every minute
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    redisStatus: string;
    metrics: CacheMetrics;
    hitRate: number;
  } {
    const totalRequests = this.metrics.hits.total + this.metrics.misses;
    const hitRate = totalRequests > 0 
      ? (this.metrics.hits.total / totalRequests) * 100 
      : 0;

    return {
      memorySize: this.memoryCache.size,
      redisStatus: this.redis?.isOpen ? 'connected' : 'disconnected',
      metrics: { ...this.metrics },
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    this.metrics = {
      hits: {
        l1: 0,
        l2: 0,
        total: 0,
      },
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      redisConnectionHealth: {
        ...this.metrics.redisConnectionHealth,
      },
    };
  }

  /**
   * Disconnect Redis and cleanup resources
   */
  async disconnect(): Promise<void> {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Disconnect Redis
    if (this.redis) {
      await this.redis.disconnect();
      this.redis = null;
    }

    // Clear memory cache
    this.memoryCache.clear();
    
    logger.info('Cache service disconnected and cleaned up');
  }
}

// Export singleton instance
export const cacheService = new CacheService();
