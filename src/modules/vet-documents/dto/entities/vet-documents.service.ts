import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetDocument } from './vet-document.entity';
import { CreateVetDocumentDto } from './create-vet-document.dto';
import { UpdateVetDocumentDto } from './update-vet-document.dto';

@Injectable()
export class VetDocumentsService {
constructor(
@InjectRepository(VetDocument)
private readonly repo: Repository<VetDocument>,
) {}

async create(dto: CreateVetDocumentDto) {
const doc = this.repo.create(dto);
return this.repo.save(doc);
}

async findByVet(vetId: string) {
return this.repo.find({
where: { vet_id: vetId, is_deleted: false },
});
}

async verify(id: string, dto: UpdateVetDocumentDto, adminId: string) {
const doc = await this.repo.findOne({
where: { id, is_deleted: false },
});


if (!doc) throw new NotFoundException('Document not found');

doc.verification_status = dto.verification_status;
doc.verified_by = adminId;
doc.verified_at = new Date();

return this.repo.save(doc);


}

async softDelete(id: string) {
const doc = await this.repo.findOne({ where: { id } });


if (!doc) throw new NotFoundException('Document not found');

doc.is_deleted = true;
return this.repo.save(doc);


}
}
