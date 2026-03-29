import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentSlotLockDto {
  @ApiPropertyOptional({ example: '2026-02-27' })
  @IsOptional()
  @IsDateString()
  appointment_date?: string;

  @ApiPropertyOptional({ example: '10:30:00' })
  @IsOptional()
  @IsString()
  slot_start_time?: string;

  @ApiPropertyOptional({ example: '2026-02-27T09:45:00.000Z' })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}