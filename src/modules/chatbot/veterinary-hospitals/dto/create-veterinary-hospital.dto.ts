import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateVeterinaryHospitalDto {
  @ApiProperty()
  @IsString()
  hospital_name: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emergency_available?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opening_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  closing_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  working_days?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  google_maps_link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;
}