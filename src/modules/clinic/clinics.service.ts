import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private repo: Repository<Clinic>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateClinicDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findOne(id: string) {
    const clinic = await this.repo.findOne({
      where: { id },
      relations: [
  'medical_records',
  'vetMappings',
  'vetMappings.vet'
],
    });

    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c');

    if (query.is_deleted)
      qb.where('c.is_deleted = :d', { d: query.is_deleted === 'true' });

    if (query.search)
      qb.andWhere('c.name ILIKE :q OR c.city ILIKE :q', {
        q: `%${query.search}%`,
      });

    const [items, total] = await qb
      .orderBy('c.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, dto: UpdateClinicDto) {
    const clinic = await this.findOne(id);
    Object.assign(clinic, dto);
    return this.repo.save(clinic);
  }

  async softDelete(id: string) {
    const clinic = await this.findOne(id);
    clinic.is_deleted = true;
    clinic.deleted_at = new Date();
    return this.repo.save(clinic);
  }

  async restore(id: string) {
    const clinic = await this.findOne(id);
    clinic.is_deleted = false;
    clinic.deleted_at = null;
    return this.repo.save(clinic);
  }

  async hardDelete(id: string) {
    await this.findOne(id); // check exists
    await this.repo.delete(id);
    return { id };
  }


  async uploadClinicPhoto(id: string, file: Express.Multer.File) {
  const clinic = await this.findOne(id);

  const photoUrl = await this.fileUploadService.uploadPublic(
    file,
    'clinics/gallery',
  );

  clinic.photos = [...(clinic.photos || []), photoUrl];

  return await this.repo.save(clinic);
}
}
