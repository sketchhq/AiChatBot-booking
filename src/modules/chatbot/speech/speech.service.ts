import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import fs from 'fs';

@Injectable()
export class SpeechService {

  private openai: OpenAI;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    console.log('[SpeechService] OpenAI Key Diagnostic:', {
      length: key?.length || 0,
      start: key?.substring(0, 15),
      end: key?.substring((key?.length || 0) - 4)
    });
    this.openai = new OpenAI({ apiKey: key });
  }

  async transcribe(file: Express.Multer.File) {

    console.log('[SpeechService] Calling OpenAI transcribe...', { model: "whisper-1", filePath: file.path });
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: "whisper-1"
      });
      console.log('[SpeechService] transcribe success');
      return {
        text: transcription.text
      };
    } catch (err: any) {
      console.error('[SpeechService] OpenAI transcribe ERROR:', {
        status: err.status,
        message: err.message,
        type: err.type,
        code: err.code
      });
      throw err;
    }

  }

}