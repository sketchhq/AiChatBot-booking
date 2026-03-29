import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRecommendationsService } from './recommendations.service';
import { ProductsController } from './recommendations.controller';
import { ProductRecommendation } from './entities/recommendations.entity';
import { FileUploadModule} from 'src/common/file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRecommendation]), FileUploadModule],
   controllers: [ProductsController],
  providers: [ProductRecommendationsService],
  exports: [ProductRecommendationsService],
})
export class ProductRecommendationsModule {}