import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorDashboardController } from './doctor-dashboard.controller';
import { DoctorDashboardService } from './doctor-dashboard.service';

import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VetAppointment,
    ]),
  ],
  controllers: [DoctorDashboardController],
  providers: [DoctorDashboardService],
})
export class DoctorDashboardModule { }