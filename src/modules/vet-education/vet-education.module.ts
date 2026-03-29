import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetEducation } from './entities/vet-education.entity';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { VetEducationService } from './vet-education.service';
import { VetEducationController } from './vet-education.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VetEducation, Vet])],
  controllers: [VetEducationController],
  providers: [VetEducationService],
})
export class VetEducationModule {}