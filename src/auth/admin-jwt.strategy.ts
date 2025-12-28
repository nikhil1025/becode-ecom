import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.ADMIN_JWT_SECRET ||
        'your-super-secret-admin-jwt-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.userId);
    if (!user) {
      return null;
    }

    // Only allow ADMIN and SUPERADMIN roles
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return null;
    }

    // Return full user object (password already removed by validateUser)
    return user;
  }
}
