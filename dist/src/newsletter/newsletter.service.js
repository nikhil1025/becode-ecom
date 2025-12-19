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
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let NewsletterService = class NewsletterService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async subscribe(dto) {
        const existing = await this.prisma.newsletterSubscriber.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email is already subscribed');
        return this.prisma.newsletterSubscriber.create({
            data: { email: dto.email, name: dto.name, isActive: true },
        });
    }
    async findAll(isActive) {
        return this.prisma.newsletterSubscriber.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            orderBy: { subscribedAt: 'desc' },
        });
    }
    async remove(id) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { id },
        });
        if (!subscriber)
            throw new common_1.NotFoundException('Subscriber not found');
        return this.prisma.newsletterSubscriber.delete({ where: { id } });
    }
    async toggleActive(id) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { id },
        });
        if (!subscriber)
            throw new common_1.NotFoundException('Subscriber not found');
        return this.prisma.newsletterSubscriber.update({
            where: { id },
            data: { isActive: !subscriber.isActive },
        });
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map