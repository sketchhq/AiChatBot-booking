import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';

@Injectable()
export class UploadsService {

  constructor(private readonly fileUploadService: FileUploadService) {}

  async upload(file: Express.Multer.File) {

    const url = await this.fileUploadService.uploadPublic(
      file,
      'chatbot-files'
    );

    return { url };

  }

}