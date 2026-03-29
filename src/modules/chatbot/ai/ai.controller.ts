import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AIService } from './ai.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';



ApiBearerAuth('access-token')
@ApiTags('Chatbot')
@Controller('chatbot')
export class AIController {

  constructor(private readonly aiService: AIService) {}

  /**
   * ChatGPT Streaming Endpoint
   */
  @ApiOperation({ summary: 'Chatbot streaming response' })
  @ApiBody({
    schema: {
      example: {
        messages: [
          {
            role: "system",
            content: "You are a helpful veterinary assistant."
          },
          {
            role: "user",
            content: "My dog is not eating food. What should I do?"
          }
        ]
      }
    }
  })
     @Public()
   @UseGuards(OptionalJwtAuthGuard)
  @Post('completions')
  async chat(
    @Body('messages') messages: any[],
    @Res() res: Response
  ) {

    try {

      const completion = await this.aiService.streamChat(messages);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const token = completion.choices?.[0]?.message?.content;

      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();

    } catch (error) {

      console.error('AI streaming error:', error);

      res.status(500).json({
        message: 'AI response failed'
      });

    }
  }



  /**
   * Generate short chat title
   */
     @Public()
   @UseGuards(OptionalJwtAuthGuard)
  @Post('generate-title')
  async generateTitle(@Body('messages') messages: any[]) {

    const title = await this.aiService.generateTitle(messages);

    return { title };
  }

}