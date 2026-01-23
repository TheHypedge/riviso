import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Page entity - represents a website page being tracked
 */
@Entity('pages')
@Index(['projectId', 'url'])
export class PageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  h1: string;

  @Column({ default: 0 })
  wordCount: number;

  @Column('jsonb', { default: {} })
  seoMetrics: {
    score: number;
    titleLength: number;
    descriptionLength: number;
    hasH1: boolean;
    hasMetaDescription: boolean;
    imageCount: number;
    imagesWithoutAlt: number;
    internalLinks: number;
    externalLinks: number;
  };

  @Column('jsonb', { default: {} })
  performanceMetrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
  };

  @Column('jsonb', { default: {} })
  analyticsMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
    conversions: number;
    conversionRate: number;
  };

  @Column({ nullable: true })
  lastCrawledAt: Date;

  @Column({ nullable: true })
  lastAnalyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
