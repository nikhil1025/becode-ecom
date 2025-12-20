import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('admin-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log for debugging
    if (err || !user) {
      console.error('[AdminJwtAuthGuard] Auth failed:', {
        error: err?.message,
        info: info?.message,
        hasUser: !!user,
      });
      // Throw proper HTTP exception instead of generic Error
      throw new UnauthorizedException(
        'Unauthorized - Invalid or missing admin token',
      );
    }
    return user;
  }
}
