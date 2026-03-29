import { ApiProperty } from '@nestjs/swagger';
import { CancelReason } from '../enums/cancel-reason.enum';

export class CancelAppointmentDto {

  @ApiProperty({ example: '123' })
  appointment_id: string;

  @ApiProperty({
    enum: CancelReason,
    example: CancelReason.CHANGE_OF_PLANS,
  })
  reason: CancelReason;

  @ApiProperty({
    example: 'Personal reason',
  })
  description: string;

}