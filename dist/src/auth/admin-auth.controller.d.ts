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
    adminRegister(body: {
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
    getProfile(req: {
        user: unknown;
    }): unknown;
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
    changePassword(req: {
        user: User;
    }, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
