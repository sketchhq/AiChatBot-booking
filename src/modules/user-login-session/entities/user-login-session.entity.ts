import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('user_login_sessions')
export class UserLoginSession {
  @ApiProperty({ example: 'uuid-session-id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔗 RELATION WITH USERS TABLE
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'uuid-user-id' })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'Android Chrome Mobile' })
  @Column({ type: 'text' }) 
  device_name: string;

  @ApiProperty({ example: 'Android' })
  @Column({ type: 'text' }) 
  os: string;

  @ApiProperty({ example: 'Chrome' })
  @Column({ type: 'text' }) 
  browser: string;

  @ApiProperty({ example: '192.168.1.1' })
  @Column({ type: 'varchar', length: 64 })
  ip_address: string;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @ApiProperty({ example: null })
  @Column({ type: 'timestamptz', nullable: true })
  logged_out_at: Date | null;

  @ApiProperty({ example: '2026-01-07T12:00:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}