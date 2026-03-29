import { ApiProperty } from '@nestjs/swagger';
import { VetDocumentType } from './enums/vet-document.enums';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class CreateVetDocumentDto {
@ApiProperty()
@IsUUID()
vet_id: string;

@ApiProperty({ enum: VetDocumentType })
@IsEnum(VetDocumentType)
document_type: VetDocumentType;

@ApiProperty()
@IsString()
file_url: string;
}
