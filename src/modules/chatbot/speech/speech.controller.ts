import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';
import {  ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth('access-token')
@Controller('chatbot')
export class SpeechController {

  constructor(private readonly service: SpeechService) {}

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  transcribe(@UploadedFile() file: Express.Multer.File) {
    return this.service.transcribe(file);
  }

}