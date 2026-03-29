import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { VetBlockedSlotsService } from './vet-blocked-slots.service';
import { CreateVetBlockedSlotDto } from './dto/create-vet-blocked-slot.dto';
import { UpdateVetBlockedSlotDto } from './dto/update-vet-blocked-slot.dto';

@ApiBearerAuth('access-token')
@ApiTags('VetBlockedSlots')
@Controller('vet-blocked-slots')
export class VetBlockedSlotsController {
  constructor(private readonly service: VetBlockedSlotsService) {}

  // 1️⃣ Create
  @Post()
  @ApiBody({ type: CreateVetBlockedSlotDto })
  create(@Body() dto: CreateVetBlockedSlotDto) {
    return this.service.create(dto);
  }

  // 2️⃣ Range list
  @Get()
  @ApiQuery({ name: 'vet_id', required: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  list(
    @Query('vet_id') vet_id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.list(vet_id, from, to);
  }

  // 3️⃣ Date list
  @Get('date')
  @ApiQuery({ name: 'vet_id', required: true })
  @ApiQuery({ name: 'date', required: true })
  listByDate(
    @Query('vet_id') vet_id: string,
    @Query('date') date: string,
  ) {
    return this.service.listByDate(vet_id, date);
  }

  // 4️⃣ Update
  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateVetBlockedSlotDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVetBlockedSlotDto,
  ) {
    return this.service.update(id, dto);
  }

  // 5️⃣ Delete
  @Delete(':id')
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // 6️⃣ Availability check
  @Get('check-availability')
  @ApiQuery({ name: 'vet_id', required: true })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'time', required: true })
  check(
    @Query('vet_id') vet_id: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.service.checkAvailability(vet_id, date, time);
  }
}
