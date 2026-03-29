import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('chatbot')
@ApiTags('Chatbot Upload')
export class UploadsController {

  constructor(private readonly service: UploadsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload chatbot file to S3' })

  @ApiConsumes('multipart/form-data')

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })

  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.service.upload(file);
  }
}