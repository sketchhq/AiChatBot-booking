import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescheduleController } from './reschedule.controller';
import { RescheduleService } from './reschedule.service';
import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';
import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VetAppointment,VetAvailabilityRule])],
  controllers: [RescheduleController],
  providers: [RescheduleService],
})
export class RescheduleModule {}