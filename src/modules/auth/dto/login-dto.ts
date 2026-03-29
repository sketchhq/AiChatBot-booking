import { ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
  IsEmail,
  IsUUID
} from 'class-validator';

export class LoginDto {

   @ApiProperty({
    example: 'john@example.com OR +919876543210',
    description: 'Email or Phone number',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: 'password or otp',
    description: 'Login type: password | otp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Login type is required' })
  login_type: 'password' | 'otp';

  // Only required for password login
  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password (required only when login_type = password)',
  })
  @ValidateIf((o) => o.login_type === 'password')
  @IsString()
  @IsNotEmpty({ message: 'Password is required for password login' })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters',
  })
  password?: string;

  // Only required for OTP login
  @ApiProperty({
    example: '123456',
    required: false,
    description: 'OTP code (required only when login_type = otp)',
  })
  @ValidateIf((o) => o.login_type === 'otp')
  @IsString()
  @IsNotEmpty({ message: 'OTP is required for OTP login' })
  otp?: string;

  @ApiProperty({
    example: 'device_token_123',
    required: false,
    description: 'Device token for push notifications',
  })
  @IsOptional()
  @IsString()
  device_token?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Set to true for extended session duration',
  })
  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;


    @ApiPropertyOptional({
    example: '8d31e63d-9d2a-4d92-a68f-cc5a4a6e9e11',
    description: 'Guest cart id to merge after login',
  })
  @IsOptional()
  @IsUUID()
  guest_cart_id?: string;
}


export class DeleteDto {
  @ApiProperty({ example: 'Enter your email (or) mobile number include (+91)' })
  @IsNotEmpty()
  identity: string;
}

export class UserLogoutDto {
  @ApiProperty({
    example: '4fa671ae-abc4-4920-a412-d83aa962f21e',
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}


// export class SignupDto {
//   @ApiProperty()
//   @IsEmail()
//   email: string;

//   @ApiProperty()
//   @IsStrongPassword()
//   password: string;
// }

export class VerifyEmailDto { 
  @ApiProperty({ example: '' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '' })
  otp: string;
}
export class ResendEmailDto { 
  @ApiProperty({ example: 'sample@gmail.com' })
  @IsEmail()
  email: string;
}
