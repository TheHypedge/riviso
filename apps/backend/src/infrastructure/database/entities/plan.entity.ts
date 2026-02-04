import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Plan entity - defines subscription plans and their limits
 * 
 * Plans control:
 * - Number of websites
 * - API call quotas
 * - Feature access
 * - Data retention
 */
@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string; // 'free', 'pro', 'enterprise'

  @Column({ type: 'varchar', length: 100 })
  name: string; // 'Free', 'Pro', 'Enterprise'

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * Plan limits
   */
  @Column('jsonb', { default: {} })
  limits: {
    // Website limits
    maxWebsites: number;
    
    // API call quotas (per month)
    maxApiCalls: number;
    maxGscApiCalls: number;
    maxPsiApiCalls: number;
    maxCrawlPages: number;
    
    // Feature flags
    features: {
      technicalSeo: boolean;
      offPageSeo: boolean;
      croInsights: boolean;
      aiAssistant: boolean;
      searchConsole: boolean;
      pagespeedInsights: boolean;
      competitorAnalysis: boolean;
      serpTracking: boolean;
      customReports: boolean;
      apiAccess: boolean;
      webhooks: boolean;
    };
    
    // Data retention (days)
    dataRetentionDays: number;
    
    // Support level
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  };

  /**
   * Pricing (if applicable)
   */
  @Column('jsonb', { default: {} })
  pricing: {
    monthly?: number;
    yearly?: number;
    currency?: string;
  };

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
