import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestAuditController } from './guest-audit.controller';
import { GuestAuditService } from './guest-audit.service';
import { GuestAuditEntity } from '../../infrastructure/database/entities/guest-audit.entity';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [SeoModule],
  controllers: [GuestAuditController],
  providers: [GuestAuditService],
  exports: [GuestAuditService],
})
export class GuestAuditModule {
  static forRoot(): DynamicModule {
    const useDb = !!process.env.DATABASE_URL;
    
    return {
      module: GuestAuditModule,
      imports: [
        ...(useDb ? [TypeOrmModule.forFeature([GuestAuditEntity])] : []),
        SeoModule,
      ],
      controllers: [GuestAuditController],
      providers: [GuestAuditService],
      exports: [GuestAuditService],
    };
  }
}
