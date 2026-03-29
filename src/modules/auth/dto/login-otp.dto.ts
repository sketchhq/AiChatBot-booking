// src/modules/auth/dto/login-otp.dto.ts
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class LoginOtpDto {
  @IsString()
  identifier: string;

  @IsString()
  otp: string;

  @IsOptional()
  @IsUUID()
  guest_cart_id?: string;
}
