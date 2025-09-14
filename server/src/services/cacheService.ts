import Redis from 'ioredis';
import { logger } from './loggerService';

export class CacheService {
    private redis: Redis;
    private isConnected: boolean = false;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        this.redis.on('connect', () => {
            this.isConnected = true;
            logger.info('Redis connected successfully');
        });

        this.redis.on('error', (error) => {
            this.isConnected = false;
            logger.error('Redis connection error:', error);
        });

        this.redis.on('close', () => {
            this.isConnected = false;
            logger.warn('Redis connection closed');
        });
    }

    async connect(): Promise<void> {
        try {
            await this.redis.connect();
        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.redis.disconnect();
    }

    async get(key: string): Promise<string | null> {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache get');
            return null;
        }

        try {
            return await this.redis.get(key);
        } catch (error) {
            logger.error('Redis get error:', error);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache set');
            return false;
        }

        try {
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, value);
            } else {
                await this.redis.set(key, value);
            }
            return true;
        } catch (error) {
            logger.error('Redis set error:', error);
            return false;
        }
    }

    async del(key: string): Promise<boolean> {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache delete');
            return false;
        }

        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            logger.error('Redis delete error:', error);
            return false;
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Redis exists error:', error);
            return false;
        }
    }

    async flush(): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            await this.redis.flushall();
            return true;
        } catch (error) {
            logger.error('Redis flush error:', error);
            return false;
        }
    }

    async getHash(key: string, field: string): Promise<string | null> {
        if (!this.isConnected) {
            return null;
        }

        try {
            return await this.redis.hget(key, field);
        } catch (error) {
            logger.error('Redis hash get error:', error);
            return null;
        }
    }

    async setHash(key: string, field: string, value: string): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            await this.redis.hset(key, field, value);
            return true;
        } catch (error) {
            logger.error('Redis hash set error:', error);
            return false;
        }
    }

    async getHashAll(key: string): Promise<Record<string, string> | null> {
        if (!this.isConnected) {
            return null;
        }

        try {
            return await this.redis.hgetall(key);
        } catch (error) {
            logger.error('Redis hash get all error:', error);
            return null;
        }
    }

    async setWithTags(key: string, value: string, tags: string[], ttlSeconds?: number): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            // Set the main key
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, value);
            } else {
                await this.redis.set(key, value);
            }

            // Set tags for easy invalidation
            for (const tag of tags) {
                await this.redis.sadd(`tag:${tag}`, key);
                if (ttlSeconds) {
                    await this.redis.expire(`tag:${tag}`, ttlSeconds);
                }
            }

            return true;
        } catch (error) {
            logger.error('Redis set with tags error:', error);
            return false;
        }
    }

    async invalidateByTag(tag: string): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            const keys = await this.redis.smembers(`tag:${tag}`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                await this.redis.del(`tag:${tag}`);
            }
            return true;
        } catch (error) {
            logger.error('Redis invalidate by tag error:', error);
            return false;
        }
    }

    async getKeys(pattern: string): Promise<string[]> {
        if (!this.isConnected) {
            return [];
        }

        try {
            return await this.redis.keys(pattern);
        } catch (error) {
            logger.error('Redis keys error:', error);
            return [];
        }
    }

    async increment(key: string, by: number = 1): Promise<number> {
        if (!this.isConnected) {
            return 0;
        }

        try {
            return await this.redis.incrby(key, by);
        } catch (error) {
            logger.error('Redis increment error:', error);
            return 0;
        }
    }

    async decrement(key: string, by: number = 1): Promise<number> {
        if (!this.isConnected) {
            return 0;
        }

        try {
            return await this.redis.decrby(key, by);
        } catch (error) {
            logger.error('Redis decrement error:', error);
            return 0;
        }
    }

    async expire(key: string, ttlSeconds: number): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            const result = await this.redis.expire(key, ttlSeconds);
            return result === 1;
        } catch (error) {
            logger.error('Redis expire error:', error);
            return false;
        }
    }

    async ttl(key: string): Promise<number> {
        if (!this.isConnected) {
            return -1;
        }

        try {
            return await this.redis.ttl(key);
        } catch (error) {
            logger.error('Redis TTL error:', error);
            return -1;
        }
    }

    // Cache key generators
    static generateUserCacheKey(userId: string): string {
        return `user:${userId}`;
    }

    static generatePromptCacheKey(promptId: string): string {
        return `prompt:${promptId}`;
    }

    static generateAICacheKey(model: string, prompt: string, userId: string): string {
        const hash = require('crypto').createHash('md5').update(prompt).digest('hex');
        return `ai:${model}:${hash}:${userId}`;
    }

    static generateAnalyticsCacheKey(type: string, userId: string, date: string): string {
        return `analytics:${type}:${userId}:${date}`;
    }

    static generateCollaborationCacheKey(workspaceId: string): string {
        return `collab:${workspaceId}`;
    }
}

export const cacheService = new CacheService();
