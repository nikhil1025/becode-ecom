import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') ||
          'your-super-secret-jwt-key-change-this-in-production';
        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AdminJwtStrategy,
    GoogleStrategy,
    PrismaService,
    S3Service,
  ],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService],
})
export class AuthModule {}
