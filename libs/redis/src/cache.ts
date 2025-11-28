import { RedisClient } from './client';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class CacheManager {
  constructor(private redis: RedisClient) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    await this.redis.set(key, JSON.stringify(value), ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redis.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    // Note: Using KEYS pattern for development, use SCAN in production
    const keys = await this.redis.client?.keys(pattern) || [];
    for (const key of keys) {
      await this.redis.delete(key);
    }
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }

  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await loader();
    await this.set(key, fresh, options);
    return fresh;
  }
}

// Cache key builders
export const CacheKeys = {
  participant: (id: string) => `participant:${id}`,
  participants: () => 'participants:all',
  dataset: (id: string) => `dataset:${id}`,
  datasets: (participantId: string) => `datasets:${participantId}`,
  schema: (name: string) => `schema:${name}`,
  schemas: () => 'schemas:all',
  vocabulary: (name: string) => `vocabulary:${name}`,
  policy: (id: string) => `policy:${id}`,
  contract: (id: string) => `contract:${id}`,
  credential: (id: string) => `credential:${id}`,
  token: (token: string) => `token:${token}`,
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (clientId: string) => `ratelimit:${clientId}`,
};
