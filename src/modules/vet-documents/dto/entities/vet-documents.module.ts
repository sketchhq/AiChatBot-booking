import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetDocument } from './vet-document.entity';
import { VetDocumentsService } from './vet-documents.service';
import { VetDocumentsController } from './vet-documents.controller';

@Module({
imports: [TypeOrmModule.forFeature([VetDocument])],
controllers: [VetDocumentsController],
providers: [VetDocumentsService],
})
export class VetDocumentsModule {}
