import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeterinaryHospital } from './entities/veterinary-hospitals.entity';
import { VeterinaryHospitalsService } from './veterinary-hospitals.service';
import { VeterinaryHospitalsController } from './hospitals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VeterinaryHospital])],
   controllers: [VeterinaryHospitalsController],
  providers: [VeterinaryHospitalsService],
  exports: [VeterinaryHospitalsService],
})
export class VeterinaryHospitalsModule {}