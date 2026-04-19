import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetAvailabilityRule } from './entities/vet-availability-rule.entity';
import { CreateVetAvailabilityRuleDto } from './dto/create-vet-availability-rule.dto';
import { UpdateVetAvailabilityRuleDto } from './dto/update-vet-availability-rule.dto';

@Injectable()
export class VetAvailabilityRuleService {
  constructor(
    @InjectRepository(VetAvailabilityRule)
    private readonly ruleRepo: Repository<VetAvailabilityRule>,
  ) {}

  private validateTimeLogic(
    start: string,
    end: string,
    breakStart?: string,
    breakEnd?: string,
  ) {
    if (start >= end) {
      throw new BadRequestException('start_time must be before end_time');
    }

    if (breakStart && breakEnd) {
      if (breakStart >= breakEnd) {
        throw new BadRequestException(
          'break_start must be before break_end',
        );
      }

      if (breakStart < start || breakEnd > end) {
        throw new BadRequestException(
          'Break must be within availability time',
        );
      }
    }
  }

  async create(dto: CreateVetAvailabilityRuleDto) {
    this.validateTimeLogic(
      dto.start_time,
      dto.end_time,
      dto.break_start,
      dto.break_end,
    );

    const rule = this.ruleRepo.create(dto);
    return await this.ruleRepo.save(rule);
  }

  async findAll() {
    return await this.ruleRepo.find();
  }

  async findOne(id: string) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Availability rule not found');
    }
    return rule;
  }

  async findByVet(vet_id: string) {
    return await this.ruleRepo.find({
      where: { vet_id, is_active: true },
    });
  }

  async update(id: string, dto: UpdateVetAvailabilityRuleDto) {
  const rule = await this.ruleRepo.findOne({
    where: { id },
  });

  if (!rule) {
    throw new NotFoundException('Availability rule not found');
  }

  Object.assign(rule, dto);

  return await this.ruleRepo.save(rule);
}

  async remove(id: string) {
    const rule = await this.findOne(id);
    await this.ruleRepo.remove(rule);
    return { message: 'Availability rule deleted successfully' };
  }
}