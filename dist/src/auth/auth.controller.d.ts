import { User } from '@prisma/client';
import express from 'express';
import { AuthService } from './auth.service';
type UserWithoutPassword = Omit<User, 'password'>;
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        user: {
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
        };
        token: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        user: {
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
        };
        token: string;
    }>;
    getProfile(req: {
        user: unknown;
    }): unknown;
    updateProfile(req: {
        user: User;
    }, body: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
    }): Promise<{
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
    uploadAvatar(req: {
        user: User;
    }, file: Express.Multer.File): Promise<{
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
    googleAuth(): void;
    googleAuthCallback(req: {
        user: UserWithoutPassword;
    }, res: express.Response): void;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    changePassword(req: {
        user: User;
    }, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    hasPassword(req: {
        user: User;
    }): Promise<{
        hasPassword: boolean;
    }>;
    createPassword(req: {
        user: User;
    }, body: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
export {};
