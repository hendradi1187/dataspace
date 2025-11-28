import { createClient, RedisClientType } from 'redis';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  maxRetries?: number;
  retryStrategy?: (retries: number) => number;
}

class RedisClient {
  private client: RedisClientType | null = null;
  private config: RedisConfig;

  constructor(config: RedisConfig) {
    this.config = {
      database: 0,
      maxRetries: 10,
      ...config,
    };
  }

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.database,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > (this.config.maxRetries || 10)) {
              logger.error('Max Redis connection retries exceeded');
              return new Error('Max Redis connection retries exceeded');
            }
            return Math.min(retries * 50, 500);
          },
        },
      } as any);

      this.client.on('error', (err) => logger.error('Redis error:', err));
      this.client.on('connect', () => logger.info('Redis connected'));
      this.client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

      await this.client.connect();
      logger.info(`Redis connected to ${this.config.host}:${this.config.port}`);
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      logger.info('Redis disconnected');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    expirationSeconds?: number
  ): Promise<void> {
    if (!this.client) throw new Error('Redis client not connected');

    if (expirationSeconds) {
      await this.client.setEx(key, expirationSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJSON<T>(
    key: string,
    value: T,
    expirationSeconds?: number
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), expirationSeconds);
  }

  async delete(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis client not connected');
    return (await this.client.exists(key)) > 0;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) throw new Error('Redis client not connected');
    return (await this.client.expire(key, seconds)) > 0;
  }

  async ttl(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.incr(key);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.incrBy(key, amount);
  }

  async decr(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.decr(key);
  }

  async decrBy(key: string, amount: number): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.decrBy(key, amount);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.lPush(key, values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.rPush(key, values);
  }

  async lpop(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.lPop(key);
  }

  async rpop(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.rPop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.lRange(key, start, stop);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.hGet(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.hGetAll(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.hDel(key, field);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.sAdd(key, members);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.sMembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.sIsMember(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.sRem(key, member);
  }

  async flushdb(): Promise<void> {
    if (!this.client) throw new Error('Redis client not connected');
    await this.client.flushDb();
    logger.info('Redis database flushed');
  }

  async ping(): Promise<string> {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client.ping();
  }
}

export { RedisClient, RedisConfig };
