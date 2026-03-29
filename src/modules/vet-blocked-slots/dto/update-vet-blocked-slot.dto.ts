import { PartialType } from '@nestjs/swagger';
import { CreateVetBlockedSlotDto } from './create-vet-blocked-slot.dto';

export class UpdateVetBlockedSlotDto extends PartialType(CreateVetBlockedSlotDto) {}
