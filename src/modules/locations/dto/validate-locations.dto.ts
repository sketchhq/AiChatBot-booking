import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateLocationDto {
  @ApiProperty({
    description: 'Location ID to validate',
    example: 'e7b8a9f0-1234-4c56-98de-abcdef123456',
  })
  @IsString()
  location_id: string;

  @ApiProperty({
    description: 'Reason/purpose for validation',
    example: 'CHECK_AVAILABILITY',
  })
  @IsString()
  purpose: string;
}
