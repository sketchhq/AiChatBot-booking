// global-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalErrorHandler implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
      response.json({
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString(),
      message: error.message || 'Internal Server Error',
    });
  }
}
