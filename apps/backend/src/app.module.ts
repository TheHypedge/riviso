import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { SeoModule } from './modules/seo/seo.module';
import { SerpModule } from './modules/serp/serp.module';
import { CompetitorModule } from './modules/competitor/competitor.module';
import { AiModule } from './modules/ai/ai.module';
import { CroModule } from './modules/cro/cro.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { OpenSearchModule } from './infrastructure/opensearch/opensearch.module';
import { VectorDbModule } from './infrastructure/vector-db/vector-db.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Infrastructure (commented out for demo without Docker)
    // DatabaseModule,
    // RedisModule,
    // OpenSearchModule,
    VectorDbModule, // This one is just an interface, doesn't need actual connection

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
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
