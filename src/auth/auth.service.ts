import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private s3: S3Service,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException('All fields are required');
      }

      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      const token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async adminLogin(
    email: string,
    password: string,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid admin credentials');
      }

      // Check if user has admin or superadmin role
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        throw new UnauthorizedException('Admin access required');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid admin credentials');
      }

      // Sign with ADMIN_JWT_SECRET for admin tokens
      const token = this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret:
            process.env.ADMIN_JWT_SECRET ||
            'your-super-secret-admin-jwt-key-change-in-production',
          expiresIn: '7d',
        },
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login as admin');
    }
  }

  async adminRegister(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    requestingUser?: User,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      // Check if any admin exists
      const adminCount = await this.prisma.user.count({
        where: {
          OR: [{ role: 'ADMIN' }, { role: 'SUPERADMIN' }],
        },
      });

      // If admins exist, require authentication from an existing admin
      if (adminCount > 0) {
        if (
          !requestingUser ||
          (requestingUser.role !== 'ADMIN' &&
            requestingUser.role !== 'SUPERADMIN')
        ) {
          throw new UnauthorizedException(
            'Only administrators can create admin accounts',
          );
        }
      }

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException('All fields are required');
      }

      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
        },
      });

      // Sign with ADMIN_JWT_SECRET for admin tokens
      const token = this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret:
            process.env.ADMIN_JWT_SECRET ||
            'your-super-secret-admin-jwt-key-change-in-production',
          expiresIn: '7d',
        },
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register admin');
    }
  }

  async validateUser(userId: string): Promise<UserWithoutPassword | null> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  generateJwtToken(user: UserWithoutPassword): string {
    try {
      if (!user || !user.id || !user.email) {
        throw new BadRequestException('Invalid user data');
      }

      return this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to generate token');
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    const { url } = await this.s3.uploadAvatar(userId, file);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
    });

    const { password: _, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          message: 'If that email exists, a password reset link has been sent',
        };
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = this.jwtService.sign(
        { userId: user.id, type: 'password-reset' },
        { expiresIn: '1h' },
      );

      // In a real app, send email here
      // For now, we'll just return the token (in production, this would be sent via email)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      // TODO: Send email with reset link: ${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}

      return {
        message: 'If that email exists, a password reset link has been sent',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to process password reset request',
      );
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      if (!token || !newPassword) {
        throw new BadRequestException('Token and new password are required');
      }

      if (newPassword.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Verify token
      let payload: any;
      try {
        payload = this.jwtService.verify(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      if (!currentPassword || !newPassword) {
        throw new BadRequestException(
          'Current password and new password are required',
        );
      }

      if (newPassword.length < 6) {
        throw new BadRequestException(
          'New password must be at least 6 characters long',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password has been changed successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }
}
