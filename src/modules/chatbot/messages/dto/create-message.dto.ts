import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  chat_id: string;

  @ApiProperty({ example: 'My dog is vomiting' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  history?: any[];
}