import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWTKEY'),
    });
  }

  async validate(payload: any) {
    this.logger.debug(
      `🔹 [JwtStrategy] JWT payload received: ${JSON.stringify(payload)}`,
    );

    /* =========================================
       1️⃣ Validate payload structure
    ========================================= */
    if (!payload?.user_id && !payload?.sub) {
      this.logger.error(
        '❌ [JwtStrategy] Invalid JWT payload: user_id or sub missing',
      );
      throw new UnauthorizedException('Invalid JWT payload');
    }

    /* =========================================
       2️⃣ Support both user_id and sub formats
       (Backward compatibility)
    ========================================= */
    const userId = payload.user_id || payload.sub;

    /* =========================================
       3️⃣ Fetch user from DB
    ========================================= */
    const user: User =
      await this.userService.findUserIncludingDeleted(userId);

    if (!user) {
      this.logger.error(
        `❌ [JwtStrategy] User not found for id=${userId}`,
      );
      throw new UnauthorizedException('User not found');
    }

    /* =========================================
       4️⃣ Return object used in controllers
    ========================================= */
    const jwtUser = {
      id: user.id,
      sub: user.id, // 🔥 required for req.user.sub
      user_id: user.id,
      email: user.email,
      role: user.role,
      is_deleted: user.is_deleted ?? false,
    };

    this.logger.debug(
      `✅ [JwtStrategy] Authenticated user: ${JSON.stringify(jwtUser)}`,
    );

    return jwtUser;
  }
}