import { PartialType } from '@nestjs/swagger';
import { CreateVetAppointmentDto } from './create-vet-appointment.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVetAppointmentDto extends PartialType(CreateVetAppointmentDto) {
  @IsOptional()
@IsString()
status?: string;

@ApiPropertyOptional()
doctor_notes?: string;

@ApiPropertyOptional()
prescription_url?: string;

@ApiPropertyOptional()
treatment_plan_url?: string;

@ApiPropertyOptional()
invoice_url?: string;

@ApiPropertyOptional()
session_duration?: number;
}