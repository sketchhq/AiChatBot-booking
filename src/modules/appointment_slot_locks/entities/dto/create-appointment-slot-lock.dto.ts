import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateAppointmentSlotLockDto {
  @ApiProperty()
  @IsUUID()
  vet_id: string;

  @ApiProperty()
  @IsDateString()
  appointment_date: string;

  @ApiProperty()
  @IsString()
  slot_start_time: string;

  @ApiProperty()
  @IsDateString()
  expires_at: string;
}