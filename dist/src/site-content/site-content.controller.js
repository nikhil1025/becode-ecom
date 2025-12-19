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
    findAll() {
        return this.siteContentService.findAll();
    }
    findOne(type) {
        const contentType = type.toUpperCase();
        return this.siteContentService.findOne(contentType);
    }
    update(type, body) {
        const contentType = type.toUpperCase();
        return this.siteContentService.upsert(contentType, body.title, body.content);
    }
};
exports.SiteContentController = SiteContentController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':type'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SiteContentController.prototype, "update", null);
exports.SiteContentController = SiteContentController = __decorate([
    (0, common_1.Controller)('site-content'),
    __metadata("design:paramtypes", [site_content_service_1.SiteContentService])
], SiteContentController);
//# sourceMappingURL=site-content.controller.js.map