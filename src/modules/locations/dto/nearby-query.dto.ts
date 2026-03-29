import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class NearbyQueryDto {
  @ApiProperty({
    example: 12.9716,
    description: 'Latitude of the point',
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 77.5946,
    description: 'Longitude of the point',
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: 10,
    description: 'Radius in kilometers',
  })
  @IsNumber()
  radius: number;
}
