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
exports.FeaturedCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let FeaturedCategoriesService = class FeaturedCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const existing = await this.prisma.featuredCategory.findUnique({
            where: { categoryId: dto.categoryId },
        });
        if (existing)
            throw new common_1.ConflictException('Category is already featured');
        return this.prisma.featuredCategory.create({
            data: {
                categoryId: dto.categoryId,
                priority: dto.priority ?? 0,
                isActive: dto.isActive ?? true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                        _count: { select: { products: true } },
                    },
                },
            },
        });
    }
    async findAll(isActive) {
        return this.prisma.featuredCategory.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                        _count: { select: { products: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
        });
    }
    async findOne(id) {
        const featured = await this.prisma.featuredCategory.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                        _count: { select: { products: true } },
                    },
                },
            },
        });
        if (!featured)
            throw new common_1.NotFoundException('Featured category not found');
        return featured;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.featuredCategory.update({
            where: { id },
            data: dto,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                        _count: { select: { products: true } },
                    },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.featuredCategory.delete({ where: { id } });
    }
    async reorder(items) {
        const updates = items.map((item) => this.prisma.featuredCategory.update({
            where: { id: item.id },
            data: { priority: item.priority },
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Reordered successfully' };
    }
};
exports.FeaturedCategoriesService = FeaturedCategoriesService;
exports.FeaturedCategoriesService = FeaturedCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeaturedCategoriesService);
//# sourceMappingURL=featured-categories.service.js.map