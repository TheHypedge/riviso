import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GSCPropertyEntity } from '../entities/gsc-property.entity';

@Injectable()
export class GSCPropertyRepository {
  constructor(
    @InjectRepository(GSCPropertyEntity)
    private readonly repo: Repository<GSCPropertyEntity>,
  ) {}

  async findByUserId(userId: string): Promise<GSCPropertyEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['googleAccount'],
    });
  }

  async findByUserAndPropertyUrl(
    userId: string,
    gscPropertyUrl: string,
  ): Promise<GSCPropertyEntity | null> {
    return this.repo.findOne({
      where: { userId, gscPropertyUrl },
      relations: ['googleAccount'],
    });
  }

  async findById(id: string): Promise<GSCPropertyEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['googleAccount'],
    });
  }

  async create(data: {
    userId: string;
    websiteId: string | null;
    googleAccountId: string;
    gscPropertyUrl: string;
    permissionLevel: string;
  }): Promise<GSCPropertyEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async updateLastSynced(id: string, at: Date): Promise<void> {
    await this.repo.update(id, { lastSyncedAt: at });
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.repo.delete({ userId });
    return result.affected ?? 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
