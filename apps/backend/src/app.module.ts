import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { SeoModule } from './modules/seo/seo.module';
import { SerpModule } from './modules/serp/serp.module';
import { CompetitorModule } from './modules/competitor/competitor.module';
import { AiModule } from './modules/ai/ai.module';
import { CroModule } from './modules/cro/cro.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { GscModule } from './modules/integrations/gsc.module';
import { SearchConsoleModule } from './modules/search-console/search-console.module';
import { GuestAuditModule } from './modules/guest-audit/guest-audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { VectorDbModule } from './infrastructure/vector-db/vector-db.module';

/** Use DB/Redis only when configured (skip for local dev without Docker). */
const useDb = !!process.env.DATABASE_URL;
const useRedis = !!process.env.REDIS_URL;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),

    ...(useDb ? [DatabaseModule, GscModule] : []),
    ...(useRedis ? [RedisModule] : []),
    VectorDbModule,

    // Core Feature Modules
    AuthModule,
    UserModule,
    ProjectModule,

    // Analysis Modules
    SeoModule,
    SerpModule,
    CompetitorModule,
    CroModule,

    // AI Module
    AiModule,

    // Platform Modules
    IntegrationsModule,
    SearchConsoleModule, // Search Console dashboard module
    GuestAuditModule.forRoot(), // Works with or without database (graceful fallback)
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
