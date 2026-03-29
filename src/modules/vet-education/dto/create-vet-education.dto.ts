import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVetEducationDto {
  @ApiProperty({ example: 'MVSc Veterinary Medicine' })
  @IsString()
  degree: string;

  @ApiProperty({ example: 'Indian Veterinary Research Institute' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 2014 })
  @IsInt()
  @Min(1950)
  start_year: number;

  @ApiProperty({ example: 2016 })
  @IsInt()
  @Min(1950)
  end_year: number;
}