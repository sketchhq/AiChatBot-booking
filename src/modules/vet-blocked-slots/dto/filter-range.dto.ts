import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class FilterRangeDto {
  @IsUUID()
  vet_id: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
