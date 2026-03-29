import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginSession } from './entities/user-login-session.entity';
import { CreateLoginSessionDto } from './dto/create-login-session.dto';

@Injectable()
export class UserLoginSessionsService {
  constructor(
    @InjectRepository(UserLoginSession)
    private readonly sessionRepo: Repository<UserLoginSession>,
  ) {}

  // CREATE SESSION (USED DURING LOGIN)
async createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string },
) {
  const uaData = this.parseUserAgent(meta.userAgent);

  const session = this.sessionRepo.create({
    user_id: userId,
    device_name: uaData.device_name,
    os: uaData.os,
    browser: uaData.browser,
    ip_address: meta.ip || '0.0.0.0',
    is_current: true,
  });

  return await this.sessionRepo.save(session);
}


  // GET ALL DEVICES
  async getUserSessions(userId: string) {
    return await this.sessionRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // LOGOUT SINGLE DEVICE
  async logoutSession(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.is_current = false;
    session.logged_out_at = new Date();

    return await this.sessionRepo.save(session);
  }

  // LOGOUT ALL DEVICES
  async logoutAllSessions(userId: string) {
    const sessions = await this.sessionRepo.find({
      where: { user_id: userId, logged_out_at: null },
    });

    for (const session of sessions) {
      session.is_current = false;
      session.logged_out_at = new Date();
    }

    await this.sessionRepo.save(sessions);

    return { message: 'All devices logged out successfully' };
  }



private parseUserAgent(ua?: string) {
  const userAgent = (ua || 'Unknown Device').toLowerCase();

  return {
    device_name: userAgent.slice(0, 255),
    os: userAgent.includes('android')
      ? 'Android'
      : userAgent.includes('iphone')
      ? 'iOS'
      : userAgent.includes('windows')
      ? 'Windows'
      : 'Unknown',
    browser: userAgent.includes('chrome')
      ? 'Chrome'
      : userAgent.includes('safari')
      ? 'Safari'
      : userAgent.includes('firefox')
      ? 'Firefox'
      : 'Unknown',
  };
}


}