import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VetBlockedSlot } from 'src/modules/vet-blocked-slots/entities/vet-blocked-slot.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vet } from 'src/modules/vets/entities/vet.entity';

@Injectable()
export class VetBlockedSlotsService {
  constructor(
    @InjectRepository(VetBlockedSlot)
    private repo: Repository<VetBlockedSlot>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Vet)
    private vetRepo: Repository<Vet>,
  ) {}

  // 🔹 VET VALIDATION
  private async validateVet(vet_id: string) {
   const vet = await this.vetRepo.findOne({
    where: { id: vet_id, is_active: true }
  });

  if (!vet)
    throw new BadRequestException('Invalid vet_id');
}


  private async overlapCheck(vet_id: string, date: string, start: string, end: string, ignoreId?: string) {
    const qb = this.repo.createQueryBuilder('slot')
      .where('slot.vet_id = :vet_id', { vet_id })
      .andWhere('slot.blocked_date = :date', { date })
      .andWhere('slot.deleted_at IS NULL')
      .andWhere('(:start < slot.end_time AND :end > slot.start_time)', { start, end });

    if (ignoreId) qb.andWhere('slot.id != :id', { id: ignoreId });

    return (await qb.getCount()) > 0;
  }

  // ================= CREATE =================
  async create(dto) {
    await this.validateVet(dto.vet_id); // ⭐ முக்கிய fix

    if (dto.start_time >= dto.end_time)
      throw new BadRequestException('Invalid time range');

    const today = new Date().toISOString().split('T')[0];
    if (dto.blocked_date < today)
      throw new BadRequestException('Past date not allowed');

    if (await this.overlapCheck(dto.vet_id, dto.blocked_date, dto.start_time, dto.end_time))
      throw new BadRequestException('Slot overlap');

    return this.repo.save(this.repo.create(dto));
  }

  // ================= LIST =================
  async list(vet_id: string, from?: string, to?: string) {
    await this.validateVet(vet_id);

    const where: any = { vet_id };
    if (from && to) where.blocked_date = Between(from, to);

    return this.repo.find({
      where,
      order: { blocked_date: 'ASC', start_time: 'ASC' },
    });
  }

  async listByDate(vet_id: string, date: string) {
    await this.validateVet(vet_id);

    return this.repo.find({
      where: { vet_id, blocked_date: date },
      order: { start_time: 'ASC' },
    });
  }

  // ================= UPDATE =================
  async update(id: string, dto) {
    const slot = await this.repo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');

    const merged = { ...slot, ...dto };

    await this.validateVet(merged.vet_id);

    if (await this.overlapCheck(merged.vet_id, merged.blocked_date, merged.start_time, merged.end_time, id))
      throw new BadRequestException('Slot overlap');

    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  // ================= DELETE =================
  async remove(id: string) {
    const slot = await this.repo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');

    await this.repo.softDelete(id);
    return { message: 'Deleted successfully' };
  }

  // ================= CHECK AVAILABILITY =================
async checkAvailability(vet_id: string, date: string, time: string) {
  await this.validateVet(vet_id);

  const exists = await this.repo
    .createQueryBuilder('slot')
    .where('slot.vet_id = :vet_id', { vet_id })
    .andWhere('slot.blocked_date = :date', { date })
    .andWhere('slot.deleted_at IS NULL')
    .andWhere(':time >= slot.start_time', { time })
    .andWhere(':time < slot.end_time', { time })
    .getExists();

  return { available: !exists };
}
}
