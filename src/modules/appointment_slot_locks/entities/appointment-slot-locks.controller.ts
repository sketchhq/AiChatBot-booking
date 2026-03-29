import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AppointmentSlotLocksService } from './appointment-slot-locks.service';
import { CreateAppointmentSlotLockDto } from './dto/create-appointment-slot-lock.dto';
import { UpdateAppointmentSlotLockDto } from './dto/update-appointment-slot-lock.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Appointment Slot Locks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointment-slot-locks')
export class AppointmentSlotLocksController {
  constructor(private readonly service: AppointmentSlotLocksService) {}

  @Post()
  @ApiOperation({ summary: 'Lock appointment slot' })
  create(@Body() dto: CreateAppointmentSlotLockDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all slot locks with veterinarian details',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slot lock by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update slot lock' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentSlotLockDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete slot lock' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}