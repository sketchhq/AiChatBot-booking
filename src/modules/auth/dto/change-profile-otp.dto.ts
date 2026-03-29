import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';



export class SendPhoneOtpDto {
  @ApiProperty({
    example: '+91908021291',
    description: 'New phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyPhoneOtpDto {
  @ApiProperty({
    example: '+919108021291',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP received on phone',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SendEmailOtpDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'New email address',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({
    example: 'user@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '654321',
    description: 'OTP received on email',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
