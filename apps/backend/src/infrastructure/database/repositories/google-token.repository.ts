import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleTokenEntity } from '../entities/google-token.entity';

@Injectable()
export class GoogleTokenRepository {
  constructor(
    @InjectRepository(GoogleTokenEntity)
    private readonly repo: Repository<GoogleTokenEntity>,
  ) {}

  async findByGoogleAccountId(googleAccountId: string): Promise<GoogleTokenEntity | null> {
    return this.repo.findOne({
      where: { googleAccountId },
      order: { updatedAt: 'DESC' },
    });
  }

  async upsert(data: {
    googleAccountId: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    tokenExpiry: Date;
    scope?: string | null;
  }): Promise<GoogleTokenEntity> {
    const existing = await this.findByGoogleAccountId(data.googleAccountId);
    if (existing) {
      existing.accessTokenEncrypted = data.accessTokenEncrypted;
      existing.refreshTokenEncrypted = data.refreshTokenEncrypted;
      existing.tokenExpiry = data.tokenExpiry;
      if (data.scope != null) existing.scope = data.scope;
      return this.repo.save(existing);
    }
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async deleteByGoogleAccountId(googleAccountId: string): Promise<number> {
    const result = await this.repo.delete({ googleAccountId });
    return result.affected ?? 0;
  }
}
