import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({ example: 'Dog Health Discussion' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;
}