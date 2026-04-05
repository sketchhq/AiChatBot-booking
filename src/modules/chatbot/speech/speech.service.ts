import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import fs from 'fs';

@Injectable()
export class SpeechService {

  private openai: OpenAI | null = null;
  private isLocalMode: boolean;

  constructor() {
    this.isLocalMode = process.env.NODE_ENV === 'local';
    const key = process.env.OPENAI_API_KEY;

    console.log('[SpeechService] OpenAI Key Diagnostic:', {
      length: key?.length || 0,
      start: key?.substring(0, 15),
      end: key?.substring((key?.length || 0) - 4)
    });

    if (key && !this.isLocalMode) {
      this.openai = new OpenAI({ apiKey: key });
    } else if (this.isLocalMode) {
      console.log('[SpeechService] Running in local mode, speech transcription will return mock data');
    } else {
      console.warn('[SpeechService] OPENAI_API_KEY not found, speech transcription disabled');
    }
  }

  async transcribe(file: Express.Multer.File) {

    console.log('[SpeechService] Calling transcribe...', { model: "whisper-1", filePath: file.path });

    // In local mode, return mock transcription
    if (this.isLocalMode || !this.openai) {
      console.log('[SpeechService] Local mode: returning mock transcription');
      return {
        text: "This is a mock transcription for local development. Please configure OPENAI_API_KEY for real speech-to-text."
      };
    }

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