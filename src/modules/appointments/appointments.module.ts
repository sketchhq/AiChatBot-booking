import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';
import { Doctor } from '../doctors/entities/doctor.entity';
import { DoctorAvailabilityRule } from '../doctor_availability_rules/entities/doctor-availability-rule.entity';
import { Address } from '../addresses/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Doctor, DoctorAvailabilityRule, Address]),
    FileUploadModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}