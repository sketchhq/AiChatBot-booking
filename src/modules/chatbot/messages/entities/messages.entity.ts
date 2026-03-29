import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Chat } from '../../chats/entities/chats.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chat_id: string;

  @Column()
  user_id: string;

  @Column()
  role: string;

  @Column('text')
  content: string;

  // @Column({ nullable: true })
  // feedback: string;

  @CreateDateColumn()
  created_at: Date;


  @ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;


@ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'chat_id' })
chat: Chat;


}