import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ClinicQueryDto {
  @ApiPropertyOptional({ example: 'Happy' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'false' })
  @IsOptional()
  @IsString()
  is_deleted?: string;
}
