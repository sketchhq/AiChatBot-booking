import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAppLanguageDto {
  @ApiProperty({ example: 'English' })
  @IsString()
  language_name: string;

  @ApiProperty({ example: 'English language', required: false })
  @IsOptional()
  @IsString()
  language_description?: string;
}
