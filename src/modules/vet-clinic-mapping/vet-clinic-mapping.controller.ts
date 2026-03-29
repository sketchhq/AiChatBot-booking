import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { VetClinicMappingService } from './vet-clinic-mapping.service';
import { CreateVetClinicMappingDto } from './dto/create-vet-clinic-mapping.dto';
import { UpdateVetClinicMappingDto } from './dto/update-vet-clinic-mapping.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth('access-token')
@Controller('vet-clinic-mappings')
export class VetClinicMappingController {
  constructor(private readonly service: VetClinicMappingService) {}

  @Post()
  create(@Body() dto: CreateVetClinicMappingDto) {
    return this.service.create(dto);
  }

  @Get('vet/:vetId')
  findByVet(@Param('vetId') vetId: string) {
    return this.service.findByVet(vetId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVetClinicMappingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
