import { Pool } from 'pg';
import type { PoolClient } from 'pg';

/**
 * Database pool instance
 */
let pool: Pool | null = null;

/**
 * Initialize database pool
 * @param config Database configuration
 * @returns Pool instance
 */
export const initializePool = (config: {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
}): Pool => {
  pool = new Pool(config);
  return pool;
};

/**
 * Get database pool
 * @returns Pool instance
 */
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool first.');
  }
  return pool;
};

/**
 * Get a client from the pool
 * @returns PoolClient
 */
export const getClient = async (): Promise<PoolClient> => {
  return getPool().connect();
};

/**
 * Execute a query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export const query = async (query: string, params?: any[]) => {
  return getPool().query(query, params);
};

/**
 * Close the database pool
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export { Pool, PoolClient };
