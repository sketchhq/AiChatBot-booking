import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum VerificationTokenType {
  SIGNUP_PHONE = 'signup_phone_otp',
  LOGIN_EMAIL = 'login_email_otp',
  LOGIN_PHONE = 'login_phone_otp',
  PASSWORD_RESET = 'password_reset',
  CHANGE_PHONE = 'change_phone_otp',
  CHANGE_EMAIL = 'change_email_otp',
  VET_APPLY_OTP = 'vet_apply_otp',

}

@Entity('verification_tokens')
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.verificationTokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'citext', nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', nullable: true })
  signup_payload?: Record<string, any>;

  @Column({ type: 'text' })
  token: string;

  @Column({
    type: 'enum',
    enum: VerificationTokenType,
    nullable:true,
  })
  type: VerificationTokenType;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
