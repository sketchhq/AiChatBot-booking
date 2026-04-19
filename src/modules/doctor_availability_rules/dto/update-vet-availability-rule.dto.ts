import { PartialType } from '@nestjs/mapped-types';
import { CreateVetAvailabilityRuleDto } from './create-vet-availability-rule.dto';

export class UpdateVetAvailabilityRuleDto extends PartialType(
  CreateVetAvailabilityRuleDto,
) {}