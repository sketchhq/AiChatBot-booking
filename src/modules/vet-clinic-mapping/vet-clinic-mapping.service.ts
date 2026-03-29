import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetClinicMapping } from './entities/vet-clinic-mapping.entity';
import { CreateVetClinicMappingDto } from './dto/create-vet-clinic-mapping.dto';
import { UpdateVetClinicMappingDto } from './dto/update-vet-clinic-mapping.dto';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';

@Injectable()
export class VetClinicMappingService {
  constructor(
    @InjectRepository(VetClinicMapping)
    private readonly mappingRepo: Repository<VetClinicMapping>,

    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,

    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,
  ) {}

  async create(dto: CreateVetClinicMappingDto) {
    const vet = await this.vetRepo.findOne({ where: { id: dto.vet_id } });
    if (!vet) throw new NotFoundException('Vet not found');

    const clinic = await this.clinicRepo.findOne({ where: { id: dto.clinic_id } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const mapping = this.mappingRepo.create({
      vet,
      clinic,
      consultation_types: dto.consultation_types,
      is_primary: dto.is_primary ?? false,
      commission_override_percentage: dto.commission_override_percentage,
    });

    return this.mappingRepo.save(mapping);
  }

  async findByVet(vetId: string) {
    return this.mappingRepo.find({
      where: { vet: { id: vetId } },
      relations: ['clinic'],
    });
  }

  async update(id: string, dto: UpdateVetClinicMappingDto) {
    const mapping = await this.mappingRepo.findOne({ where: { id } });
    if (!mapping) throw new NotFoundException('Mapping not found');

    Object.assign(mapping, dto);
    return this.mappingRepo.save(mapping);
  }

  async remove(id: string) {
    const mapping = await this.mappingRepo.findOne({ where: { id } });
    if (!mapping) throw new NotFoundException('Mapping not found');

    return this.mappingRepo.softRemove(mapping);
  }
}
