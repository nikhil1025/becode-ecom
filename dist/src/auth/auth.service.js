"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma.service");
const s3_service_1 = require("../storage/s3.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    s3;
    constructor(prisma, jwtService, s3) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.s3 = s3;
    }
    async register(email, password, firstName, lastName) {
        try {
            if (!email || !password || !firstName || !lastName) {
                throw new common_1.BadRequestException('All fields are required');
            }
            if (password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
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
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to register user');
        }
    }
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new common_1.BadRequestException('Email and password are required');
            }
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const token = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const { password: _, ...userWithoutPassword } = user;
            return { user: userWithoutPassword, token };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to login');
        }
    }
    async adminLogin(email, password) {
        try {
            if (!email || !password) {
                throw new common_1.BadRequestException('Email and password are required');
            }
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid admin credentials');
            }
            if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
                throw new common_1.UnauthorizedException('Admin access required');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid admin credentials');
            }
            const token = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            }, {
                secret: process.env.ADMIN_JWT_SECRET ||
                    'your-super-secret-admin-jwt-key-change-in-production',
                expiresIn: '7d',
            });
            const { password: _, ...userWithoutPassword } = user;
            return { user: userWithoutPassword, token };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to login as admin');
        }
    }
    async adminRegister(email, password, firstName, lastName, requestingUser) {
        try {
            const adminCount = await this.prisma.user.count({
                where: {
                    OR: [{ role: 'ADMIN' }, { role: 'SUPERADMIN' }],
                },
            });
            if (adminCount > 0) {
                if (!requestingUser ||
                    (requestingUser.role !== 'ADMIN' &&
                        requestingUser.role !== 'SUPERADMIN')) {
                    throw new common_1.UnauthorizedException('Only administrators can create admin accounts');
                }
            }
            if (!email || !password || !firstName || !lastName) {
                throw new common_1.BadRequestException('All fields are required');
            }
            if (password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
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
            const token = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            }, {
                secret: process.env.ADMIN_JWT_SECRET ||
                    'your-super-secret-admin-jwt-key-change-in-production',
                expiresIn: '7d',
            });
            const { password: _, ...userWithoutPassword } = user;
            return { user: userWithoutPassword, token };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to register admin');
        }
    }
    async validateUser(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return null;
            }
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to validate user');
        }
    }
    generateJwtToken(user) {
        try {
            if (!user || !user.id || !user.email) {
                throw new common_1.BadRequestException('Invalid user data');
            }
            return this.jwtService.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to generate token');
        }
    }
    async uploadAvatar(userId, file) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const { url } = await this.s3.uploadAvatar(userId, file);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: url },
        });
        const { password: _, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
    async updateProfile(userId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (data.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    throw new common_1.BadRequestException('Invalid email format');
                }
                const existingUser = await this.prisma.user.findFirst({
                    where: {
                        email: data.email,
                        NOT: { id: userId },
                    },
                });
                if (existingUser) {
                    throw new common_1.ConflictException('Email is already in use');
                }
            }
            const updateData = {};
            if (data.firstName !== undefined)
                updateData.firstName = data.firstName;
            if (data.lastName !== undefined)
                updateData.lastName = data.lastName;
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.phone !== undefined)
                updateData.phone = data.phone;
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update profile');
        }
    }
    async forgotPassword(email) {
        try {
            if (!email) {
                throw new common_1.BadRequestException('Email is required');
            }
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return {
                    message: 'If that email exists, a password reset link has been sent',
                };
            }
            const resetToken = this.jwtService.sign({ userId: user.id, type: 'password-reset' }, { expiresIn: '1h' });
            console.log(`Password reset token for ${email}: ${resetToken}`);
            return {
                message: 'If that email exists, a password reset link has been sent',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process password reset request');
        }
    }
    async resetPassword(token, newPassword) {
        try {
            if (!token || !newPassword) {
                throw new common_1.BadRequestException('Token and new password are required');
            }
            if (newPassword.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            let payload;
            try {
                payload = this.jwtService.verify(token);
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Invalid or expired reset token');
            }
            if (payload.type !== 'password-reset') {
                throw new common_1.UnauthorizedException('Invalid reset token');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            return { message: 'Password has been reset successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to reset password');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            if (!currentPassword || !newPassword) {
                throw new common_1.BadRequestException('Current password and new password are required');
            }
            if (newPassword.length < 6) {
                throw new common_1.BadRequestException('New password must be at least 6 characters long');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return { message: 'Password has been changed successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to change password');
        }
    }
    async hasPassword(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { googleId: true, password: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const hasPassword = !user.googleId || user.password !== '';
            return { hasPassword };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to check password status');
        }
    }
    async createPassword(userId, newPassword) {
        try {
            if (!newPassword) {
                throw new common_1.BadRequestException('New password is required');
            }
            if (newPassword.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            if (!user.googleId) {
                throw new common_1.BadRequestException('User already has a password');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return { message: 'Password has been created successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create password');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        s3_service_1.S3Service])
], AuthService);
//# sourceMappingURL=auth.service.js.map