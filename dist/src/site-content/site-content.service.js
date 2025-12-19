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
exports.SiteContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SiteContentService = class SiteContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(type) {
        try {
            const content = await this.prisma.siteContent.findUnique({
                where: { type },
            });
            if (!content) {
                throw new common_1.NotFoundException(`${type} content not found`);
            }
            return content;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve content: ' + error.message);
        }
    }
    async findAll() {
        try {
            return await this.prisma.siteContent.findMany({
                orderBy: { updatedAt: 'desc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve content: ' + error.message);
        }
    }
    async upsert(type, title, content) {
        try {
            if (!title || !content) {
                throw new common_1.BadRequestException('Title and content are required');
            }
            return await this.prisma.siteContent.upsert({
                where: { type },
                create: {
                    type,
                    title,
                    content,
                },
                update: {
                    title,
                    content,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update content: ' + error.message);
        }
    }
};
exports.SiteContentService = SiteContentService;
exports.SiteContentService = SiteContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteContentService);
//# sourceMappingURL=site-content.service.js.map