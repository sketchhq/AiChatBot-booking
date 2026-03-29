import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    example: 'MG Road Plaza',
    description: 'Name of the location',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'warehouse',
    description: 'Type of location',
    maxLength: 32,
  })
  @IsString()
  @MaxLength(32)
  type: string;

  @ApiPropertyOptional({
    example: {
      street: 'MG Road',
      city: 'Bengaluru',
      pincode: '560001',
    },
    description: 'Address details (JSON object)',
  })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({
    example: {
      capacity: 200,
      manager: 'John Doe',
      openHours: '9AM - 6PM',
    },
    description: 'Additional metadata (JSON object)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
