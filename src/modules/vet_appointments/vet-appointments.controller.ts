import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  BadRequestException,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,ApiQuery

} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VetAppointmentsService } from './vet-appointments.service';
import { CreateVetAppointmentDto } from './dto/create-vet-appointment.dto';
import { UpdateVetAppointmentDto } from './dto/update-vet-appointment.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { Roles} from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UploadAppointmentMediaDto } from './dto/create-vet-appointment.dto';
import { UseInterceptors, UploadedFiles} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';



@ApiBearerAuth('access-token')
@ApiTags('Vet Appointments')
@Controller('vet-appointments')
export class VetAppointmentsController {
  constructor(private readonly service: VetAppointmentsService) {}

  /** 🔥 Prevent empty request body */
  private validateBody(body: any) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Request body cannot be empty');
    }
  }

  /* =========================================
      BOOK APPOINTMENT (CUSTOMER ONLY)
  ========================================= */
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Book vet appointment' })
@ApiConsumes('multipart/form-data')
@UseInterceptors(FilesInterceptor('files', 5))

@ApiBody({
  schema: {
    type: 'object',
    properties: {
      pet_id: { type: 'string', format: 'uuid' },
      vet_id: { type: 'string', format: 'uuid' },
      clinic_id: { type: 'string', format: 'uuid' },
       address_id: { type: 'string', format: 'uuid' },
      consultation_type: { type: 'string', example: 'ONLINE' },
      appointment_type: { type: 'string', example: 'Consultation' },
      appointment_date: { type: 'string', example: '2026-03-15' },
      slot_start_time: { type: 'string', example: '10:00' },
      slot_end_time: { type: 'string', example: '10:30' },
      symptoms: { type: 'string', example: 'Dog vomiting' },
      notes: { type: 'string', example: 'Pet not eating properly' },

      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})

create(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: CreateVetAppointmentDto,
  @Req() req: any,
) {
  this.validateBody(dto);
  return this.service.create(dto, req.user, files);
}

  /* =========================================
      MY APPOINTMENTS
  ========================================= */

@Get('my')
@ApiQuery({ name: 'status', required: false })
@ApiQuery({ name: 'type', required: false })
@ApiQuery({ name: 'pet_id', required: false })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get my appointments' })
findMy(
  @Req() req: any,
  @Query('status') status?: string,
  @Query('type') type?: string,
  @Query('pet_id') petId?: string,
) {
  return this.service.findMyAppointments(req.user, status, type, petId);
}

  @Get(':id/online-payment')
@UseGuards(JwtAuthGuard)
getOnlinePayment(@Param('id') id: string, @Req() req: any) {
  return this.service.getOnlinePaymentPage(id, req.user);

}

 @Get(':id/pay-at-clinic')
@UseGuards(JwtAuthGuard)
getPayAtClinic(@Param('id') id: string, @Req() req: any) {
  return this.service.getClinicPaymentPage(id, req.user);
}

  /* =========================================
      UPDATE APPOINTMENT
  ========================================= */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update appointment' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVetAppointmentDto,
    @Req() req: any,
  ) {
    this.validateBody(dto);
    return this.service.update(id, dto, req.user);
  }

  /* =========================================
      CANCEL APPOINTMENT
  ========================================= */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel appointment' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.service.cancel(id, req.user);
  }

  @Patch(':id/complete')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VET)
@ApiBearerAuth()
@ApiOperation({ summary: 'Mark consultation as completed' })
async completeAppointment(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.service.completeConsultation(id, req.user);
}

  

@Get(':id/summary')
@UseGuards(JwtAuthGuard)
getSummary(@Param('id') id: string, @Req() req: any) {
  return this.service.getAppointmentSummary(id, req.user);
}



/* =========================================
    VET APPOINTMENTS LIST
========================================= */
@Get('vet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VET)
@ApiBearerAuth()
@ApiQuery({ name: 'status', required: false })
@ApiQuery({ name: 'filter', required: false, example: 'upcoming' })
@ApiOperation({ summary: 'Get appointments for logged in vet' })
findForVet(
  @Req() req: any,
  @Query('status') status?: string,
  @Query('filter') filter?: string,
) {
  return this.service.findVetAppointments(req.user, status, filter);
}


@Get('upcoming')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Upcoming appointments for logged-in user' })
getUpcoming(@Req() req: any) {
  return this.service.getUpcomingAppointments(req.user);
}



@Get(':id')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get appointment details' })
findOne(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.service.getAppointmentDetails(id, req.user);
}


 ///✅ ONLY VET CAN acess
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('appointments/:id')
  async getAppointmentDetails(@Param('id') id: string, @Req() req) {
    const vetId = req.user.user_id;

 const appointment = await this.service.getAppointmentById(id);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // 🔒 Important check
    if (appointment.vet_id !== vetId) {
      throw new ForbiddenException('You cannot access this appointment');
    }

    return appointment;
  }
}





