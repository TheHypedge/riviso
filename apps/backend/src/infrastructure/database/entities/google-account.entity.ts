import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GoogleTokenEntity } from './google-token.entity';
import { GSCPropertyEntity } from './gsc-property.entity';

/**
 * Google account linked to a user (additive). One user can connect
 * multiple Google accounts; each account has one active token set.
 */
@Entity('google_accounts')
export class GoogleAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GoogleTokenEntity, (t) => t.googleAccount)
  tokens: GoogleTokenEntity[];

  @OneToMany(() => GSCPropertyEntity, (p) => p.googleAccount)
  properties: GSCPropertyEntity[];
}
