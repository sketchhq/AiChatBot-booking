import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RescheduleService } from './reschedule.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

@ApiTags('Reschedule Appointment')
@Controller('reschedule')
export class RescheduleController {

  constructor(private readonly rescheduleService: RescheduleService) {}

  @Get(':appointmentId')
  getRescheduleDetails(@Param('appointmentId') appointmentId: string) {
    return this.rescheduleService.getRescheduleDetails(appointmentId);
  }

  @Post()
  rescheduleAppointment(@Body() dto: RescheduleAppointmentDto) {
    return this.rescheduleService.rescheduleAppointment(dto);
  }

  @Patch('cancel')
  cancelAppointment(@Body() dto: CancelAppointmentDto) {
    return this.rescheduleService.cancelAppointment(dto);
  }

}