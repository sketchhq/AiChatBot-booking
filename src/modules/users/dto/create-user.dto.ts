import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  email?: string;


  @ApiProperty({ example: '+11234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  first_name?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  last_name?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_phone_verified?: boolean;

  @ApiProperty({ example: 'en-US', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferred_locale?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  preferred_timezone?: string;

  @ApiProperty({
    example: { referralCode: 'ABC123', newsletterSubscribed: true },
    description: 'Flexible JSON field for additional user metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
