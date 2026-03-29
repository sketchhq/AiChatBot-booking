import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginSession } from './entities/user-login-session.entity';
import { UserLoginSessionsService } from './user-login-sessions.service';
import { UserLoginSessionsController } from './user-login-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginSession])],
  controllers: [UserLoginSessionsController],
  providers: [UserLoginSessionsService],

  // ✅ THIS LINE IS CRITICAL
  exports: [UserLoginSessionsService],
})
export class UserLoginSessionsModule {}