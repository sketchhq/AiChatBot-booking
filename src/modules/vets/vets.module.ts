import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vet } from './entities/vet.entity';
import { VetsService } from './vets.service';
import { VetsController } from './vets.controller';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { VetAvailabilityRule } from 'src/modules/vet_availability_rules/entities/vet-availability-rule.entity';
import { VetBlockedSlot } from 'src/modules/vet-blocked-slots/entities/vet-blocked-slot.entity';
import { VetAppointment } from 'src/modules/vet_appointments/entities/vet-appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vet, VetAvailabilityRule, VetBlockedSlot, VetAppointment]), FileUploadModule],
  controllers: [VetsController],
  providers: [VetsService],
  exports: [VetsService],
})
export class VetsModule {}
