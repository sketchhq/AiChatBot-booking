import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { VetAvailabilityRuleService } from './vet-availability-rule.service';
import { CreateVetAvailabilityRuleDto } from './dto/create-vet-availability-rule.dto';
import { UpdateVetAvailabilityRuleDto } from './dto/update-vet-availability-rule.dto';

@ApiTags('Vet Availability Rules')
@Controller('vet-availability-rules')
export class VetAvailabilityRuleController {
  constructor(private readonly service: VetAvailabilityRuleService) {}

  // ================= CREATE =================

  @Post()
  @ApiOperation({ summary: 'Create availability rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  create(@Body() dto: CreateVetAvailabilityRuleDto) {
    return this.service.create(dto);
  }

  // ================= GET ALL =================

  @Get()
  @ApiOperation({ summary: 'Get all availability rules' })
  findAll() {
    return this.service.findAll();
  }

  // ================= GET BY VET =================
  // IMPORTANT: Specific route must come before :id

  @Get('vet/:vet_id')
  @ApiOperation({ summary: 'Get availability rules by vet ID' })
  findByVet(
    @Param('vet_id', new ParseUUIDPipe()) vet_id: string,
  ) {
    return this.service.findByVet(vet_id);
  }

  // ================= GET ONE =================

  @Get(':id')
  @ApiOperation({ summary: 'Get availability rule by ID' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.findOne(id);
  }

  // ================= UPDATE =================

  @Patch(':id')
  @ApiOperation({ summary: 'Update availability rule' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVetAvailabilityRuleDto,
  ) {
    return this.service.update(id, dto);
  }

  // ================= DELETE =================

  @Delete(':id')
  @ApiOperation({ summary: 'Delete availability rule' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.remove(id);
  }
}