import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_auth_providers')
@Unique(['provider', 'provider_user_id'])
export class UserAuthProvider {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.authProviders, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({ type: 'varchar', length: 20 })
  provider: 'google' | 'facebook' | 'apple';

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;   // Google ID / Apple ID / FB ID

  @Column({ type: 'varchar', length: 512, nullable: true })
  access_token?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  refresh_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
