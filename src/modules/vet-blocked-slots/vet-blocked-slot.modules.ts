import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetBlockedSlot } from './entities/vet-blocked-slot.entity';
import { VetBlockedSlotsService } from './vet-blocked-slots.service';
import { VetBlockedSlotsController } from './vet-blocked-slots.controller';
import { User } from '../users/entities/user.entity';
import { Vet } from '../vets/entities/vet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VetBlockedSlot,
      User, // ⭐ REQUIRED FOR VET VALIDATION
      Vet,  // ⭐ REQUIRED FOR VET VALIDATION
    ]),
  ],
  controllers: [VetBlockedSlotsController],
  providers: [VetBlockedSlotsService],
  exports: [VetBlockedSlotsService],
})
export class VetBlockedSlotsModule {}