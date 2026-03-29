import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsMilitaryTime } from 'class-validator';

export class RescheduleAppointmentDto {

  @ApiProperty({
    example: 'fbc23e25-f260-41ab-bd2d-90a5bacd9a9e'
  })
  @IsUUID()
  appointment_id: string;

  @ApiProperty({
    example: '2026-03-15'
  })
  @IsDateString()
  new_date: string;

  @ApiProperty({
    example: '14:30'
  })
  @IsMilitaryTime()
  new_time: string;

}