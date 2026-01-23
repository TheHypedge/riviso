import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * SEO Audit entity - stores audit results
 */
@Entity('seo_audits')
@Index(['projectId', 'createdAt'])
export class SeoAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column({ type: 'text' })
  url: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @Column('jsonb', { default: [] })
  issues: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    affectedPages: string[];
    impact: number;
  }>;

  @Column('jsonb', { default: {} })
  metrics: {
    pageSpeed: number;
    mobileUsability: number;
    coreWebVitals: any;
    indexability: any;
    backlinks: any;
  };

  @Column('jsonb', { default: [] })
  recommendations: Array<{
    id: string;
    category: string;
    priority: number;
    title: string;
    description: string;
    effort: string;
    impact: string;
    actionItems: string[];
  }>;

  @CreateDateColumn()
  createdAt: Date;
}
