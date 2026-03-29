import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Message } from 'src/modules/chatbot/messages/entities/messages.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ default: 'New Chat' })
  title: string;

  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  archived: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;


@OneToMany(() => Message, (message) => message.chat)
messages: Message[];


}