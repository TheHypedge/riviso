import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GoogleAccountEntity } from './google-account.entity';

/**
 * OAuth tokens for a Google account (additive). Encrypted at rest.
 * Single active row per account; refresh updates this row.
 */
@Entity('google_tokens')
export class GoogleTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  googleAccountId: string;

  @ManyToOne(() => GoogleAccountEntity, (a) => a.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'googleAccountId' })
  googleAccount: GoogleAccountEntity;

  @Column({ type: 'text' })
  accessTokenEncrypted: string;

  @Column({ type: 'text' })
  refreshTokenEncrypted: string;

  @Column({ type: 'timestamptz' })
  tokenExpiry: Date;

  @Column({ type: 'varchar', length: 512, nullable: true })
  scope: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
