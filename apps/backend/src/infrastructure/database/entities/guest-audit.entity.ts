import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Guest Audit entity - stores website audits performed by guest users (non-authenticated)
 * This allows admins to track which websites were analyzed via the demo feature
 */
@Entity('guest_audits')
@Index(['createdAt'])
@Index(['url'])
export class GuestAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  score: number;

  @Column('jsonb', { default: {} })
  onPageSEO: {
    title?: any;
    metaDescription?: any;
    headings?: any;
    images?: any;
    content?: any;
    internalLinks?: any;
    externalLinks?: any;
    brokenLinks?: any;
  };

  @Column('jsonb', { default: {} })
  technical: {
    url?: any;
    canonicalTag?: any;
    robotsMeta?: any;
    favicon?: any;
    security?: any;
  };

  @Column('jsonb', { default: {} })
  performance: {
    loadTime?: number;
    score?: number;
    [key: string]: any;
  };

  @Column('jsonb', { default: {} })
  mobile: {
    viewport?: any;
    score?: number;
    [key: string]: any;
  };

  @Column('jsonb', { default: [] })
  issues: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    impact?: string;
  }>;

  @Column('jsonb', { default: [] })
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
    estimatedImpact?: string;
  }>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
