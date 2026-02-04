import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * User Plan entity - tracks user's current plan and usage
 * 
 * CRITICAL: This is the source of truth for entitlements.
 * Never trust client-side plan information.
 */
@Entity('user_plans')
export class UserPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  workspaceId: string | null;

  @Column({ type: 'uuid' })
  planId: string;

  /**
   * Plan status
   * - active: Plan is active and limits apply
   * - expired: Plan has expired
   * - cancelled: Plan was cancelled
   * - trial: Currently in trial period
   */
  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'cancelled', 'trial'],
    default: 'active',
  })
  status: 'active' | 'expired' | 'cancelled' | 'trial';

  /**
   * Current usage (reset monthly)
   */
  @Column('jsonb', { default: {} })
  usage: {
    websites: number;
    apiCalls: number;
    gscApiCalls: number;
    psiApiCalls: number;
    crawlPages: number;
    lastResetAt: string; // ISO date
  };

  /**
   * Subscription metadata
   */
  @Column('jsonb', { default: {} })
  subscription: {
    startDate?: string;
    endDate?: string;
    trialEndDate?: string;
    billingCycle?: 'monthly' | 'yearly';
    paymentMethod?: string;
    cancelledAt?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
