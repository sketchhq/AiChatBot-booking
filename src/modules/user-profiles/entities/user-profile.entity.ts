import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('user_profiles')
export class UserProfile {
  @ApiProperty({ example: 'e648db4d-8d07-4bb1-9e41-2e087d9e4807' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '08a5664b-699c-4c98-824b-756816f5d7ff' })
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 🔹 Explicit user_id column (recommended)
  @Column({ type: 'uuid' })
  user_id: string;

 @ApiProperty({ example: 'John' })
@Column({ type: 'text', nullable: true })
first_name: string;

@ApiProperty({ example: 'Doe' })
@Column({ type: 'text', nullable: true })
last_name: string;


  @ApiProperty({ example: '1998-05-20' })
  @Column({ type: 'date', nullable: true })
  dob: Date;

  @ApiProperty({ example: 'male' })
  @Column({ type: 'varchar', length: 16, nullable: true })
  gender: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @Column({ type: 'text', nullable: true, default: null })
  avatar_url: string;

  @ApiProperty({ example: 'I love coding!' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ example: { theme: 'dark', notifications: true } })
  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @ApiProperty({ example: '2025-01-15T12:30:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ApiProperty({ example: '2025-01-15T12:30:00Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ApiProperty({ example: null })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;
}
