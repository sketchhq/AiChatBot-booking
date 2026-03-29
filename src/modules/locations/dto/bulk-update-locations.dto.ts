import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';

export class BulkUpdateLocationsDto {
  @ApiProperty({
    description: 'IDs of locations to update',
    type: [String],
    example: [
      'e7b8a9f0-1234-4c56-98de-abcdef123456',
      'f9c0d1e2-2345-4f67-89ab-bcdef0123456',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @ApiPropertyOptional({ description: 'New name for all selected locations' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'New type for all selected locations' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Address JSON applied to all selected locations',
    example: { city: 'Bengaluru' },
  })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Metadata JSON applied to all selected locations',
    example: { capacity: 250 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
