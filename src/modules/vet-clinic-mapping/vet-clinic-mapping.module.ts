import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetClinicMapping } from './entities/vet-clinic-mapping.entity';
import { VetClinicMappingService } from './vet-clinic-mapping.service';
import { VetClinicMappingController } from './vet-clinic-mapping.controller';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VetClinicMapping, Vet, Clinic])],
  controllers: [VetClinicMappingController],
  providers: [VetClinicMappingService],
  exports: [VetClinicMappingService],
})
export class VetClinicMappingModule {}
