
/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ALLOWED_METHODS } from './core/constants';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { rateLimit } from 'express-rate-limit';
import { ResponseLoggingInterceptor } from './core/utils/ResponseLoggingInterceptor';
import device from 'express-device';
import { logger } from './core/utils/logger';
import * as bodyParser from 'body-parser';
import { GlobalExceptionFilter } from './core/utils/customValidation';
import { GlobalErrorHandler } from './core/utils/globalErrorHandler';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AES } from 'src/core/utils//encryption.util';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // one minutes
  max: 100, // 100 requests only allowed per one minutes
  message: 'Hold on their, maybe get a life instead of spamming my api.',
  standardHeaders: true,
  legacyHeaders: true,
  skipFailedRequests: true,
  validate: { xForwardedForHeader: false },
});
const corsOption = Object.freeze({
  origin: "*", // Add your allowed IP addresses and ports
  methods: ALLOWED_METHODS,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
});

async function bootstrap() {
  require('dotenv').config();
  console.log(' JWTKEY Loaded:', process.env.JWTKEY);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

 

//   app.use((req, res, next) => {
//   if (req.method !== 'GET' && req.headers['content-type']?.includes('application/json') && req.body?.data) {
//     try {
//       const decrypted = AES.decrypt(req.body.data);
//       req.body = JSON.parse(decrypted);
//     } catch (error) {
//       console.error('AES decryption failed:', error.message);
//       return res.status(400).json({ message: 'Invalid encrypted request body' });
//     }
//   }
//   next();
// });

app.use((req, res, next) => {
  console.log('AUTH HEADER:', req.headers.authorization);
  next();
});

  /*-------- security headers --------*/
  // app.enableCors({ origin: '*', methods: ALLOWED_METHODS }); //need to change enable allowed cors url only
  app.enableCors(corsOption);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', false);
  // process.env.NODE_ENV == PRODUCTION ? app.use(helmet()) : "";
   /**
   * FIX: Helmet configuration compatible with Swagger UI
   */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

  app.use(helmet.xssFilter());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.ieNoOpen());
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
  app.use(helmet.noSniff());
  app.use(cookieParser());
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');
  expressApp.set('etag', 'strong');
  /*-------- security headers --------*/
  app.useStaticAssets(join(__dirname, '..','..', 'public'), {
    prefix: '/public/',
  });
  app.setGlobalPrefix('api/v1');
  app.useStaticAssets(join(__dirname, '..', 'pdfs'));

// const swaggerConfig = new DocumentBuilder()
//     .setTitle('Pet Adoption API')
//     .setDescription('All APIs including Adoptions')
//     .setVersion('1.0')
//      .addBearerAuth(
//     {
//       type: 'http',
//       scheme: 'bearer',
//       bearerFormat: 'JWT',
//       in: 'header',
//     },
//     'access-token', // name
//   )
//     .build();

//   const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
//   SwaggerModule.setup('api', app, swaggerDocument);
  
  setupSwagger(app);
  app.use(limiter);
  app.useGlobalFilters(new GlobalErrorHandler());
  app.use(device.capture());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseLoggingInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(Number(process.env.USER_PORT||8080));
  app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.originalUrl}`);
  next();
});





  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error?.message);
    logger.error('Uncaught Exception: ' + JSON.stringify(error?.message || error?.stack || error));
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    logger.error('Unhandled Rejection at: ' + JSON.stringify(promise) + '_reason:' + JSON.stringify(reason));
  });

}
bootstrap();
