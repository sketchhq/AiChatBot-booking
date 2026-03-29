import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service'; 
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],  
  imports: [FileUploadModule]
})
export class UploadsModule {}