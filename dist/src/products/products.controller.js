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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const file_filters_1 = require("../common/utils/file-filters");
const product_dto_1 = require("./dto/product.dto");
const products_service_1 = require("./products.service");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(category, minPrice, maxPrice, search, featured, page, limit) {
        return this.productsService.findAll({
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            search,
            featured: featured === 'true',
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    async findBySlug(slug) {
        return this.productsService.findBySlug(slug);
    }
    async findAllAdmin(page, limit, search, status) {
        return this.productsService.findAllAdmin({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            search,
            status,
        });
    }
    async findOne(id) {
        return this.productsService.findOne(id);
    }
    async create(data, images) {
        const imageUrls = images && images.length > 0
            ? await this.productsService.uploadProductImages(images)
            : [];
        return this.productsService.create({ ...data, images: imageUrls });
    }
    async update(id, data, images) {
        const imageUrls = images && images.length > 0
            ? await this.productsService.uploadProductImages(images)
            : undefined;
        return this.productsService.update(id, {
            ...data,
            ...(imageUrls && imageUrls.length > 0 && { images: imageUrls }),
        });
    }
    async delete(id) {
        return this.productsService.delete(id);
    }
    async findDeleted() {
        return this.productsService.findDeletedProducts();
    }
    async restore(id) {
        return this.productsService.restore(id);
    }
    async forceDelete(id) {
        return this.productsService.forceDeleteProduct(id);
    }
    async uploadImages(id, files) {
        return this.productsService.uploadImages(id, files);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('minPrice')),
    __param(2, (0, common_1.Query)('maxPrice')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('featured')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, { fileFilter: file_filters_1.imageFileFilter })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, { fileFilter: file_filters_1.imageFileFilter })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('admin/deleted'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findDeleted", null);
__decorate([
    (0, common_1.Put)(':id/restore'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/force'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "forceDelete", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { fileFilter: file_filters_1.imageFileFilter })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadImages", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map