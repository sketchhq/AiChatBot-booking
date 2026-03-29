import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetAppointmentsController } from './vet-appointments.controller';
import { VetAppointmentsService } from './vet-appointments.service';
import { VetAppointment } from './entities/vet-appointment.entity';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { Vet } from '../vets/entities/vet.entity';
import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';
import { Address } from '../addresses/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VetAppointment, Vet, VetAvailabilityRule, Address]),
    FileUploadModule,
  ],
  controllers: [VetAppointmentsController],
  providers: [VetAppointmentsService],
})
export class VetAppointmentsModule {}