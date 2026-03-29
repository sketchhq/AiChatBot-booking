import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VeterinaryHospital } from './entities/veterinary-hospitals.entity';
import { Repository, ILike } from 'typeorm';
import { CreateVeterinaryHospitalDto } from './dto/create-veterinary-hospital.dto'; 

@Injectable()
export class VeterinaryHospitalsService {
  constructor(
    @InjectRepository(VeterinaryHospital)
    private repo: Repository<VeterinaryHospital>,
  ) {}


  async createHospital(dto: CreateVeterinaryHospitalDto) {
  const hospital = this.repo.create(dto);
  return this.repo.save(hospital);
}


  /**
   * 🔥 Dynamic search for chatbot and API
   */
async search(options: {
  city?: string;
  area?: string;
  emergency?: boolean;
  service?: string;
  page?: number;
  limit?: number;
}) {
  const {
    city,
    area,
    emergency,
    service,
    page = 1,
    limit = 10,
  } = options;

  const skip = (page - 1) * limit;

  const query = this.repo.createQueryBuilder('hospital');

  if (city) {
    query.andWhere('hospital.city ILIKE :city', {
      city: `%${city}%`,
    });
  }

  if (area) {
    query.andWhere('hospital.area ILIKE :area', {
      area: `%${area}%`,
    });
  }

  if (emergency !== undefined) {
    query.andWhere(
      'hospital.emergency_available = :emergency',
      { emergency },
    );
  }

  if (service) {
    query.andWhere(':service = ANY(hospital.services)', {
      service,
    });
  }

  query.andWhere('hospital.is_active = true');

  query.skip(skip).take(limit);

  query.orderBy('hospital.rating', 'DESC', 'NULLS LAST');

  return query.getMany();
}
  /**
   * 🔥 Simple fallback for chatbot
   */
  async nearbyChennai() {
    return this.search({ city: 'Chennai', limit: 5 });
  }
}