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
    adminRegister(email: string, password: string, firstName: string, lastName: string, requestingUser?: User): Promise<{
        user: UserWithoutPassword;
        token: string;
    }>;
    validateUser(userId: string): Promise<UserWithoutPassword | null>;
    generateJwtToken(user: UserWithoutPassword): string;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        email: string;
        googleId: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
export {};
