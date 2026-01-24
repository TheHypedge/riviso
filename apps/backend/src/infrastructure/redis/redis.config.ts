import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

/**
 * Parse REDIS_URL format: redis://default:password@host:port
 * This is useful when Railway provides REDIS_URL instead of individual variables
 */
export function getRedisConfig(configService: ConfigService): RedisOptions {
  const redisUrl = configService.get('REDIS_URL');
  
  // If REDIS_URL is provided (Railway format), parse it
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      };
    } catch (error) {
      console.warn('Failed to parse REDIS_URL, falling back to individual env variables');
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD'),
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  };
}
