import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody   } from '@nestjs/swagger';
import { VetsService } from './vets.service';
import { CreateVetDto } from './dto/create-vet.dto';
import { UpdateVetDto } from './dto/update-vet.dto';
import { VetFilterDto } from './dto/vet-filter.dto';
import { VerificationStatus } from './entities/vet.enums';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { ConsultationType } from '../vet_availability_rules/entities/vet-availability-rule.entity';

@ApiTags('Vets')
@ApiBearerAuth('access_token')
@Controller('vets')
export class VetsController {
  constructor(private readonly service: VetsService) {}

  //  CREATE
@Post()
@UseGuards(JwtAuthGuard)
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      registration_number: { type: 'string' },
      council_name: { type: 'string' },
      years_of_experience: { type: 'number' },
      primary_specialization: { type: 'string' },
      secondary_specializations: {
        type: 'array',
        items: { type: 'string' },
      },
      languages: {
        type: 'array',
        items: { type: 'string' },
      },
      consultation_fee_online: { type: 'number' },
      profile_image: { type: 'string', format: 'binary' },
    },
  },
})
@UseInterceptors(
  FileInterceptor('profile_image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images allowed'), false);
      }
      cb(null, true);
    },
  }),
)
async create(
  @Body() dto: CreateVetDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
) {
  const user = req.user;

  if (!user) {
    throw new ForbiddenException('Invalid token');
  }

  const userId = user.sub || user.id;
  const role = user.role;

  return this.service.create(dto, userId, role, file);
}

  //  PUBLIC LIST
  @Public()
   @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@Query() filter: VetFilterDto) {
    return this.service.findAll(filter);
  }

  //  PUBLIC SINGLE
    @Public()
   @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  //  UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVetDto,
    @Req() req: any,
  ) {
    return this.service.update(
      id,
      dto,
      req.user.sub,
      req.user.role,
    );
  }

  //  DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(
      id,
      req.user.sub,
      req.user.role,
    );
  }

  //  ADMIN VERIFY
  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  verify(
    @Param('id') id: string,
    @Query('status') status: VerificationStatus,
    @Req() req: any,
  ) {
    return this.service.verify(id, status, req.user.role);
  }

@Patch(':id/profile-image')
@UseGuards(JwtAuthGuard)
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('profile_image'))
async updateProfileImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
) {
  return this.service.updateProfileImage(
    id,
    file,
    req.user.sub,
    req.user.role,
  );
}

    @Public()
   @UseGuards(OptionalJwtAuthGuard)
@Get(':id/next-available')
async nextAvailable(@Param('id') id: string) {
  return this.service.getNextAvailable(id);
}


    @Public()
   @UseGuards(OptionalJwtAuthGuard)
@Get(':id/available-slots')
async getSlots(
  @Param('id') id: string,
  @Query('date') date: string,
  @Query('consultation_type') type: string,
) {
  return this.service.getAvailableSlots(
    id,
    date,
    type.toUpperCase() as ConsultationType,
  );

}


}
