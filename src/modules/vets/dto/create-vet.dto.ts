import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVetDto {
  @ApiProperty({ example: 'TN12345' })
  @IsString()
  registration_number: string;

  @ApiProperty({ example: 'Tamil Nadu Veterinary Council' })
  @IsString()
  council_name: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  years_of_experience: number;

  @ApiProperty({ example: 'Surgery' })
  @IsString()
  primary_specialization: string;

  @ApiPropertyOptional({ example: ['Dermatology'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondary_specializations?: string[];

  @ApiPropertyOptional({ example: ['English', 'Tamil'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  consultation_fee_online?: number;

  // ✅ ADD THIS
  @ApiPropertyOptional({
    example: [
      'General Health Checkup',
      'Vaccination',
      'Surgery',
      'Emergency care',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services_offered?: string[];

  // ✅ ADD THIS
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  consultation_duration_minutes?: number;
}