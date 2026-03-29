import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from 'src/modules/locations/locations.service';
import { LocationsController } from 'src/modules/locations/locations.controller';
import { Location } from 'src/modules/locations/entities/locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationsService],
  controllers: [LocationsController],
  exports: [LocationsService],
})
export class LocationsModule {}
