import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private service: ClinicsService) {}

@Post(':id/photo')
@UseInterceptors(FileInterceptor('photo', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only image files allowed'), false);
    }
    cb(null, true);
  },
}))
async uploadPhoto(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
) {
  if (!file) {
    throw new BadRequestException('Photo is required');
  }

  if (req.user.role !== 'ADMIN') {
    throw new ForbiddenException('Only admin can upload clinic photo');
  }

  return this.service.uploadClinicPhoto(id, file);
}

  @Get()
  @ApiOperation({ summary: 'Get all clinics with search & pagination' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clinic by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update clinic details' })
  update(@Param('id') id: string, @Body() dto: UpdateClinicDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete clinic' })
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted clinic' })
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete clinic permanently' })
  hardDelete(@Param('id') id: string) {
    return this.service.hardDelete(id);
  }
}
