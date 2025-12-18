import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3001/api/auth/google/callback',
      scope: ['profile', 'email'],
      passReqToCallback: false,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails } = profile;

    if (!emails || emails.length === 0) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    // Check if user already exists
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: id }, { email: emails[0].value }],
      },
    });

    // If user doesn't exist, create new user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: emails[0].value,
          googleId: id,
          firstName: name?.givenName || '',
          lastName: name?.familyName || '',
          password: '', // No password for Google OAuth users
          role: 'CUSTOMER',
        },
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID if they signed up with email/password first
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: id },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  }
}
