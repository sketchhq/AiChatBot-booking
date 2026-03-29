import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentSlotLocksService } from './appointment-slot-locks.service';
import { AppointmentSlotLocksController } from './appointment-slot-locks.controller';
import { AppointmentSlotLock } from './appointment-slot-lock.entity';
import { Vet } from 'src/modules/vets/entities/vet.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AppointmentSlotLock, Vet])],
  controllers: [AppointmentSlotLocksController],
  providers: [AppointmentSlotLocksService],
})
export class AppointmentSlotLocksModule {}