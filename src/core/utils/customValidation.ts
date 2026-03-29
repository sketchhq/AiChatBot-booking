// global-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    const errorResponse = {
      status: false,
      statusCode: status,
      message:
        status == 400
          ? Array.isArray(exceptionResponse?.message)
            ? exceptionResponse?.message.join(',')
            : exceptionResponse?.message
          : exceptionResponse?.message || 'Validation Error',
      error: exceptionResponse?.error || 'Internal Server Error',
    };

    response.json(errorResponse);
  }
}
