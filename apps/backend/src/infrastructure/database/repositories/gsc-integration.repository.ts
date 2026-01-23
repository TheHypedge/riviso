import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GSCIntegrationEntity } from '../entities/gsc-integration.entity';
import { BaseRepository } from './base.repository';

export interface IGSCIntegrationRepository {
  findByUserId(userId: string): Promise<GSCIntegrationEntity | null>;
  findBySiteUrl(siteUrl: string): Promise<GSCIntegrationEntity | null>;
  findActiveByUserId(userId: string): Promise<GSCIntegrationEntity | null>;
  deactivateAllForUser(userId: string): Promise<void>;
}

@Injectable()
export class GSCIntegrationRepository 
  extends BaseRepository<GSCIntegrationEntity> 
  implements IGSCIntegrationRepository 
{
  constructor(
    @InjectRepository(GSCIntegrationEntity)
    private gscRepository: Repository<GSCIntegrationEntity>,
  ) {
    super(gscRepository);
  }

  async findByUserId(userId: string): Promise<GSCIntegrationEntity | null> {
    return this.repository.findOne({
      where: { userId },
      order: { connectedAt: 'DESC' },
    });
  }

  async findBySiteUrl(siteUrl: string): Promise<GSCIntegrationEntity | null> {
    return this.repository.findOne({
      where: { siteUrl },
    });
  }

  async findActiveByUserId(userId: string): Promise<GSCIntegrationEntity | null> {
    return this.repository.findOne({
      where: { userId, isActive: true },
      order: { connectedAt: 'DESC' },
    });
  }

  async deactivateAllForUser(userId: string): Promise<void> {
    await this.repository.update(
      { userId },
      { isActive: false }
    );
  }
}
