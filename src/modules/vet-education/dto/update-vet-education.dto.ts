import { PartialType } from '@nestjs/swagger';
import { CreateVetEducationDto } from './create-vet-education.dto';

export class UpdateVetEducationDto extends PartialType(CreateVetEducationDto) {}