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
exports.SiteContentController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const site_content_service_1 = require("./site-content.service");
let SiteContentController = class SiteContentController {
    siteContentService;
    constructor(siteContentService) {
        this.siteContentService = siteContentService;
    }
    findBySlug(slug) {
        return this.siteContentService.findBySlug(slug);
    }
    findAll() {
        return this.siteContentService.findAll();
    }
    findOne(type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.findOne(contentType);
    }
    create(req, body) {
        const contentType = body.type.toUpperCase();
        return this.siteContentService.create(contentType, body.title, body.content, body.status || client_1.ContentStatus.DRAFT, req.user.email, body.metadata);
    }
    update(req, type, body) {
        const contentType = type.toUpperCase();
        return this.siteContentService.update(contentType, {
            ...body,
            lastUpdatedBy: req.user.email,
        });
    }
    publish(req, type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.publish(contentType, req.user.email);
    }
    unpublish(req, type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.unpublish(contentType, req.user.email);
    }
    delete(type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.delete(contentType);
    }
    findAllLegacy() {
        return this.siteContentService.findAll();
    }
    findOneLegacy(type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.findOne(contentType);
    }
    updateLegacy(type, body) {
        const contentType = type.toUpperCase();
        return this.siteContentService.upsert(contentType, body.title, body.content);
    }
};
exports.SiteContentController = SiteContentController;
__decorate([
    (0, common_1.Get)('public/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/:type'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('admin/:type'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('admin/:type/publish'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "publish", null);
__decorate([
    (0, common_1.Put)('admin/:type/unpublish'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Delete)('admin/:type'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findAllLegacy", null);
__decorate([
    (0, common_1.Get)(':type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findOneLegacy", null);
__decorate([
    (0, common_1.Put)(':type'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "updateLegacy", null);
exports.SiteContentController = SiteContentController = __decorate([
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [site_content_service_1.SiteContentService])
], SiteContentController);
//# sourceMappingURL=site-content.controller.js.map