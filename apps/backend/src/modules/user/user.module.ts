import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserIntegrationsStore } from './user-integrations.store';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, UserIntegrationsStore],
  exports: [UserService],
})
export class UserModule {}
