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
exports.PopularProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PopularProductsService = class PopularProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const existing = await this.prisma.popularProduct.findUnique({
            where: { productId: dto.productId },
        });
        if (existing)
            throw new common_1.ConflictException('Product is already marked as popular');
        return this.prisma.popularProduct.create({
            data: {
                productId: dto.productId,
                priority: dto.priority ?? 0,
                score: dto.score ?? 0,
                isActive: dto.isActive ?? true,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        images: { where: { isFeatured: true }, take: 1 },
                    },
                },
            },
        });
    }
    async findAll(isActive) {
        return this.prisma.popularProduct.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        status: true,
                        images: { where: { isFeatured: true }, take: 1 },
                        category: { select: { name: true } },
                        brand: { select: { name: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
        });
    }
    async findOne(id) {
        const popular = await this.prisma.popularProduct.findUnique({
            where: { id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        status: true,
                        images: { where: { isFeatured: true }, take: 1 },
                    },
                },
            },
        });
        if (!popular)
            throw new common_1.NotFoundException('Popular product not found');
        return popular;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.popularProduct.update({
            where: { id },
            data: dto,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        images: { where: { isFeatured: true }, take: 1 },
                    },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.popularProduct.delete({ where: { id } });
    }
    async reorder(items) {
        const updates = items.map((item) => this.prisma.popularProduct.update({
            where: { id: item.id },
            data: { priority: item.priority },
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Reordered successfully' };
    }
};
exports.PopularProductsService = PopularProductsService;
exports.PopularProductsService = PopularProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PopularProductsService);
//# sourceMappingURL=popular-products.service.js.map