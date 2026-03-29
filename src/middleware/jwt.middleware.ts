// jwt.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from 'src/core/utils/logger';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: any, res: Response, next: NextFunction) {

    if (
      req.originalUrl === '/api/v1/user/restore' &&
      req.method === 'POST'
    ) {
      return next(); // 🔓 Skip JWT for restore-by-token
    }

    const excludedRoutes = [
      '/api/v1/user/restore',
      '/api/v1/auth/login',
      '/api/v1/auth/signup-admin',
      '/api/v1/auth/resend-otp',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password',
      '/api/v1/auth/refresh',
      '/api/v1/auth/signup',
      '/api/v1/auth/signup-staff',
      '/api/v1/auth/signup-branch-admin',
      '/api/v1/auth/signup-super-admin',
      '/api/v1/auth/social-login',
      '/api/v1/auth/send-signup-otp',
      '/api/v1/auth/verify-signup-otp',
      '/api/v1/auth/login/send-otp',
      '/api/v1/api-docs',
      '/api/v1',
      '/api/v1/auth/check-identifier',
      
    ];
    // console.log('req.baseUrl', req.baseUrl);
    if (excludedRoutes.includes(req.baseUrl)) {
      // Skip JWT authentication for the excluded routes
      return next();
    }
    if (!req.headers['authorization']) {
            // return next();
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }
    const authTokenHeader = req.headers['authorization'].split(' ')[1];

    if (authTokenHeader) {
      try {
        const decodedToken = jwt.verify(authTokenHeader, process.env.JWTKEY); // Replace 'your-secret-key' with your actual secret key

        console.log(decodedToken, 'authTokenHeader');

        req.user = decodedToken; // Set the decoded token in the request object for further use in the route handler

      } catch (error) {

        // Handle token verification errors
        logger.error('Token_Expiry_Error: ' + JSON.stringify(error?.message || error?.stack || error?.name || error));
        if (error.name === 'TokenExpiredError') {
          logger.error('Token_Expiry_exit: ' + JSON.stringify('Token has expired.'));
          return res.status(403).json({ code: 401, message: 'Token has expired.' });
        } else {
          logger.error('Token_Invalid_exit: ' + JSON.stringify('Token has expired.'));
          return res.status(401).json({ code: 401, message: 'Invalid token' });
        }
      }
    } else {
      logger.error('Token_Unauthorized_exit: ' + JSON.stringify('Unauthorized'));
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }
    next();
  }
}
