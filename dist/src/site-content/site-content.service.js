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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteContentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const prisma_service_1 = require("../prisma.service");
let SiteContentService = class SiteContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitizeHtml(html) {
        return isomorphic_dompurify_1.default.sanitize(html, {
            ALLOWED_TAGS: [
                'p',
                'br',
                'strong',
                'em',
                'u',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'ul',
                'ol',
                'li',
                'a',
                'blockquote',
                'code',
                'pre',
                'span',
                'div',
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        });
    }
    generateSlug(type) {
        const slugMap = {
            TERMS: 'terms',
            PRIVACY: 'privacy',
            ABOUT: 'about',
            FAQS: 'faqs',
        };
        return slugMap[type] || type.toLowerCase();
    }
    async findBySlug(slug) {
        try {
            const content = await this.prisma.siteContent.findFirst({
                where: {
                    slug,
                    status: client_1.ContentStatus.PUBLISHED,
                },
            });
            if (!content) {
                throw new common_1.NotFoundException(`Content with slug '${slug}' not found`);
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
    async findOne(type) {
        try {
            const content = await this.prisma.siteContent.findUnique({
                where: { type },
            });
            if (!content) {
                return await this.create(type, '', '', client_1.ContentStatus.DRAFT, null);
            }
            return content;
        }
        catch (error) {
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
    async create(type, title, content, status, lastUpdatedBy, metadata) {
        try {
            const slug = this.generateSlug(type);
            const sanitizedContent = this.sanitizeHtml(content);
            return await this.prisma.siteContent.create({
                data: {
                    type,
                    slug,
                    title: title || `${type} Page`,
                    content: sanitizedContent,
                    status,
                    lastUpdatedBy,
                    metadata: metadata || null,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to create content: ' + error.message);
        }
    }
    async update(type, data) {
        try {
            const updateData = {};
            if (data.title !== undefined)
                updateData.title = data.title;
            if (data.content !== undefined)
                updateData.content = this.sanitizeHtml(data.content);
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.lastUpdatedBy !== undefined)
                updateData.lastUpdatedBy = data.lastUpdatedBy;
            if (data.metadata !== undefined)
                updateData.metadata = data.metadata;
            return await this.prisma.siteContent.update({
                where: { type },
                data: updateData,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update content: ' + error.message);
        }
    }
    async upsert(type, title, content, status, lastUpdatedBy, metadata) {
        try {
            if (!title || !content) {
                throw new common_1.BadRequestException('Title and content are required');
            }
            const slug = this.generateSlug(type);
            const sanitizedContent = this.sanitizeHtml(content);
            return await this.prisma.siteContent.upsert({
                where: { type },
                create: {
                    type,
                    slug,
                    title,
                    content: sanitizedContent,
                    status: status || client_1.ContentStatus.DRAFT,
                    lastUpdatedBy,
                    metadata: metadata || null,
                },
                update: {
                    title,
                    content: sanitizedContent,
                    status: status || client_1.ContentStatus.DRAFT,
                    lastUpdatedBy,
                    metadata: metadata || null,
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
    async publish(type, lastUpdatedBy) {
        try {
            return await this.prisma.siteContent.update({
                where: { type },
                data: {
                    status: client_1.ContentStatus.PUBLISHED,
                    lastUpdatedBy,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to publish content: ' + error.message);
        }
    }
    async unpublish(type, lastUpdatedBy) {
        try {
            return await this.prisma.siteContent.update({
                where: { type },
                data: {
                    status: client_1.ContentStatus.DRAFT,
                    lastUpdatedBy,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to unpublish content: ' + error.message);
        }
    }
    async delete(type) {
        try {
            return await this.prisma.siteContent.update({
                where: { type },
                data: {
                    status: client_1.ContentStatus.DRAFT,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to delete content: ' + error.message);
        }
    }
};
exports.SiteContentService = SiteContentService;
exports.SiteContentService = SiteContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteContentService);
//# sourceMappingURL=site-content.service.js.map