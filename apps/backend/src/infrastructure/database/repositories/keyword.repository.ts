import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { KeywordEntity } from '../entities/keyword.entity';

/**
 * Keyword repository interface
 */
export interface IKeywordRepository {
  findByProjectId(projectId: string): Promise<KeywordEntity[]>;
  findTrackedByProjectId(projectId: string): Promise<KeywordEntity[]>;
  findByKeyword(projectId: string, keyword: string): Promise<KeywordEntity | null>;
  updateRanking(keywordId: string, ranking: any): Promise<KeywordEntity | null>;
  getTopRankingKeywords(projectId: string, limit: number): Promise<KeywordEntity[]>;
}

/**
 * Keyword repository implementation
 */
@Injectable()
export class KeywordRepository
  extends BaseRepository<KeywordEntity>
  implements IKeywordRepository
{
  constructor(
    @InjectRepository(KeywordEntity)
    repository: Repository<KeywordEntity>,
  ) {
    super(repository);
  }

  async findByProjectId(projectId: string): Promise<KeywordEntity[]> {
    return this.repository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findTrackedByProjectId(projectId: string): Promise<KeywordEntity[]> {
    return this.repository.find({
      where: { projectId, tracked: true },
      order: { searchVolume: 'DESC' },
    });
  }

  async findByKeyword(
    projectId: string,
    keyword: string,
  ): Promise<KeywordEntity | null> {
    return this.repository.findOne({
      where: { projectId, keyword },
    });
  }

  async updateRanking(keywordId: string, ranking: any): Promise<KeywordEntity | null> {
    await this.repository.update(keywordId, {
      currentRanking: ranking,
      lastCheckedAt: new Date(),
    });
    return this.findById(keywordId);
  }

  async getTopRankingKeywords(
    projectId: string,
    limit: number = 10,
  ): Promise<KeywordEntity[]> {
    // Implementation placeholder - would order by current rank
    return this.repository.find({
      where: { projectId, tracked: true },
      take: limit,
    });
  }
}
