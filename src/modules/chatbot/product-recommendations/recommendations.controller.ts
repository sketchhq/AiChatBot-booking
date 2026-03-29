import { Controller, Get, Query, UseGuards, UseInterceptors, UploadedFiles, Body, Post } from '@nestjs/common';
import { ProductRecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiConsumes, ApiBody  } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('PetCare Products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chatbot/products')
export class ProductsController {
  constructor(private readonly service: ProductRecommendationsService) {}










@Post()
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      category: { type: 'string' },
      pet_type: { type: 'string' },
      price: { type: 'number' },
      product_url: { type: 'string' },
      description: { type: 'string' },
      keywords: {
        type: 'array',
        items: { type: 'string' },
      },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      },
    },
  },
})
@UseInterceptors(FilesInterceptor('images', 10))
createProduct(
  @Body() body: CreateProductDto,
  @UploadedFiles() files: Express.Multer.File[],
) {
  return this.service.createProduct(body, files);
}


    @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  search(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.searchProducts({
      query,
      category,
      page: Number(page),
      limit: Number(limit),
    });
  }
}