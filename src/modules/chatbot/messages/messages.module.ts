import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRecommendationsModule } from '../product-recommendations/recommendations.module';
import { VeterinaryHospitalsModule } from '../veterinary-hospitals/veterinary-hospitals.module';
import { Message } from '../messages/entities/messages.entity';
import { Chat } from '../chats/entities/chats.entity';
import { ChatbotFeedback } from '../feedback/entities/feedback.entity';
import { ProductRecommendation } from '../product-recommendations/entities/recommendations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat, ChatbotFeedback, ProductRecommendation]),
    ProductRecommendationsModule,
    VeterinaryHospitalsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}