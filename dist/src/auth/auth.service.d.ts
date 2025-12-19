import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
type UserWithoutPassword = Omit<User, 'password'>;
export declare class AuthService {
    private prisma;
    private jwtService;
    private s3;
    constructor(prisma: PrismaService, jwtService: JwtService, s3: S3Service);
    register(email: string, password: string, firstName: string, lastName: string): Promise<{
        user: UserWithoutPassword;
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: UserWithoutPassword;
        token: string;
    }>;
    adminLogin(email: string, password: string): Promise<{
        user: UserWithoutPassword;
        token: string;
    }>;
    adminRegister(email: string, password: string, firstName: string, lastName: string): Promise<{
        user: UserWithoutPassword;
        token: string;
    }>;
    validateUser(userId: string): Promise<UserWithoutPassword | null>;
    generateJwtToken(user: UserWithoutPassword): string;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        isActive: boolean;
    }>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
    }): Promise<UserWithoutPassword>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    hasPassword(userId: string): Promise<{
        hasPassword: boolean;
    }>;
    createPassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
}
export {};
