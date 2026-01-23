import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { PageEntity } from '../entities/page.entity';

/**
 * Page repository interface
 */
export interface IPageRepository {
  findByProjectId(projectId: string): Promise<PageEntity[]>;
  findByUrl(projectId: string, url: string): Promise<PageEntity | null>;
  updateAnalytics(pageId: string, metrics: any): Promise<PageEntity | null>;
  getHighTrafficPages(projectId: string, limit: number): Promise<PageEntity[]>;
  getLowConversionPages(projectId: string, threshold: number): Promise<PageEntity[]>;
}

/**
 * Page repository implementation
 */
@Injectable()
export class PageRepository
  extends BaseRepository<PageEntity>
  implements IPageRepository
{
  constructor(
    @InjectRepository(PageEntity)
    repository: Repository<PageEntity>,
  ) {
    super(repository);
  }

  async findByProjectId(projectId: string): Promise<PageEntity[]> {
    return this.repository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUrl(projectId: string, url: string): Promise<PageEntity | null> {
    return this.repository.findOne({
      where: { projectId, url },
    });
  }

  async updateAnalytics(pageId: string, metrics: any): Promise<PageEntity | null> {
    await this.repository.update(pageId, {
      analyticsMetrics: metrics,
      lastAnalyzedAt: new Date(),
    });
    return this.findById(pageId);
  }

  async getHighTrafficPages(projectId: string, limit: number = 10): Promise<PageEntity[]> {
    // Implementation placeholder - would order by pageViews
    return this.repository.find({
      where: { projectId },
      take: limit,
    });
  }

  async getLowConversionPages(
    projectId: string,
    threshold: number = 2.0,
  ): Promise<PageEntity[]> {
    // Implementation placeholder - would filter by conversion rate
    return this.repository.find({
      where: { projectId },
    });
  }
}
