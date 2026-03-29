import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserLoginSessionsService } from './user-login-sessions.service';

@ApiTags('User Security')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users/security/devices')
export class UserLoginSessionsController {
  constructor(private readonly service: UserLoginSessionsService) {}

  @Get()
  getDevices(@Req() req) {
    return this.service.getUserSessions(req.user.id);
  }

  @Delete(':sessionId')
  logoutDevice(@Req() req, @Param('sessionId') sessionId: string) {
    return this.service.logoutSession(req.user.id, sessionId);
  }

  @Delete()
  logoutAll(@Req() req) {
    return this.service.logoutAllSessions(req.user.id);
  }

}