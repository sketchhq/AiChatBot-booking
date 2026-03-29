import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from 'src/modules/vet_availability_rules/entities/vet-availability-rule.entity';

export class CreateVetAppointmentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  pet_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  vet_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clinic_id?: string;



  @ApiPropertyOptional({
  description: 'Required for HOME consultation',
})
@IsOptional()
@IsUUID()
address_id?: string;


@ApiPropertyOptional({
  example: 'Consultation',
})
@IsOptional()
@IsString()
appointment_type?: string;


  @ApiProperty({
    example: 'ONLINE',
  })
@IsEnum(ConsultationType)
consultation_type: ConsultationType;


  @ApiProperty({
    example: '2026-03-10',
  })
  @IsDateString()
  @IsNotEmpty()
  appointment_date: string;

  @ApiProperty({
    example: '10:00',
  })
  @IsString()
  @IsNotEmpty()
  slot_start_time: string;
  

  @ApiProperty({
    example: '10:30',
  })
  @IsString()
  @IsNotEmpty()
  slot_end_time: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  payment_type?: string; // ONLINE or CLINIC

 @ApiPropertyOptional()
@IsOptional()
@IsString()
symptoms?: string;


 @ApiProperty({
    example: 'https://example.com/image1.jpg',
  })
  @IsOptional()
  @IsArray()
symptoms_media_urls?: string[];


}



export class UploadAppointmentMediaDto {

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Upload images or videos related to pet symptoms',
  })
  files: any[];
}