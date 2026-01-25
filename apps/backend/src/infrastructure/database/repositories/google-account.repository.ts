import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleAccountEntity } from '../entities/google-account.entity';

@Injectable()
export class GoogleAccountRepository {
  constructor(
    @InjectRepository(GoogleAccountEntity)
    private readonly repo: Repository<GoogleAccountEntity>,
  ) {}

  async findByUserId(userId: string): Promise<GoogleAccountEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndEmail(userId: string, email: string): Promise<GoogleAccountEntity | null> {
    return this.repo.findOne({ where: { userId, email } });
  }

  async findById(id: string): Promise<GoogleAccountEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    userId: string;
    email: string;
  }): Promise<GoogleAccountEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.repo.delete({ userId });
    return result.affected ?? 0;
  }
}
