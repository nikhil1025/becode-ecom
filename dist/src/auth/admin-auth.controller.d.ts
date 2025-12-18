import { User } from '@prisma/client';
import { AuthService } from './auth.service';
export declare class AdminAuthController {
    private authService;
    constructor(authService: AuthService);
    adminLogin(body: {
        email: string;
        password: string;
    }): Promise<{
        user: {
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
        };
        token: string;
    }>;
    adminRegister(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }, req: {
        user: User;
    }): Promise<{
        user: {
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
        };
        token: string;
    }>;
    getProfile(req: {
        user: unknown;
    }): unknown;
    uploadAvatar(req: {
        user: User;
    }, file: Express.Multer.File): Promise<{
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
    changePassword(req: {
        user: User;
    }, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
