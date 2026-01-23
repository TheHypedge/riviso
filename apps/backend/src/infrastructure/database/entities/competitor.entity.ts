import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Competitor entity - represents a tracked competitor
 */
@Entity('competitors')
@Index(['projectId', 'domain'])
export class CompetitorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column()
  domain: string;

  @Column()
  name: string;

  @Column({ default: true })
  tracked: boolean;

  @Column('jsonb', { default: {} })
  metrics: {
    estimatedTraffic: number;
    totalKeywords: number;
    commonKeywords: number;
    averageRank: number;
    backlinks: number;
    domainAuthority: number;
    lastUpdated: string;
  };

  @Column('jsonb', { default: {} })
  rankDistribution: {
    top3: number;
    top10: number;
    top20: number;
    top50: number;
    top100: number;
  };

  @Column('jsonb', { default: [] })
  topKeywords: Array<{
    keyword: string;
    rank: number;
    searchVolume: number;
    url: string;
  }>;

  @Column({ nullable: true })
  lastAnalyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
