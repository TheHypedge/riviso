import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * CRO Insight entity - conversion optimization insights
 */
@Entity('cro_insights')
@Index(['projectId', 'status'])
export class CroInsightEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column({ type: 'text' })
  pageUrl: string;

  @Column({
    type: 'enum',
    enum: [
      'high_traffic_low_conversion',
      'high_bounce_rate',
      'poor_engagement',
      'funnel_drop_off',
      'slow_page_speed',
      'mobile_issues',
      'form_abandonment',
    ],
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['critical', 'high', 'medium', 'low'],
  })
  priority: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('jsonb', { default: {} })
  currentMetrics: {
    url: string;
    pageViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
  };

  @Column('jsonb', { default: {} })
  projectedImpact: {
    conversionRateIncrease: number;
    additionalConversions: number;
    potentialRevenue?: number;
    confidence: number;
  };

  @Column('jsonb', { default: [] })
  recommendations: any[];

  @Column({
    type: 'enum',
    enum: ['new', 'in_progress', 'implemented', 'testing', 'dismissed'],
    default: 'new',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
