import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Parse DATABASE_URL format: postgresql://user:password@host:port/database
 * This is useful when Railway provides DATABASE_URL instead of individual variables
 */
export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const databaseUrl = configService.get('DATABASE_URL');
  
  // If DATABASE_URL is provided (Railway format), parse it
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        type: 'postgres',
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
        autoLoadEntities: true,
        synchronize: false, // Use migrations in production
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      };
    } catch (error) {
      console.warn('Failed to parse DATABASE_URL, falling back to individual env variables');
    }
  }
  
  // Fallback to individual environment variables
  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST') || 'localhost',
    port: configService.get('DATABASE_PORT') || 5432,
    username: configService.get('DATABASE_USER') || 'postgres',
    password: configService.get('DATABASE_PASSWORD') || 'postgres',
    database: configService.get('DATABASE_NAME') || 'riviso',
    autoLoadEntities: true,
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  };
}
