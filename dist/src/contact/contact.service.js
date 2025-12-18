"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma.service");
let ContactService = class ContactService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async handleContactSubmission(data) {
        try {
            if (!data.name || data.name.trim().length === 0) {
                throw new common_1.BadRequestException('Name is required');
            }
            if (!data.email || data.email.trim().length === 0) {
                throw new common_1.BadRequestException('Email is required');
            }
            if (!data.message || data.message.trim().length === 0) {
                throw new common_1.BadRequestException('Message is required');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new common_1.BadRequestException('Invalid email format');
            }
            try {
                await this.mailService.sendContactFormResponse(data.email, {
                    name: data.name,
                    message: data.message,
                });
            }
            catch (error) {
                console.error('Failed to send contact confirmation:', error);
            }
            try {
                await this.mailService.sendContactNotificationToAdmin(data);
            }
            catch (error) {
                console.error('Failed to send admin notification:', error);
            }
            return {
                success: true,
                message: 'Thank you for contacting us. We will get back to you soon.',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process contact submission: ' + error.message);
        }
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], ContactService);
//# sourceMappingURL=contact.service.js.map