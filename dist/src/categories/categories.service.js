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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const file_upload_service_1 = require("../common/services/file-upload.service");
let CategoriesService = class CategoriesService {
    prisma;
    fileUploadService;
    constructor(prisma, fileUploadService) {
        this.prisma = prisma;
        this.fileUploadService = fileUploadService;
    }
    async findAll() {
        try {
            return await this.prisma.category.findMany({
                include: {
                    parent: true,
                    children: true,
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { position: 'asc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve categories: ' + error.message);
        }
    }
    async findOne(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Category ID is required');
            }
            const category = await this.prisma.category.findUnique({
                where: { id },
                include: {
                    parent: true,
                    children: true,
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
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            return category;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve category: ' + error.message);
        }
    }
    async getSubcategories(parentId) {
        try {
            if (!parentId) {
                throw new common_1.BadRequestException('Parent category ID is required');
            }
            return await this.prisma.category.findMany({
                where: { parentId },
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { position: 'asc' },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve subcategories: ' + error.message);
        }
    }
    async create(data) {
        try {
            if (!data.name || data.name.trim().length === 0) {
                throw new common_1.BadRequestException('Category name is required');
            }
            if (!data.slug || data.slug.trim().length === 0) {
                throw new common_1.BadRequestException('Category slug is required');
            }
            const existing = await this.prisma.category.findUnique({
                where: { slug: data.slug },
            });
            if (existing) {
                throw new common_1.ConflictException('Category with this slug already exists');
            }
            return this.prisma.category.create({
                data,
                include: {
                    parent: true,
                    children: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create category: ' + error.message);
        }
    }
    async update(id, data) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Category ID is required');
            }
            if (!data || Object.keys(data).length === 0) {
                throw new common_1.BadRequestException('Update data is required');
            }
            const category = await this.prisma.category.findUnique({
                where: { id },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (data.parentId === id) {
                throw new common_1.ConflictException('Category cannot be its own parent');
            }
            return this.prisma.category.update({
                where: { id },
                data,
                include: {
                    parent: true,
                    children: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update category: ' + error.message);
        }
    }
    async delete(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Category ID is required');
            }
            const category = await this.prisma.category.findUnique({
                where: { id },
                include: {
                    products: true,
                    children: true,
                },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (category.products.length > 0) {
                throw new common_1.ConflictException('Cannot delete category with associated products');
            }
            if (category.children.length > 0) {
                throw new common_1.ConflictException('Cannot delete category with subcategories');
            }
            await this.prisma.category.delete({
                where: { id },
            });
            return { message: 'Category deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete category: ' + error.message);
        }
    }
    async uploadImage(file) {
        try {
            const { url } = await this.fileUploadService.uploadImage(file, 'categories', { width: 500, height: 500 });
            return url;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload category image: ' + error.message);
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_upload_service_1.FileUploadService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map