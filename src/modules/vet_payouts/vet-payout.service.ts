import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetPayout, PayoutStatus } from './entities/vet-payout.entity';
import { CreateVetPayoutDto } from './dto/create-vet-payout.dto';
import { Vet } from '../vets/entities/vet.entity';
import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';

@Injectable()
export class VetPayoutService {
  constructor(
    @InjectRepository(VetPayout)
    private readonly payoutRepo: Repository<VetPayout>,

    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,

    @InjectRepository(VetAppointment)
    private readonly appointmentRepo: Repository<VetAppointment>,
  ) {}

  // ✅ CREATE PAYOUT
  async create(dto: CreateVetPayoutDto) {
    const vet = await this.vetRepo.findOne({
      where: { id: dto.vet_id },
    });

    if (!vet) {
      throw new NotFoundException('Vet not found');
    }

    const appointment = await this.appointmentRepo.findOne({
      where: { id: dto.appointment_id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // 🔥 Commission Logic (20%)
    const commission = Number(dto.gross_amount) * 0.2;

    const netAmount =
      Number(dto.gross_amount) - commission;

    const payout = this.payoutRepo.create({
      vet_id: dto.vet_id,
      appointment_id: dto.appointment_id,
      gross_amount: dto.gross_amount,
      platform_commission: commission,
      net_amount: netAmount,
      payout_status: PayoutStatus.PENDING,
    });

    return await this.payoutRepo.save(payout);
  }

  // ✅ GET ALL
  async findAll() {
    return await this.payoutRepo.find({
      relations: ['vet', 'appointment'],
    });
  }

  // ✅ GET BY VET
  async findByVet(vetId: string) {
    return await this.payoutRepo.find({
      where: { vet_id: vetId },
      relations: ['appointment'],
    });
  }

  // ✅ PROCESS PAYOUT
  async processPayout(id: string) {
    const payout = await this.payoutRepo.findOne({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.payout_status === PayoutStatus.PROCESSED) {
      throw new BadRequestException(
        'Already processed',
      );
    }

    payout.payout_status = PayoutStatus.PROCESSED;
    payout.processed_at = new Date();

    return await this.payoutRepo.save(payout);
  }

  // ✅ DELETE
  async remove(id: string) {
    const payout = await this.payoutRepo.findOne({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return await this.payoutRepo.remove(payout);
  }
}