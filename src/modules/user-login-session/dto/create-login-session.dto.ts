import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLoginSessionDto {
   @ApiProperty({ example: 'Android Chrome Mobile' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(255)
  device_name: string;

  @ApiProperty({ example: 'Android' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(64)
  os: string;

  @ApiProperty({ example: 'Chrome' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(64)
  browser: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ip_address: string;
}