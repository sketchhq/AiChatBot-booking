import { PartialType } from '@nestjs/swagger';
import { CreateVetDto } from './create-vet.dto';

export class UpdateVetDto extends PartialType(CreateVetDto) {}
