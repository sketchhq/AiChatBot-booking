import { PartialType } from '@nestjs/mapped-types';
import { CreateVetPayoutDto } from './create-vet-payout.dto';

export class UpdateVetPayoutDto extends PartialType(CreateVetPayoutDto) {}