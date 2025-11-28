import { Pool, PoolClient } from 'pg';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * Database pool instance
 */
let pool: Pool | null = null;

/**
 * Get database configuration from environment variables
 */
export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'dataspace_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

/**
 * Initialize database pool
 */
export const initializePool = (config?: DatabaseConfig): Pool => {
  const finalConfig = config || getDatabaseConfig();

  pool = new Pool({
    host: finalConfig.host,
    port: finalConfig.port,
    database: finalConfig.database,
    user: finalConfig.user,
    password: finalConfig.password,
    max: finalConfig.max || 20,
    idleTimeoutMillis: finalConfig.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: finalConfig.connectionTimeoutMillis || 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

/**
 * Get database pool instance
 */
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool first.');
  }
  return pool;
};

/**
 * Get a client from the pool
 */
export const getClient = async (): Promise<PoolClient> => {
  return getPool().connect();
};

/**
 * Execute a query
 */
export const query = async (sql: string, params?: any[]) => {
  return getPool().query(sql, params);
};

/**
 * Execute a query with client
 */
export const queryWithClient = async (
  client: PoolClient,
  sql: string,
  params?: any[]
) => {
  return client.query(sql, params);
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

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
};

export { Pool, PoolClient };
