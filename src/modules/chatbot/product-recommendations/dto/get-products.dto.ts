import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetProductsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'dog food' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Royal Canin' })
  @IsOptional()
  @IsString()
  brand?: string;
}