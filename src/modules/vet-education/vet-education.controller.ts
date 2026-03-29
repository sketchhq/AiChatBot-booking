import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VetEducationService } from './vet-education.service';
import { CreateVetEducationDto } from './dto/create-vet-education.dto';
import { UpdateVetEducationDto } from './dto/update-vet-education.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Vet Education')
@ApiBearerAuth('access-token')
@Controller('vet-education')
export class VetEducationController {
  constructor(private readonly service: VetEducationService) {}

  @Post(':vetId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('vetId') vetId: string,
    @Body() dto: CreateVetEducationDto,
  ) {
    return this.service.create(vetId, dto);
  }

  @Get(':vetId')
  findByVet(@Param('vetId') vetId: string) {
    return this.service.findByVet(vetId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateVetEducationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}