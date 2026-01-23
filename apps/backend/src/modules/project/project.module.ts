import { Module } from '@nestjs/common';
// Commented out for demo without database
// import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
// import { ProjectEntity } from './entities/project.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([ProjectEntity]), // Commented out for demo
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
