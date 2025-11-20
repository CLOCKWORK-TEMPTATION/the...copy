import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { env, isProduction } from '@/config/env';
import * as schema from './schema';
import { logger } from '@/utils/logger';
import ws from 'ws';

// Configure Neon for WebSocket (required for serverless environments)
if (isProduction) {
  neonConfig.webSocketConstructor = ws;
}

/**
 * Production Database Security Configuration
 *
 * IMPORTANT: For production deployment, ensure the following:
 *
 * 1. Database User Permissions (Least Privilege):
 *    - Create a dedicated database user for the application
 *    - Grant only necessary permissions (SELECT, INSERT, UPDATE, DELETE)
 *    - DO NOT use database superuser credentials
 *    - Example SQL:
 *      CREATE USER the_copy_app WITH PASSWORD 'strong-password';
 *      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO the_copy_app;
 *      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO the_copy_app;
 *
 * 2. Network Security:
 *    - Enable SSL/TLS for database connections
 *    - Configure firewall to allow only application server IPs
 *    - Use VPC/private network when possible
 *
 * 3. Connection Pooling:
 *    - Set max connections limit to prevent exhaustion
 *    - Configure connection timeout
 *    - Monitor connection pool usage
 *
 * 4. Backup & Recovery:
 *    - Enable automated daily backups
 *    - Test backup restoration regularly
 *    - Configure point-in-time recovery (PITR)
 *
 * 5. Monitoring:
 *    - Enable query logging for slow queries
 *    - Monitor connection pool metrics
 *    - Set up alerts for abnormal activity
 */

// Database connection pool configuration
const poolConfig = {
  connectionString: env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 60000, // Timeout after 60 seconds (Neon cold start needs more time)
};

// Create connection pool
let pool: Pool | null = null;

// Mock database for testing
const mockDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([]),
        orderBy: () => Promise.resolve([]),
      }),
      orderBy: () => Promise.resolve([]),
      limit: () => Promise.resolve([]),
    }),
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ id: 'mock-id', createdAt: new Date() }]),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([{ id: 'mock-id', updatedAt: new Date() }]),
      }),
    }),
  }),
  delete: () => ({
    where: () => Promise.resolve(),
  }),
};

// Initialize database connection
function initializeDatabase() {
  if (env.NODE_ENV === 'test') {
    logger.info('Using mock database for testing');
    return mockDb as any;
  }

  if (!env.DATABASE_URL) {
    logger.warn('DATABASE_URL not set, using mock database');
    return mockDb as any;
  }

  try {
    pool = new Pool(poolConfig);

    // Test connection with retry logic
    const testConnection = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await pool!.query('SELECT 1');
          logger.info('Database connection established successfully', {
            maxConnections: poolConfig.max,
            environment: env.NODE_ENV,
            attempt: i + 1,
          });
          return;
        } catch (error) {
          if (i === retries - 1) {
            logger.error('Database connection test failed after all retries:', error);
          } else {
            logger.warn(`Database connection attempt ${i + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    };
    
    testConnection();

    const dbInstance = drizzle(pool, { schema });
    return dbInstance;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    logger.warn('Falling back to mock database');
    return mockDb as any;
  }
}

// Initialize and export database instance
const db: ReturnType<typeof drizzle> = initializeDatabase() as ReturnType<typeof drizzle>;

// Export database instance (backwards compatible)
export { db, pool };

// Graceful shutdown handler for database connections
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    logger.info('Database connections closed');
  }
}
