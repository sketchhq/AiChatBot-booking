import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifySignupOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Mobile number used to request the OTP',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'Phone number must be valid',
  })
  phone: string;

  @ApiProperty({
    example: '482193',
    description: '6-digit OTP sent to mobile',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 8)
  otp: string;
}
