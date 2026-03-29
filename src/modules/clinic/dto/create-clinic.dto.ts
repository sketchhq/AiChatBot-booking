import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ example: 'Happy Pets Clinic' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Pet Street', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Chennai', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Tamil Nadu', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '600001', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'contact@clinic.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'We specialize in pet surgeries', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
