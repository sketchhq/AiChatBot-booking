import { ApiProperty } from '@nestjs/swagger';

export class DoctorDashboardResponseDto {

  @ApiProperty()
  todays_appointments: number;

  @ApiProperty()
  waiting_patients: number;

  @ApiProperty()
  completed_consultations: number;

  @ApiProperty()
  earnings_today: number;

  @ApiProperty()
  total_patients_this_week: number;

  @ApiProperty()
  revenue_this_week: number;
}