import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetPayout } from './entities/vet-payout.entity';
import { VetPayoutService } from './vet-payout.service';
import { VetPayoutController } from './vet-payout.controller';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { VetAppointment } from 'src/modules/vet_appointments/entities/vet-appointment.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      VetPayout,
      Vet,
      VetAppointment,
    ]),
  ],
  controllers: [VetPayoutController],
  providers: [VetPayoutService],
})
export class VetPayoutModule {}