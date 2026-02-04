import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Website entity - represents a verified website/domain owned by a user/workspace
 * 
 * CRITICAL: Websites must be verified before they can be used for:
 * - Search Console data fetching
 * - Technical SEO analysis
 * - CRO insights
 * 
 * Verification methods:
 * 1. DNS verification (TXT record)
 * 2. Meta tag verification (HTML meta tag)
 */
@Entity('websites')
@Index(['userId', 'url'])
@Index(['workspaceId', 'url'])
export class WebsiteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  workspaceId: string | null;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  domain: string; // Extracted domain (e.g., example.com)

  @Column({ type: 'varchar', length: 255, default: '' })
  name: string;

  /**
   * Verification status
   * - pending: Verification not started
   * - verifying: Verification in progress
   * - verified: Successfully verified
   * - failed: Verification failed
   */
  @Column({
    type: 'enum',
    enum: ['pending', 'verifying', 'verified', 'failed'],
    default: 'pending',
  })
  verificationStatus: 'pending' | 'verifying' | 'verified' | 'failed';

  /**
   * Verification method used
   * - dns: DNS TXT record verification
   * - meta: HTML meta tag verification
   */
  @Column({
    type: 'enum',
    enum: ['dns', 'meta'],
    nullable: true,
  })
  verificationMethod: 'dns' | 'meta' | null;

  /**
   * Verification token (for DNS TXT or meta tag)
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken: string | null;

  /**
   * Verification metadata
   */
  @Column('jsonb', { default: {} })
  verificationMetadata: {
    verifiedAt?: string;
    verifiedBy?: string; // userId who verified
    dnsRecord?: string;
    metaTagLocation?: string;
    lastCheckedAt?: string;
    errorMessage?: string;
  };

  /**
   * Mapped GSC property URL (if connected)
   * Format: sc-domain:example.com or https://example.com
   */
  @Column({ type: 'varchar', length: 512, nullable: true })
  gscPropertyUrl: string | null;

  /**
   * Last GSC sync timestamp
   */
  @Column({ type: 'timestamp', nullable: true })
  lastGscSyncAt: Date | null;

  /**
   * Website settings
   */
  @Column('jsonb', { default: {} })
  settings: {
    autoSync?: boolean;
    syncFrequency?: 'daily' | 'weekly' | 'monthly';
    notifications?: {
      onVerification?: boolean;
      onSyncError?: boolean;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
