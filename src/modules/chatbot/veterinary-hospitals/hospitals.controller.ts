import { Controller, Get, Query, UseGuards, Body, Post } from '@nestjs/common';
import { VeterinaryHospitalsService } from './veterinary-hospitals.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateVeterinaryHospitalDto } from './dto/create-veterinary-hospital.dto';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('PetCare Veterinary')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chatbot/vets')
export class VeterinaryHospitalsController {
  constructor(private readonly service: VeterinaryHospitalsService) {}



  @Post()
create(@Body() dto: CreateVeterinaryHospitalDto) {
  return this.service.createHospital(dto);
}



    @Public()
  @UseGuards(OptionalJwtAuthGuard)
@Get()
@ApiQuery({ name: 'city', required: false })
@ApiQuery({ name: 'area', required: false })
@ApiQuery({ name: 'service', required: false })
@ApiQuery({ name: 'emergency', required: false })
@ApiQuery({ name: 'page', required: false })
@ApiQuery({ name: 'limit', required: false })
search(
  @Query('city') city?: string,
  @Query('area') area?: string,
  @Query('service') service?: string,
  @Query('emergency') emergency?: boolean,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  return this.service.search({
    city,
    area,
    service,
    emergency,
    page: Number(page),
    limit: Number(limit),
  });
}
}