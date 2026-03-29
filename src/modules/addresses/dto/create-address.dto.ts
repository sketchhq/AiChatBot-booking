import { IsString, IsOptional, IsNumber, IsBoolean, IsPhoneNumber  } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  label: string;

  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber(null)
  phone_number: string;


  @ApiProperty({ example: 'john' })
@IsString()
first_name: string;

@ApiProperty({ example: 'Kumar' })
@IsString()
last_name: string;


  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Apartment 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  @IsString()
  state: string;

  @ApiProperty({ example: '600001' })
  @IsString()
  postal_code: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ example: 13.0827 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 80.2707 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ example: 'ChIJYWEHuEmuEmsRm9hTkapTCrk' })
  @IsOptional()
  @IsString()
  google_place_id?: string;

  @ApiPropertyOptional({
    example: {
      delivery_instructions: 'Leave at gate',
      notes: 'Call before arrival',
    },
  })
  @IsOptional()
  metadata?: any;
}
