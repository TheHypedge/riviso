import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Keyword Ranking entity - historical ranking data
 */
@Entity('keyword_rankings')
@Index(['keywordId', 'checkedAt'])
export class KeywordRankingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  keywordId: string;

  @Column('uuid')
  projectId: string;

  @Column()
  rank: number;

  @Column({ nullable: true })
  previousRank: number;

  @Column({ type: 'text' })
  url: string;

  @Column({
    type: 'enum',
    enum: ['google', 'bing', 'yahoo'],
    default: 'google',
  })
  searchEngine: string;

  @Column({
    type: 'enum',
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop',
  })
  device: string;

  @Column({ default: 'US' })
  location: string;

  @Column('jsonb', { nullable: true })
  serpFeatures: any;

  @Column()
  @Index()
  checkedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
