import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { getRedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    const config = getRedisConfig(configService);
    this.client = new Redis(config);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Enhanced caching methods
  async getCached<T>(key: string): Promise<T | null> {
    return this.getJson<T>(key);
  }

  async setCached<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.setJson(key, value, ttl);
  }

  async deleteCached(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    return this.client.del(...keys);
  }

  async existsCached(key: string): Promise<boolean> {
    return this.exists(key);
  }

  async deleteByKeys(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.client.del(...keys);
  }

  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) {
      return [];
    }
    const values = await this.client.mget(...keys);
    return values.map((val) => (val ? JSON.parse(val) : null));
  }

  async setMultiple<T>(items: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const item of items) {
      if (item.ttl) {
        pipeline.set(item.key, JSON.stringify(item.value), 'EX', item.ttl);
      } else {
        pipeline.set(item.key, JSON.stringify(item.value));
      }
    }
    await pipeline.exec();
  }

  getClient(): Redis {
    return this.client;
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
