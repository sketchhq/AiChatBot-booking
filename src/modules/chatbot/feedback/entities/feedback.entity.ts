import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Message } from '../../messages/entities/messages.entity';
import { Chat } from '../../chats/entities/chats.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('chatbot_feedback')
export class ChatbotFeedback {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message_id: string;

  @Column()
  chat_id: string;

  @Column()
  user_id: string;

  @Column()
  type: 'good' | 'bad';

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}