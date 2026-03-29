import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, Matches, IsOptional, IsString } from 'class-validator';

export class CreateVetBlockedSlotDto {

  @ApiProperty({ example: 'a6136e35-d730-4a55-acef-6724f49afb4b' })
  @IsUUID()
  vet_id: string;

  @ApiProperty({ example: '2026-02-20' })
  @IsDateString()
  blocked_date: string;

  @ApiProperty({ example: '13:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time: string;

  @ApiProperty({ example: '15:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time: string;

  @ApiProperty({ example: 'Lunch break', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
