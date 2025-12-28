import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.userId);
    if (!user) {
      return null;
    }
    // Return full user object (password already removed by validateUser)
    return user;
  }
}
