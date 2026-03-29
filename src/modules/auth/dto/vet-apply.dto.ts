import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import { ConsultationType } from 'src/modules/vet_availability_rules/entities/vet-availability-rule.entity';
import { OmitType } from '@nestjs/swagger';

export class VetApplyDto extends OmitType(SignupDto, [
  'pet_names',
] as const) {

  @ApiProperty({ example: 'Canine Specialist' })
  @IsString()
  @IsNotEmpty()
  primary_specialization: string;

  @ApiProperty({
    type: [String],
    example: ['VACCINATION', 'SURGERY'],
  })
  @IsArray()
  @IsString({ each: true })
  services_offered: string[];
}