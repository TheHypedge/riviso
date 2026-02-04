import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';
import { WebsiteVerificationService } from './services/website-verification.service';
import { EntitlementService } from './services/entitlement.service';
import { WebsiteEntity } from '../../infrastructure/database/entities/website.entity';
import { PlanEntity } from '../../infrastructure/database/entities/plan.entity';
import { UserPlanEntity } from '../../infrastructure/database/entities/user-plan.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebsiteEntity, PlanEntity, UserPlanEntity]),
    HttpModule,
    ConfigModule,
    AuthModule,
  ],
  controllers: [WebsiteController],
  providers: [WebsiteService, WebsiteVerificationService, EntitlementService],
  exports: [WebsiteService, EntitlementService],
})
export class WebsiteModule {}
