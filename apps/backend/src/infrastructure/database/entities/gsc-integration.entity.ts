import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// UserEntity is in the modules folder for now
// import { UserEntity } from './user.entity';

@Entity('gsc_integrations')
export class GSCIntegrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Relationship commented out until UserEntity is moved to infrastructure
  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'userId' })
  // user: UserEntity;

  @Column()
  siteUrl: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'bigint' })
  expiresAt: number;

  @Column({ type: 'varchar', length: 50, default: 'siteOwner' })
  permissionLevel: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  connectedAt: Date;

  @UpdateDateColumn()
  lastSyncAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: {
    email?: string;
    scope?: string;
    tokenType?: string;
  };
}
