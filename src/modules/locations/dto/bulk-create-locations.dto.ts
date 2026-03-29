import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateLocationDto } from 'src/modules/locations/dto/create-locations.dto';

export class BulkCreateLocationsDto {
  @ApiProperty({ type: [CreateLocationDto] }) 
  @IsArray()
  @ValidateNested({ each: true })            
  @Type(() => CreateLocationDto)
  locations: CreateLocationDto[];
}
