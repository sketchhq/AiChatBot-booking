// src/modules/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';


export class SignupDto {
  @ApiProperty({ example: 'John' })
  @Transform(({ value }) => value?.trim())
@IsString()
@IsNotEmpty()
@MaxLength(255)
first_name: string;

  @ApiProperty({ example: 'Doe' })
  @Transform(({ value }) => value?.trim())
@IsString()
@IsNotEmpty()
@MaxLength(255)
last_name: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Phone number must be valid' })
  phone: string;

  @ApiProperty({
    example: 'john@example.com',
    required: false,
    description: 'Email is optional',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    example: 'Test@123',
    required: false,
    description: 'Password optional for OTP-based signup',
  })
  @IsOptional()
  @IsString()
  @Length(8, 100)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password?: string;

  @ApiProperty({
  example: ['Buddy', 'Rocky'],
  required: false,
  type: [String],
})
@IsOptional()
@IsArray()
@IsString({ each: true })
pet_names?: string[];


  @ApiProperty({ example: 'en-US', required: false })
  @IsOptional()
  preferred_locale?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false })
  @IsOptional()
  preferred_timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  is_active?: boolean;
}

