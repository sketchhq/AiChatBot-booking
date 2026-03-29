import { IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVetPayoutDto {
  @ApiProperty({
    example: 'uuid-of-vet',
    description: 'Vet ID',
  })
  @IsUUID()
  vet_id: string;

  @ApiProperty({
    example: 'uuid-of-appointment',
    description: 'Appointment ID',
  })
  @IsUUID()
  appointment_id: string;

  @ApiProperty({
    example: 1000,
    description: 'Total appointment amount',
  })
  @IsNumber()
  gross_amount: number;
}