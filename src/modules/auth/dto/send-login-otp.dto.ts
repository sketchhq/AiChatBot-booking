import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendLoginOtpDto {
  @ApiProperty({
    example: 'john@example.com OR +919876543210',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}