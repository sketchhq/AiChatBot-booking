import {
Controller,
Post,
Body,
Get,
Param,
Patch,
Delete,
Req,
} from '@nestjs/common';
import { ApiTags,} from '@nestjs/swagger';
import { VetDocumentsService } from './vet-documents.service';
import { CreateVetDocumentDto } from './create-vet-document.dto';
import { UpdateVetDocumentDto } from './update-vet-document.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Vet Documents')
@Controller('vet-documents')
export class VetDocumentsController {
constructor(private readonly service: VetDocumentsService) {}

@Post()
create(@Body() dto: CreateVetDocumentDto) {
return this.service.create(dto);
}

@Get('vet/:vetId')
findByVet(@Param('vetId') vetId: string) {
return this.service.findByVet(vetId);
}

// ADMIN verifies
@Patch(':id/verify')
@UseGuards(JwtAuthGuard)
verify(
  @Param('id') id: string,
  @Body() dto: UpdateVetDocumentDto,
  @Req() req: any,
) {
  const adminId = req.user.sub || req.user.id; // ✅ correct
  return this.service.verify(id, dto, adminId);
}

@Delete(':id')
delete(@Param('id') id: string) {
return this.service.softDelete(id);
}
}
