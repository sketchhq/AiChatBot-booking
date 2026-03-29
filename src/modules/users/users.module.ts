import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { UserLoginSession } from '../user-login-session/entities/user-login-session.entity';
import { UsersController } from './users.controller';
import { UserCleanupService } from './user-cleanup.service';
import { BrevoEmailService } from 'src/core/utils/brevo-email.service';
import { Address } from '../addresses/entities/address.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, VerificationToken,UserLoginSession, Address,]),],
  providers: [UsersService,UserCleanupService, BrevoEmailService],
 // controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}