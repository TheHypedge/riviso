import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { WorkspaceEntity } from '../entities/workspace.entity';

/**
 * Workspace repository interface
 */
export interface IWorkspaceRepository {
  findByOwnerId(ownerId: string): Promise<WorkspaceEntity[]>;
  findBySlug(slug: string): Promise<WorkspaceEntity | null>;
  addMember(workspaceId: string, userId: string, role: string): Promise<WorkspaceEntity | null>;
  removeMember(workspaceId: string, userId: string): Promise<WorkspaceEntity | null>;
}

/**
 * Workspace repository implementation
 */
@Injectable()
export class WorkspaceRepository
  extends BaseRepository<WorkspaceEntity>
  implements IWorkspaceRepository
{
  constructor(
    @InjectRepository(WorkspaceEntity)
    repository: Repository<WorkspaceEntity>,
  ) {
    super(repository);
  }

  async findByOwnerId(ownerId: string): Promise<WorkspaceEntity[]> {
    return this.repository.find({ where: { ownerId } });
  }

  async findBySlug(slug: string): Promise<WorkspaceEntity | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: string,
  ): Promise<WorkspaceEntity | null> {
    // Implementation placeholder
    return this.findById(workspaceId);
  }

  async removeMember(workspaceId: string, userId: string): Promise<WorkspaceEntity | null> {
    // Implementation placeholder
    return this.findById(workspaceId);
  }
}
