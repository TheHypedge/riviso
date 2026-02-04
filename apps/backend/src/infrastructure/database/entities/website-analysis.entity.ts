import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { TechnicalSeoReport, LinkSignalReport } from '@riviso/shared-types';

/**
 * Website Analysis entity - stores complete website crawl results with timestamps
 * Enables historical comparison and trend analysis
 */
@Entity('website_analyses')
@Index(['websiteUrl', 'createdAt'])
@Index(['websiteUrl', 'status'])
export class WebsiteAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index()
  websiteUrl: string;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'crawling', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  seoScore: number;

  @Column('jsonb', { nullable: true })
  onPageSeo: {
    h1Count: number;
    h2H3Count: number;
    internalLinks: number;
    externalLinks: number;
    title: string;
    description: string;
    [key: string]: any;
  };

  @Column('jsonb', { nullable: true })
  technicalSeo: TechnicalSeoReport | null;

  @Column('jsonb', { nullable: true })
  linkSignals: LinkSignalReport | null;

  @Column('jsonb', { nullable: true })
  crawlMetadata: {
    pagesCrawled: number;
    crawlDuration: number; // milliseconds
    startedAt: Date;
    completedAt: Date;
    errors?: string[];
  };

  @Column('jsonb', { nullable: true })
  rawData: any; // Store raw crawl data for future processing

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
