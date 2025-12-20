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
const file_upload_service_1 = require("../common/services/file-upload.service");
let ProductsService = class ProductsService {
    prisma;
    fileUploadService;
    constructor(prisma, fileUploadService) {
        this.prisma = prisma;
        this.fileUploadService = fileUploadService;
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
            const where = {
                status: 'PUBLISHED',
                isDeleted: false,
            };
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
            const page = filters?.page || 1;
            const limit = filters?.limit || 20;
            const skip = (page - 1) * limit;
            const [products, total] = await Promise.all([
                this.prisma.product.findMany({
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
                        longDescription: true,
                        shortDescription: true,
                        sku: true,
                        status: true,
                        images: {
                            select: {
                                id: true,
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
                    skip,
                    take: limit,
                }),
                this.prisma.product.count({ where }),
            ]);
            const transformedProducts = products.map((product) => ({
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
                stockQuantity: product.stockQuantity,
                averageRating: product.averageRating,
                reviewCount: product.reviewCount,
                isFeatured: product.isFeatured,
                category: product.category,
                brand: product.brand,
                images: product.images,
                regularPrice: product.regularPrice,
                shortDescription: product.shortDescription,
                longDescription: product.longDescription,
                sku: product.sku,
                status: product.status,
            }));
            return {
                products: transformedProducts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
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
                where: {
                    id,
                    isDeleted: false,
                },
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
                include: {
                    orderItems: true,
                },
            });
            if (!existingProduct) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            if (existingProduct.orderItems && existingProduct.orderItems.length > 0) {
                throw new common_1.BadRequestException('Cannot delete product that is linked to existing orders. Use soft delete instead.');
            }
            return this.prisma.product.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
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
    async restore(id) {
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
            if (!existingProduct.isDeleted) {
                throw new common_1.BadRequestException('Product is not deleted');
            }
            return this.prisma.product.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to restore product: ' + error.message);
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
            const resizeOptions = { width: 800, height: 800 };
            const pathPrefix = `products/${productId}`;
            const uploadedImagesData = await this.fileUploadService.uploadMultipleImages(files, pathPrefix, resizeOptions);
            const createdImages = await this.prisma.productImage.createMany({
                data: uploadedImagesData.map((img) => ({
                    productId,
                    url: img.url,
                    altText: product.name,
                })),
            });
            return createdImages;
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
            const resizeOptions = { width: 800, height: 800 };
            const pathPrefix = 'products/temp';
            const uploadedImagesData = await this.fileUploadService.uploadMultipleImages(files, pathPrefix, resizeOptions);
            return uploadedImagesData.map((result) => result.url);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload product images: ' + error.message);
        }
    }
    async findBySlug(slug) {
        try {
            if (!slug) {
                throw new common_1.BadRequestException('Product slug is required');
            }
            const product = await this.prisma.product.findUnique({
                where: { slug, status: 'PUBLISHED' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    longDescription: true,
                    regularPrice: true,
                    salePrice: true,
                    stockQuantity: true,
                    sku: true,
                    averageRating: true,
                    reviewCount: true,
                    isFeatured: true,
                    metaTitle: true,
                    metaDescription: true,
                    images: {
                        select: {
                            id: true,
                            url: true,
                            altText: true,
                            isFeatured: true,
                        },
                        orderBy: { isFeatured: 'desc' },
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
                    variants: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            stockQuantity: true,
                        },
                    },
                    reviews: {
                        where: { status: 'APPROVED' },
                        select: {
                            id: true,
                            rating: true,
                            content: true,
                            createdAt: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with slug "${slug}" not found`);
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
    async findAllAdmin(filters) {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters?.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { sku: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters?.status) {
                where.status = filters.status;
            }
            const [products, total] = await Promise.all([
                this.prisma.product.findMany({
                    where,
                    include: {
                        images: {
                            where: { isFeatured: true },
                            take: 1,
                        },
                        category: true,
                        brand: true,
                        variants: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.product.count({ where }),
            ]);
            return {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve admin products: ' + error.message);
        }
    }
    async findDeletedProducts() {
        try {
            return this.prisma.product.findMany({
                where: { isDeleted: true, includeDeleted: true },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve deleted products: ' + error.message);
        }
    }
    async restoreProduct(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const product = await this.prisma.product.findUnique({
                where: { id, includeDeleted: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            return this.prisma.product.update({
                where: { id },
                data: { isDeleted: false },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to restore product: ' + error.message);
        }
    }
    async forceDeleteProduct(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const product = await this.prisma.product.findUnique({
                where: { id, includeDeleted: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            await this.prisma.product.delete({
                where: { id, forceDelete: true },
            });
            return { message: `Product ${id} permanently deleted.` };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to permanently delete product: ' + error.message);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_upload_service_1.FileUploadService])
], ProductsService);
//# sourceMappingURL=products.service.js.map