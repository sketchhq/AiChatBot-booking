import { IsUUID, IsArray, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ConsultationType } from '../entities/vet-clinic-mapping.entity';

export class CreateVetClinicMappingDto {
  @IsUUID()
  vet_id: string;

  @IsUUID()
  clinic_id: string;

  @IsArray()
  @IsEnum(ConsultationType, { each: true })
  consultation_types: ConsultationType[];

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @IsNumber()
  commission_override_percentage?: number;
}
