import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GSCSyncLogEntity, GSCSyncStatus } from '../entities/gsc-sync-log.entity';

@Injectable()
export class GSCSyncLogRepository {
  constructor(
    @InjectRepository(GSCSyncLogEntity)
    private readonly repo: Repository<GSCSyncLogEntity>,
  ) {}

  async create(data: {
    gscPropertyId: string;
    startedAt: Date;
    status: GSCSyncStatus;
  }): Promise<GSCSyncLogEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: {
      completedAt?: Date;
      status?: GSCSyncStatus;
      rowCount?: number;
      errorMessage?: string | null;
    },
  ): Promise<void> {
    await this.repo.update(id, data as Partial<GSCSyncLogEntity>);
  }

  async findByGscPropertyId(
    gscPropertyId: string,
    limit = 10,
  ): Promise<GSCSyncLogEntity[]> {
    return this.repo.find({
      where: { gscPropertyId },
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }
}
