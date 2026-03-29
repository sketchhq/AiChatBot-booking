import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRecommendation } from './entities/recommendations.entity';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductRecommendationsService {
  constructor(
    @InjectRepository(ProductRecommendation)
    private repo: Repository<ProductRecommendation>,

    private readonly fileUploadService: FileUploadService,
  ) {}



async createProduct(dto: CreateProductDto, files: Express.Multer.File[]) {
  const imageUrls: string[] = [];

  if (files?.length) {
    for (const file of files) {
      const url = await this.fileUploadService.uploadPublic(
        file,
        'chatbot-products',
      );
      imageUrls.push(url);
    }
  }

  const product = this.repo.create({
    ...dto,
    image_urls: imageUrls,
  });

  return this.repo.save(product);
}

  async searchProducts(options: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
    pet_type?: string;
  }) {
    const { query, category, page = 1, limit = 10 } = options;

    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('product');


    if (query) {
  qb.andWhere(
    `(product.title ILIKE :query 
      OR product.description ILIKE :query
      OR :query = ANY(product.keywords))`,
    { query: `%${query}%` },
  );
}

if (options.pet_type) {
  qb.andWhere('product.pet_type ILIKE :pet_type', {
    pet_type: `%${options.pet_type}%`,
  });
}

    if (query) {
      qb.andWhere(
        '(product.title ILIKE :query OR product.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (category) {
      qb.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    qb.skip(skip).take(limit);

    return qb.getMany();
  }
}