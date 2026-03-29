import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from './logger';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const request = context?.switchToHttp().getRequest();
        const response = context?.switchToHttp().getResponse();
        const responseTime = Date.now() - now;
        const clientIP = request?.headers['x-forwarded-for'] || request?.connection?.remoteAddress;
        const deviceName = request?.device?.type;
        logger.info(
          `Entry of API-->Request: ${request?.method},  URL: ${request?.originalUrl},  Device_OS: ${request?.rawHeaders[13]},  Client_IP: ${clientIP},  Device_Type: ${deviceName}`,
        );
        logger.info(
          `Exit of API--> Response: ${request?.method},   URL: ${request?.url},  Status: ${response?.statusCode},  Response_Time: ${responseTime}ms`,
        );
      }),
    );
  }
}
