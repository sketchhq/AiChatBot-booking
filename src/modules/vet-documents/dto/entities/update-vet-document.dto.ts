import { ApiProperty } from '@nestjs/swagger';
import { DocumentVerificationStatus } from './enums/vet-document.enums'; 
import { IsEnum } from 'class-validator';

export class UpdateVetDocumentDto {
@ApiProperty({ enum: DocumentVerificationStatus })
@IsEnum(DocumentVerificationStatus)
verification_status: DocumentVerificationStatus;
}
