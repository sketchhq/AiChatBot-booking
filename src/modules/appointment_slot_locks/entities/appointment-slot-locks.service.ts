import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentSlotLock } from './appointment-slot-lock.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentSlotLockDto } from './dto/create-appointment-slot-lock.dto';
import { UpdateAppointmentSlotLockDto } from './dto/update-appointment-slot-lock.dto';

@Injectable()
export class AppointmentSlotLocksService {
  constructor(
    @InjectRepository(AppointmentSlotLock)
    private repo: Repository<AppointmentSlotLock>,
  ) {}

  async create(dto: CreateAppointmentSlotLockDto) {
    const exists = await this.repo.findOne({
      where: {
        vet: { id: dto.vet_id },
        appointment_date: dto.appointment_date,
        slot_start_time: dto.slot_start_time,
      },
    });

    if (exists) {
      throw new BadRequestException('Slot already locked');
    }

    const lock = this.repo.create({
      appointment_date: dto.appointment_date,
      slot_start_time: dto.slot_start_time,
      expires_at: dto.expires_at,
      vet: { id: dto.vet_id },
    });

    return this.repo.save(lock);
  }

  async findAll() {
  return this.repo.find({
    relations: ['vet', 'vet.user'], // 🔥 add this
    order: { appointment_date: 'ASC' },
  });
}

async findOne(id: string) {
  const slot = await this.repo.findOne({
    where: { id },
    relations: ['vet', 'vet.user'], // 🔥 add this
  });

  if (!slot) throw new NotFoundException('Slot not found');
  return slot;
}

  async update(id: string, dto: UpdateAppointmentSlotLockDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.repo.delete(id);
  }
}