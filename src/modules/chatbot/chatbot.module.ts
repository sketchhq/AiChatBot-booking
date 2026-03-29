import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { ProductRecommendationsModule } from './product-recommendations/recommendations.module';
import { VeterinaryHospitalsModule } from './veterinary-hospitals/veterinary-hospitals.module';
import { AIModule } from './ai/ai.module';
import { SpeechModule } from './speech/speech.module';
import { UploadsModule } from './uploads/uploads.module';


@Module({
  imports: [
    ChatsModule,
    MessagesModule,
    ProductRecommendationsModule,
    VeterinaryHospitalsModule,
    AIModule,
    SpeechModule,
    UploadsModule,
  ],
})
export class ChatbotModule {}