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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const s3_service_1 = require("../storage/s3.service");
let ProductsService = class ProductsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async findAll(filters) {
        try {
            if (filters?.minPrice && filters.minPrice < 0) {
                throw new common_1.BadRequestException('Minimum price cannot be negative');
            }
            if (filters?.maxPrice && filters.maxPrice < 0) {
                throw new common_1.BadRequestException('Maximum price cannot be negative');
            }
            if (filters?.minPrice &&
                filters?.maxPrice &&
                filters.minPrice > filters.maxPrice) {
                throw new common_1.BadRequestException('Minimum price cannot exceed maximum price');
            }
            const where = { status: 'PUBLISHED' };
            if (filters?.category) {
                where.category = { slug: filters.category };
            }
            if (filters?.minPrice || filters?.maxPrice) {
                where.regularPrice = {};
                if (filters.minPrice)
                    where.regularPrice.gte = filters.minPrice;
                if (filters.maxPrice)
                    where.regularPrice.lte = filters.maxPrice;
            }
            if (filters?.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    {
                        shortDescription: { contains: filters.search, mode: 'insensitive' },
                    },
                ];
            }
            if (filters?.featured) {
                where.isFeatured = true;
            }
            const products = await this.prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    regularPrice: true,
                    salePrice: true,
                    stockQuantity: true,
                    averageRating: true,
                    reviewCount: true,
                    isFeatured: true,
                    images: {
                        where: { isFeatured: true },
                        take: 1,
                        select: {
                            url: true,
                            altText: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return products.map((product) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.regularPrice,
                salePrice: product.salePrice,
                discount: product.salePrice
                    ? Math.round(((product.regularPrice - product.salePrice) /
                        product.regularPrice) *
                        100)
                    : 0,
                thumbnail: product.images[0]?.url || null,
                thumbnailAlt: product.images[0]?.altText || product.name,
                stock: product.stockQuantity,
                averageRating: product.averageRating,
                reviewCount: product.reviewCount,
                isFeatured: product.isFeatured,
                category: product.category,
                brand: product.brand,
            }));
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve products: ' + error.message);
        }
    }
    async findOne(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const product = await this.prisma.product.findUnique({
                where: { id },
                include: {
                    images: true,
                    category: true,
                    brand: true,
                    variants: true,
                    reviews: {
                        where: { status: 'APPROVED' },
                        include: { user: { select: { firstName: true, lastName: true } } },
                    },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            return product;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve product: ' + error.message);
        }
    }
    async create(data) {
        try {
            if (!data) {
                throw new common_1.BadRequestException('Product data is required');
            }
            if (!data.name) {
                throw new common_1.BadRequestException('Product name is required');
            }
            if (!data.regularPrice || data.regularPrice < 0) {
                throw new common_1.BadRequestException('Valid regular price is required');
            }
            const { description, stock, isNewArrival, images, variants, specifications, tags, ...rest } = data;
            const prismaData = {
                ...rest,
                longDescription: description,
                stockQuantity: stock || 0,
            };
            Object.keys(prismaData).forEach((key) => {
                if (prismaData[key] === undefined) {
                    delete prismaData[key];
                }
            });
            return this.prisma.product.create({
                data: prismaData,
                include: {
                    images: true,
                    category: true,
                    brand: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create product: ' + error.message);
        }
    }
    async update(id, data) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            if (!data || Object.keys(data).length === 0) {
                throw new common_1.BadRequestException('Update data is required');
            }
            if (data.regularPrice && data.regularPrice < 0) {
                throw new common_1.BadRequestException('Regular price cannot be negative');
            }
            const existingProduct = await this.prisma.product.findUnique({
                where: { id },
            });
            if (!existingProduct) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            const { description, stock, isNewArrival, images, variants, specifications, tags, ...rest } = data;
            const prismaData = { ...rest };
            if (description !== undefined)
                prismaData.longDescription = description;
            if (stock !== undefined)
                prismaData.stockQuantity = stock;
            Object.keys(prismaData).forEach((key) => {
                if (prismaData[key] === undefined) {
                    delete prismaData[key];
                }
            });
            return this.prisma.product.update({
                where: { id },
                data: prismaData,
                include: {
                    images: true,
                    category: true,
                    brand: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update product: ' + error.message);
        }
    }
    async delete(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const existingProduct = await this.prisma.product.findUnique({
                where: { id },
            });
            if (!existingProduct) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            return this.prisma.product.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete product: ' + error.message);
        }
    }
    async uploadImages(productId, files) {
        try {
            if (!productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            if (!files || files.length === 0) {
                throw new common_1.BadRequestException('No files uploaded');
            }
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            const uploadedImages = [];
            for (const file of files) {
                const { url } = await this.s3.uploadProductImage(productId, file);
                const image = await this.prisma.productImage.create({
                    data: {
                        productId,
                        url,
                        altText: product.name,
                    },
                });
                uploadedImages.push(image);
            }
            return uploadedImages;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to upload images: ' + error.message);
        }
    }
    async uploadProductImages(files) {
        try {
            if (!files || files.length === 0) {
                return [];
            }
            const uploadPromises = files.map((file) => this.s3.uploadProductImage('temp', file));
            const uploadResults = await Promise.all(uploadPromises);
            return uploadResults.map((result) => result.url);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload product images: ' + error.message);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], ProductsService);
//# sourceMappingURL=products.service.js.map