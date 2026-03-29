import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 64 })
  label: string;

  @Column({ length: 20, nullable: true })
  phone_number: string;


  @Column({ length: 100 })
first_name: string;

@Column({ length: 100 })
last_name: string;


  @Column({ length: 255 })
  line1: string;

  @Column({ length: 255, nullable: true })
  line2?: string;

  @Column({ length: 128 })
  city: string;

  @Column({ length: 128 })
  state: string;

  @Column({ length: 32 })
  postal_code: string;

  @Column({ length: 64 })
  country: string;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number;

  @Column({ default: false })
  is_default: boolean;

  @Column({ type: 'text', nullable: true })
  google_place_id?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
