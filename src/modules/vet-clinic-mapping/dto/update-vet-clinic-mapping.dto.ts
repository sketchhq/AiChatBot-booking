import { PartialType } from '@nestjs/mapped-types';
import { CreateVetClinicMappingDto } from './create-vet-clinic-mapping.dto';

export class UpdateVetClinicMappingDto extends PartialType(
  CreateVetClinicMappingDto,
) {}
