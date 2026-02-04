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
 * GSC property linked to a user/website (additive). One property per
 * user+website; website_id optional for backward compatibility.
 */
@Entity('gsc_properties')
export class GSCPropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  websiteId: string | null;

  @Column({ type: 'uuid' })
  googleAccountId: string;

  @ManyToOne(() => GoogleAccountEntity, (a) => a.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'googleAccountId' })
  googleAccount: GoogleAccountEntity;

  @Column({ type: 'varchar', length: 512 })
  gscPropertyUrl: string;

  @Column({ type: 'varchar', length: 50, default: 'siteOwner' })
  permissionLevel: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
