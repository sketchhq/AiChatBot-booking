import { IsUUID, IsDateString, Matches } from 'class-validator';

export class CheckAvailabilityDto {
  @IsUUID()
  vet_id: string;

  @IsDateString()
  date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  time: string;
}
