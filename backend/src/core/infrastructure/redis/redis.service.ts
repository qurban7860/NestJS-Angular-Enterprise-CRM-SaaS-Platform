/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
  const redisUrl = this.config.get<string>('REDIS_URL');

  if (!redisUrl) {
    this.logger.warn('Redis disabled (no REDIS_URL)');
    return;
  }

  this.client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  });

  this.client.on('error', (err) => {
    this.logger.error(`Redis error: ${err.message}`);
  });

  this.client.on('connect', () => {
    this.logger.log('✅ Redis connected');
  });

  this.client.on('reconnecting', () => {
    this.logger.warn('Redis reconnecting...');
  });

  try {
    await this.client.ping(); // better than connect()
  } catch (e) {
    this.logger.error(
      `Failed to connect to Redis: ${e.message}. Continuing without cache.`,
    );
  }
}

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // ── Cache Helpers ────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.client.del(...keys);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * Delete all keys matching a pattern (e.g. 'dashboard:*')
   * Use carefully — SCAN-based, not KEYS
   */
  async delByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) await this.client.del(...keys);
    } while (cursor !== '0');
  }
}
