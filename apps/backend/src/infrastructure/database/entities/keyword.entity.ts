import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Keyword entity - represents a tracked keyword
 */
@Entity('keywords')
@Index(['projectId', 'keyword'])
export class KeywordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column()
  @Index()
  keyword: string;

  @Column({ default: 0 })
  searchVolume: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  difficulty: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cpc: number;

  @Column({
    type: 'enum',
    enum: ['informational', 'navigational', 'commercial', 'transactional'],
    default: 'informational',
  })
  intent: string;

  @Column({ default: false })
  tracked: boolean;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column('jsonb', { default: {} })
  currentRanking: {
    rank: number;
    url: string;
    previousRank: number;
    change: number;
    searchEngine: string;
    device: string;
    location: string;
    checkedAt: string;
  };

  @Column('jsonb', { default: [] })
  serpFeatures: Array<{
    type: string;
    position: number;
    present: boolean;
  }>;

  @Column({ nullable: true })
  lastCheckedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
