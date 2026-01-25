import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GSCPropertyEntity } from './gsc-property.entity';

export type GSCSyncStatus = 'running' | 'success' | 'failed';

/**
 * Log of each GSC sync run (additive). Used for retries, quota, debugging.
 */
@Entity('gsc_sync_logs')
export class GSCSyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gscPropertyId: string;

  @ManyToOne(() => GSCPropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gscPropertyId' })
  gscProperty: GSCPropertyEntity;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'varchar', length: 32 })
  status: GSCSyncStatus;

  @Column({ type: 'int', default: 0 })
  rowCount: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
