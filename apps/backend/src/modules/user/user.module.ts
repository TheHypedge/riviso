import { Module } from '@nestjs/common';
// Commented out for demo without database
// import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]), // Commented out for demo
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
