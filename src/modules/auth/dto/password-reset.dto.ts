// src/modules/auth/dto/password-reset.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email_id: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'your-reset-token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
