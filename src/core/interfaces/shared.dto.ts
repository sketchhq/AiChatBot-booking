import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';

export enum BlockingUserType {
  USER = 'USER',
}

export class PaginationDto {
  @ApiProperty({ example: 'Some text', required: false })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pagNo?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  // Add branch filter
  @ApiProperty({ example: 'Hyderabad', required: false })
  @IsOptional()
  @IsString()
  branch?: string;

  // Add date range filters
  @ApiProperty({ example: '2024-06-01', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
