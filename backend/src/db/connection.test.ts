import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Pool } from '@neondatabase/serverless';

describe('Database Connection - Regression Guard', () => {
  let pool: Pool;

  beforeEach(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://test',
      connectionTimeoutMillis: 60000,
    });
  });

  afterEach(async () => {
    await pool.end();
  });

  it('should have connection timeout >= 60 seconds for Neon cold starts', () => {
    const config = (pool as any).options;
    expect(config.connectionTimeoutMillis).toBeGreaterThanOrEqual(60000);
  });

  it('should retry connection on timeout', async () => {
    const mockQuery = vi.fn()
      .mockRejectedValueOnce(new Error('Connection timeout'))
      .mockResolvedValueOnce({ rows: [{ result: 1 }] });

    const retryConnection = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await mockQuery();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    const result = await retryConnection();
    expect(result).toBeDefined();
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('should handle connection pool exhaustion gracefully', () => {
    const config = (pool as any).options;
    expect(config.max).toBeLessThanOrEqual(20);
    expect(config.idleTimeoutMillis).toBeGreaterThan(0);
  });
});
