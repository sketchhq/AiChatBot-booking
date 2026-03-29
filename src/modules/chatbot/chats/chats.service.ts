import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chats.entity';
import { Message } from '../messages/entities/messages.entity';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private repo: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>
  ) {}

  findAll(userId: string) {
    if (userId.startsWith('guest_')) return [];
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async create(title: string, userId: string) {
    if (userId.startsWith('guest_')) {
      return { id: `guest_chat_${Date.now()}`, title: title || 'New Chat', created_at: new Date() };
    }

    const chat = this.repo.create({
      title: title || 'New Chat',
      user_id: userId
    });

    return this.repo.save(chat);
  }

  async getMessages(chatId: string, userId: string) {
    if (userId.startsWith('guest_')) return [];

    const chat = await this.repo.findOne({
      where: { id: chatId, user_id: userId }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return this.messageRepo.find({
      where: { chat_id: chatId },
      order: { created_at: 'ASC' },
    });
  }

  async update(chatId: string, dto: UpdateChatDto, userId: string) {
    if (userId.startsWith('guest_')) return { id: chatId, ...dto };

    const chat = await this.repo.findOne({
      where: { id: chatId, user_id: userId }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    Object.assign(chat, dto);

    return this.repo.save(chat);
  }

  async remove(chatId: string, userId: string) {
    if (userId.startsWith('guest_')) return { success: true };

    const chat = await this.repo.findOne({
      where: { id: chatId, user_id: userId }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return this.repo.remove(chat);
  }

  async deleteMessagesAfter(chatId: string, after: string, userId: string) {
    if (userId.startsWith('guest_')) return { success: true };

    const chat = await this.repo.findOne({
      where: { id: chatId, user_id: userId }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return this.messageRepo
      .createQueryBuilder()
      .delete()
      .where("chat_id = :chatId", { chatId })
      .andWhere("created_at > :after", { after })
      .execute();
  }
}