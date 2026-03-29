import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserProfileDto {

@ApiProperty({ example: "Sharwin" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(255)
  first_name?: string;

  @ApiProperty({ example: "Kishore" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(255)
  last_name?: string;

  @ApiProperty({ example: "2000-05-16" })
  @IsOptional()
  @IsDateString()
  dob: string;

  @ApiProperty({ example: "male" })
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty({ example: "https://example.com/avatar.png" })
  @IsOptional()
  @IsString()
  avatar_url: string;

  @ApiProperty({ example: "I love coding!" })
  @IsOptional()
  @IsString()
  bio: string;

  @ApiProperty({ example: { theme: "dark", notifications: true } })
  @IsOptional()
  @IsObject()
  preferences: any;
}
