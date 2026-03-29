import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from 'src/modules/locations/dto/create-locations.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
