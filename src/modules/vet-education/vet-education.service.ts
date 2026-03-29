import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetEducation } from './entities/vet-education.entity';
import { CreateVetEducationDto } from './dto/create-vet-education.dto';
import { UpdateVetEducationDto } from './dto/update-vet-education.dto';
import { Vet } from 'src/modules/vets/entities/vet.entity';

@Injectable()
export class VetEducationService {
  constructor(
    @InjectRepository(VetEducation)
    private readonly eduRepo: Repository<VetEducation>,

    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
  ) {}

  async create(vetId: string, dto: CreateVetEducationDto) {
    const vet = await this.vetRepo.findOne({ where: { id: vetId } });
    if (!vet) throw new NotFoundException('Vet not found');

    const education = this.eduRepo.create({
      ...dto,
      vet,
    });

    return this.eduRepo.save(education);
  }

async findByVet(vetId: string) {
  const data = await this.eduRepo.find({
    where: { vet: { id: vetId } },
    order: { end_year: 'DESC' },
  });

  return data.map((edu) => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.institution,
    period: `${edu.start_year} - ${edu.end_year}`,
  }));
}

  async update(id: string, dto: UpdateVetEducationDto) {
    const education = await this.eduRepo.findOne({ where: { id } });
    if (!education) throw new NotFoundException('Education not found');

    Object.assign(education, dto);
    return this.eduRepo.save(education);
  }

  async remove(id: string) {
    const education = await this.eduRepo.findOne({ where: { id } });
    if (!education) throw new NotFoundException('Education not found');

    await this.eduRepo.remove(education);
    return { message: 'Education deleted successfully' };
  }
}