import { Pool } from 'pg';
import type { PoolClient } from 'pg';
/**
 * Initialize database pool
 * @param config Database configuration
 * @returns Pool instance
 */
export declare const initializePool: (config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max?: number;
}) => Pool;
/**
 * Get database pool
 * @returns Pool instance
 */
export declare const getPool: () => Pool;
/**
 * Get a client from the pool
 * @returns PoolClient
 */
export declare const getClient: () => Promise<PoolClient>;
/**
 * Execute a query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export declare const query: (query: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
/**
 * Close the database pool
 */
export declare const closePool: () => Promise<void>;
export { Pool, PoolClient };
//# sourceMappingURL=index.d.ts.map