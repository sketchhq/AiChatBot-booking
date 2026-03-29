import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VetReviewsService } from './vet-reviews.service';
import { CreateVetReviewDto } from './dto/create-vet-review.dto';
import { UpdateVetReviewDto } from './dto/update-vet-review.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Vet Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vet-reviews')
export class VetReviewsController {
  constructor(private readonly service: VetReviewsService) {}

  @Post()
  create(@Body() dto: CreateVetReviewDto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVetReviewDto, @Req() req) {
    return this.service.update(id, dto, req.user);
  }

  @Get('vet/:vet_id')
  findByVet(@Param('vet_id') vet_id: string) {
    return this.service.findByVet(vet_id);
  }

  @Delete(':id')
deleteReview(@Param('id') id: string, @Req() req) {
  return this.service.deleteReview(id, req.user);
}
}