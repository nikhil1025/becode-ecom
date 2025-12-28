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
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private s3: S3Service,
    private mailService: MailService,
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

      const user = await this.prisma.$transaction(async (tx) => {
        // Check if user already exists
        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
          },
        });

        // Create a wallet for the new user
        await tx.wallet.create({
          data: {
            userId: newUser.id,
          },
        });

        return newUser;
      });

      const token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      // Send welcome email (non-blocking)
      this.mailService
        .sendWelcomeEmail(user.email, {
          firstName: user.firstName || 'there',
          email: user.email,
        })
        .catch((err) => console.error('Failed to send welcome email:', err));

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
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    try {
      // Check if any admin exists
      const adminCount = await this.prisma.user.count({
        where: {
          OR: [{ role: 'ADMIN' }, { role: 'SUPERADMIN' }],
        },
      });

      // Allow first admin to be created without authentication
      // After that, only authenticated admins can create new admins
      if (adminCount > 2) {
        throw new UnauthorizedException(
          'Admin registration is closed. Please contact an existing administrator.',
        );
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

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    },
  ): Promise<UserWithoutPassword> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      // Validate data
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new BadRequestException('Invalid email format');
        }

        // Check if email is already taken by another user
        const existingUser = await this.prisma.user.findFirst({
          where: {
            email: data.email,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new ConflictException('Email is already in use');
        }
      }

      // Update user
      const updateData: any = {};
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
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

      // Send password reset email (non-blocking)
      this.mailService
        .sendPasswordResetEmail(user.email, {
          firstName: user.firstName || 'there',
          resetToken,
          expiresIn: '1 hour',
        })
        .catch((err) =>
          console.error('Failed to send password reset email:', err),
        );

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

  async hasPassword(userId: string): Promise<{ hasPassword: boolean }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { googleId: true, password: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // User has password if they don't have a googleId or if password is set
      // For Google users, password might be empty or a placeholder
      const hasPassword = !user.googleId || user.password !== '';

      return { hasPassword };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to check password status');
    }
  }

  async createPassword(
    userId: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      if (!newPassword) {
        throw new BadRequestException('New password is required');
      }

      if (newPassword.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user already has a password
      if (!user.googleId) {
        throw new BadRequestException('User already has a password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password has been created successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create password');
    }
  }
}
