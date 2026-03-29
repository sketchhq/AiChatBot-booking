import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserProfileDto } from './create-user-profile.dto';
import { IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {

  @ApiProperty({ example: "Sharwin", required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: "Kishore", required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: "2000-05-10", required: false })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({ example: "male", required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: "https://example.com/avatar.png", required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ example: "I love coding!", required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: { theme: "dark", notifications: true },
    required: false
  })
  @IsOptional()
  @IsObject()
  preferences?: any;
}
