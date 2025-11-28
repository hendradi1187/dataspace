import { Pool } from 'pg';
/**
 * Database pool instance
 */
let pool = null;
/**
 * Initialize database pool
 * @param config Database configuration
 * @returns Pool instance
 */
export const initializePool = (config) => {
    pool = new Pool(config);
    return pool;
};
/**
 * Get database pool
 * @returns Pool instance
 */
export const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initializePool first.');
    }
    return pool;
};
/**
 * Get a client from the pool
 * @returns PoolClient
 */
export const getClient = async () => {
    return getPool().connect();
};
/**
 * Execute a query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export const query = async (query, params) => {
    return getPool().query(query, params);
};
/**
 * Close the database pool
 */
export const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
    }
};
export { Pool };
