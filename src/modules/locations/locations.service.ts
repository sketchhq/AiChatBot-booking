import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Location } from 'src/modules/locations/entities/locations.entity';
import { CreateLocationDto } from 'src/modules/locations/dto/create-locations.dto';
import { UpdateLocationDto } from 'src/modules/locations/dto/update-locations';
import { BulkCreateLocationsDto } from './dto/bulk-create-locations.dto';
import { BulkUpdateLocationsDto } from './dto/bulk-update-locations.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { ValidateLocationDto } from 'src/modules/locations/dto/validate-locations.dto';



@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  // 🔹 CORE METHODS

  async create(createDto: CreateLocationDto): Promise<Location> {
    const entity = this.repo.create(createDto as Partial<Location>);
    return this.repo.save(entity);
  }

  async findAll(
    skip = 0,
    take = 25,
  ): Promise<{ data: Location[]; count: number }> {
    const [data, count] = await this.repo.findAndCount({
      where: { is_deleted: false },
      skip,
      take,
      order: { name: 'ASC' },
    });

    return { data, count };
  }

  async findOne(id: string): Promise<Location> {
    const entity = await this.repo.findOne({
      where: { id, is_deleted: false },
    });

    if (!entity) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }

    return entity;
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<Location> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  /**
   * SOFT DELETE — sets is_deleted = true & adds deleted_at timestamp
   */
  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);

    entity.is_deleted = true;
    entity.deleted_at = new Date();

    await this.repo.save(entity);
  }

  /**
   * RESTORE — sets is_deleted = false & removes deleted_at
   */
  async restore(id: string): Promise<Location> {
    const entity = await this.repo.findOne({
      where: { id, is_deleted: true },
    });

    if (!entity) {
      throw new NotFoundException(`Deleted location with id ${id} not found`);
    }

    entity.is_deleted = false;
    entity.deleted_at = null;

    return this.repo.save(entity);
  }

  // 🔹 ADVANCED METHODS

  // 1. BULK CREATE  (POST /locations/bulk)
  async bulkCreate(dto: BulkCreateLocationsDto) {
    const entities = this.repo.create(dto.locations);
    return this.repo.save(entities);
  }

// 2. BULK UPDATE  (PATCH /locations/bulk)
async bulkUpdate(dto: BulkUpdateLocationsDto) {
  const ids = dto.ids;

  // update panna fields mattum build pannrom
  const data: any = {};
  if (dto.name !== undefined) data.name = dto.name;
  if (dto.type !== undefined) data.type = dto.type;
  if (dto.address !== undefined) data.address = dto.address;
  if (dto.metadata !== undefined) data.metadata = dto.metadata;

  // ids illa / data illa na – yethuvum pannama empty array return
  if (!ids || ids.length === 0) {
    return [];
  }
  if (Object.keys(data).length === 0) {
    return [];
  }

  // 1️⃣ rows update (soft delete consider pannitu)
  await this.repo.update(
    { id: In(ids), is_deleted: false },
    data,
  );

  // 2️⃣ updated rows fetch panni return pannrom
  const updated = await this.repo.find({
    where: { id: In(ids), is_deleted: false },
    order: { name: 'ASC' },
  });

  return updated;
}



  // 3. GET BY TYPE  (GET /locations/type/:type)
  async getByType(type: string) {
    return this.repo.find({
      where: {
        type,
        // is_deleted: false, // venumna uncomment pannunga
      },
    });
  }

  // 4. GET ALL TYPES  (GET /locations/types)
  async getAllTypes(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('location')
      .select('DISTINCT location.type', 'type')
      // .where('location.is_deleted = :isDeleted', { isDeleted: false })
      .getRawMany();

    return rows.map((r) => r.type).filter(Boolean);
  }

  // 5. METADATA KEYS  (GET /locations/metadata/keys)
  async getMetadataKeys(): Promise<string[]> {
    const rows = await this.repo.query(`
      SELECT DISTINCT jsonb_object_keys(metadata) AS key
      FROM locations
      WHERE metadata IS NOT NULL
    `);

    return rows.map((r) => r.key);
  }

  // helper – distance calculation (Haversine)
  private distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // 6. NEARBY  (GET /locations/nearby)
  async getNearby(lat: number, lng: number, radius: number) {
    const all = await this.repo.find({
      where: { is_deleted: false },
    });

    return all.filter((loc: any) => {
      const addr = loc.address || {};
      if (addr.lat == null || addr.lng == null) return false;

      const dist = this.distanceInKm(lat, lng, addr.lat, addr.lng);
      return dist <= radius;
    });
  }

  // 7. VALIDATE LOCATION  (POST /locations/validate)
  async validateLocation(
    dto: ValidateLocationDto,
  ): Promise<{ valid: boolean; message: string }> {
    const location = await this.repo.findOne({
      where: { id: dto.location_id, is_deleted: false },
    });

    if (!location) {
      return { valid: false, message: 'Location not found' };
    }

    const addr: any = (location as any).address || {};

    if (!addr.pincode) {
      return {
        valid: false,
        message: 'Pincode not configured for this location',
      };
    }

    return {
      valid: true,
      message: `Location is valid for purpose "${dto.purpose}".`,
    };
  }
}
