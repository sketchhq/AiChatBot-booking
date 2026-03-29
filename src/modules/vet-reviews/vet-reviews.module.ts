import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetReview } from './entities/vet-review.entity';
import { VetReviewsService } from './vet-reviews.service';
import { VetReviewsController } from './vet-reviews.controller';
import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';

import { Vet } from 'src/modules/vets/entities/vet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VetReview, VetAppointment, Vet])],
  controllers: [VetReviewsController],
  providers: [VetReviewsService],
})
export class VetReviewsModule {}