import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Workspace entity - represents a workspace/organization
 */
@Entity('workspaces')
export class WorkspaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('uuid')
  ownerId: string;

  @Column('jsonb', { default: {} })
  settings: {
    timezone: string;
    currency: string;
    notifications: {
      email: boolean;
      slack: boolean;
    };
  };

  @Column('jsonb', { default: [] })
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
