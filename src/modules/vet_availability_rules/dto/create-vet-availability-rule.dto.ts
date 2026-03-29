import {
  IsUUID,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  IsMilitaryTime,
  Min,
  Max,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from '../entities/vet-availability-rule.entity';

export class CreateVetAvailabilityRuleDto {
  @ApiProperty()
  @IsUUID()
  vet_id: string;

  // ✅ OPTIONAL (Important Fix)
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  clinic_id?: string;

  @ApiProperty({ enum: ConsultationType })
  @IsEnum(ConsultationType)
  consultation_type: ConsultationType;

  @ApiProperty({ example: 1, description: '0 = Sunday, 6 = Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({ example: '09:00' })
  @IsMilitaryTime()
  start_time: string;

  @ApiProperty({ example: '13:00' })
  @IsMilitaryTime()
  end_time: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(5)
  slot_duration_minutes: number;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @IsMilitaryTime()
  break_start?: string;

  @ApiPropertyOptional({ example: '11:30' })
  @IsOptional()
  @IsMilitaryTime()
  break_end?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}