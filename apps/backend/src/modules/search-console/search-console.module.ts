import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchConsoleController } from './search-console.controller';
import { SearchConsoleService } from './search-console.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [ConfigModule, IntegrationsModule, SeoModule],
  controllers: [SearchConsoleController],
  providers: [SearchConsoleService],
  exports: [SearchConsoleService],
})
export class SearchConsoleModule {}
