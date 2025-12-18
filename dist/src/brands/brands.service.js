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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const s3_service_1 = require("../storage/s3.service");
let BrandsService = class BrandsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async findAll() {
        try {
            return await this.prisma.brand.findMany({
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { name: 'asc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve brands: ' + error.message);
        }
    }
    async findOne(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Brand ID is required');
            }
            const brand = await this.prisma.brand.findUnique({
                where: { id },
                include: {
                    products: {
                        take: 10,
                        include: {
                            images: {
                                where: { isFeatured: true },
                                take: 1,
                            },
                        },
                    },
                    _count: {
                        select: { products: true },
                    },
                },
            });
            if (!brand) {
                throw new common_1.NotFoundException('Brand not found');
            }
            return brand;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve brand: ' + error.message);
        }
    }
    async create(data) {
        try {
            if (!data.name || data.name.trim().length === 0) {
                throw new common_1.BadRequestException('Brand name is required');
            }
            if (!data.slug || data.slug.trim().length === 0) {
                throw new common_1.BadRequestException('Brand slug is required');
            }
            const existing = await this.prisma.brand.findUnique({
                where: { slug: data.slug },
            });
            if (existing) {
                throw new common_1.ConflictException('Brand with this slug already exists');
            }
            return await this.prisma.brand.create({
                data,
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create brand: ' + error.message);
        }
    }
    async update(id, data) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Brand ID is required');
            }
            if (!data || Object.keys(data).length === 0) {
                throw new common_1.BadRequestException('Update data is required');
            }
            const brand = await this.prisma.brand.findUnique({
                where: { id },
            });
            if (!brand) {
                throw new common_1.NotFoundException('Brand not found');
            }
            return await this.prisma.brand.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update brand: ' + error.message);
        }
    }
    async delete(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Brand ID is required');
            }
            const brand = await this.prisma.brand.findUnique({
                where: { id },
                include: {
                    products: true,
                },
            });
            if (!brand) {
                throw new common_1.NotFoundException('Brand not found');
            }
            if (brand.products.length > 0) {
                throw new common_1.ConflictException('Cannot delete brand with associated products');
            }
            await this.prisma.brand.delete({
                where: { id },
            });
            return { message: 'Brand deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete brand: ' + error.message);
        }
    }
    async uploadLogo(file) {
        try {
            console.log('Uploading logo:', {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer ? 'present' : 'missing',
            });
            const { url } = await this.s3.uploadProductImage('brands', file);
            console.log('Logo uploaded successfully:', url);
            return url;
        }
        catch (error) {
            console.error('Logo upload error:', error);
            throw new common_1.InternalServerErrorException('Failed to upload brand logo: ' + error.message);
        }
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], BrandsService);
//# sourceMappingURL=brands.service.js.map