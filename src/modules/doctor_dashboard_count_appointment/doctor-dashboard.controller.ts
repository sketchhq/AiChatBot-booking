import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { DoctorDashboardService } from './doctor-dashboard.service';
import { DoctorDashboardResponseDto } from './dto/doctor-dashboard-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Doctor Dashboard')
@ApiBearerAuth()
@Controller('doctor-dashboard')
export class DoctorDashboardController {

  constructor(private readonly service: DoctorDashboardService) {}

  @Get('counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VET)
  @ApiOperation({ summary: 'Doctor dashboard statistics' })
  @ApiResponse({
    status: 200,
    type: DoctorDashboardResponseDto,
  })
  async getDashboard(@Req() req) {
    return this.service.getDashboardCounts(req.user);
  }
}