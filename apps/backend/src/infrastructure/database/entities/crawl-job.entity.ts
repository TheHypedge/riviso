import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Crawl Job entity - tracks crawl progress for real-time status updates
 */
@Entity('crawl_jobs')
@Index(['websiteUrl', 'status'])
@Index(['createdAt'])
export class CrawlJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index()
  websiteUrl: string;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({
    type: 'enum',
    enum: ['queued', 'crawling', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'text', nullable: true })
  currentStep: string; // e.g., "Crawling page 45/200", "Analyzing links"

  @Column('jsonb', { nullable: true })
  metadata: {
    totalPages: number;
    pagesCrawled: number;
    linksDiscovered: number;
    estimatedTimeRemaining?: number; // seconds
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'uuid', nullable: true })
  analysisId: string; // Links to WebsiteAnalysisEntity when completed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
