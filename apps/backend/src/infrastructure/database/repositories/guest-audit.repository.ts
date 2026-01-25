import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GuestAuditEntity } from '../entities/guest-audit.entity';

@Injectable()
export class GuestAuditRepository extends Repository<GuestAuditEntity> {
  constructor(private dataSource: DataSource) {
    super(GuestAuditEntity, dataSource.createEntityManager());
  }

  /**
   * Get all guest audits with pagination
   */
  async findAllPaginated(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get guest audits by domain
   */
  async findByDomain(domain: string) {
    return this.find({
      where: { domain },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get recent guest audits (last N days)
   */
  async findRecent(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.find({
      where: {
        createdAt: { $gte: since } as any,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
