import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Allow request even if JWT is missing or invalid
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to authenticate user normally
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (error) {
      // ❗ If token missing / invalid → allow as guest
      return true;
    }
  }

  /**
   * If JWT exists and valid → user is attached
   * If not → req.user = null
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null; // guest user
    }
    return user; // authenticated user
  }
}
