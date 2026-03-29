import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chats.entity';
import { Message } from '../messages/entities/messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat,Message,])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}