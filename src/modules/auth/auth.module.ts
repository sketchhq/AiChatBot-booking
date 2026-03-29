// src/modules/auth/auth.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from '../users/users.controller';
import { MailUtils } from 'src/core/utils/mailUtils';
import { HomeService } from '../users/home.service';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationToken } from '../users/entities/verification-token.entity';
import { UserAuthProvider } from '../users/entities/user-auth-provider.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { MailModule } from '../mail/mail.module';
import { UserLoginSession } from '../user-login-session/entities/user-login-session.entity';
import { UserLoginSessionsModule } from '../user-login-session/user-login-sessions.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    MailModule,
    UserLoginSessionsModule,

    TypeOrmModule.forFeature([User, UserProfile, VerificationToken, UserAuthProvider]),
    // forwardRef(() => AgentsModule),
    // JwtModule.register({
    //   secret: process.env.JWTKEY,
    //   signOptions: { expiresIn: process.env.TOKEN_EXPIRATION },
    // }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWTKEY'),
        // signOptions: { expiresIn: config.get('TOKEN_EXPIRATION') || '48h' },
      }),
      inject: [ConfigService],
    }),

  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, MailUtils, HomeService, RolesGuard
    , {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
  controllers: [AuthController, UsersController],
  exports: [AuthService, RolesGuard],
})
export class AuthModule { }
