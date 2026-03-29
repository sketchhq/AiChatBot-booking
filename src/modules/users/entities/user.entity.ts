import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationToken } from './verification-token.entity';
import { UserAuthProvider } from './user-auth-provider.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { UserProfile } from 'src/modules/user-profiles/entities/user-profile.entity';
import { UserRole } from '../enums/user-role.enum';
import { AccountStatus } from '../enums/account-status.enum';
import { Message } from 'src/modules/chatbot/messages/entities/messages.entity';
import { Chat } from 'src/modules/chatbot/chats/entities/chats.entity';


@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid-generated-id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  @Column({ type: 'citext', unique: true, nullable: true })
  email?: string;


  @ApiProperty({ example: '+11234567890' })
  @Column({ type: 'varchar', length: 25, unique: true })
  phone: string;


  @ApiProperty({ example: '$2b$10$hashedPasswordValue' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash?: string;

  @ApiProperty({ example: 'John' })
  @Column({ type: 'text', nullable: true })
  first_name?: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ type: 'text', nullable: true })
  last_name?: string;

  @ApiProperty({
    example: ['Buddy', 'Rocky', 'Milo'],
    description: 'Multiple pet names for the user',
  })
  @Column({ type: 'jsonb', nullable: true })
  pet_names?: string[];



  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_phone_verified: boolean;

  @ApiProperty({ example: 'en-US' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  preferred_locale?: string;

  @ApiProperty({ example: 'Asia/Kolkata' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  preferred_timezone?: string;

  @ApiProperty({
    example: { referralCode: 'ABC123', newsletterSubscribed: true },
    description: 'Flexible JSON field for additional user metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;

  @ApiProperty({ example: null, description: 'Soft delete timestamp' })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;


  // Relation with verification tokens
  @OneToMany(() => VerificationToken, (token) => token.user)
  verificationTokens: VerificationToken[];


  @OneToMany(() => UserAuthProvider, (provider) => provider.user)
  authProviders: UserAuthProvider[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];


  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;


  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  restore_token: string | null;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  restore_token_expires_at: Date | null;



  @ApiProperty({ example: 'CUSTOMER' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;


  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING,
  })
  account_status: AccountStatus;





  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];


}

