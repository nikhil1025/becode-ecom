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
exports.HomepageConfigController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const audit_log_service_1 = require("../common/audit-log.service");
const prisma_service_1 = require("../prisma.service");
let HomepageConfigController = class HomepageConfigController {
    prisma;
    auditLog;
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async getAll() {
        return await this.prisma.homepageConfig.findMany({
            orderBy: { sectionOrder: 'asc' },
        });
    }
    async getByKey(key) {
        return await this.prisma.homepageConfig.findUnique({
            where: { key },
        });
    }
    async update(key, data, req) {
        const oldConfig = await this.prisma.homepageConfig.findUnique({
            where: { key },
        });
        const updated = await this.prisma.homepageConfig.upsert({
            where: { key },
            update: data,
            create: { key, ...data },
        });
        await this.auditLog.createLog({
            userId: req.user.id,
            action: 'UPDATE',
            entityType: 'HomepageConfig',
            entityId: updated.id,
            changes: { old: oldConfig, new: updated },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }
    async toggleVisibility(key, req) {
        const config = await this.prisma.homepageConfig.findUnique({
            where: { key },
        });
        const updated = await this.prisma.homepageConfig.update({
            where: { key },
            data: { isEnabled: !config?.isEnabled },
        });
        await this.auditLog.createLog({
            userId: req.user.id,
            action: 'TOGGLE_VISIBILITY',
            entityType: 'HomepageConfig',
            entityId: updated.id,
            changes: {
                old: { isEnabled: config?.isEnabled },
                new: { isEnabled: updated.isEnabled },
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }
    async reorder(items, req) {
        await Promise.all(items.map((item) => this.prisma.homepageConfig.update({
            where: { id: item.id },
            data: { sectionOrder: item.order },
        })));
        await this.auditLog.createLog({
            userId: req.user.id,
            action: 'REORDER',
            entityType: 'HomepageConfig',
            entityId: 'bulk',
            changes: { items },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return { success: true };
    }
};
exports.HomepageConfigController = HomepageConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomepageConfigController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HomepageConfigController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], HomepageConfigController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':key/toggle'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HomepageConfigController.prototype, "toggleVisibility", null);
__decorate([
    (0, common_1.Put)('reorder'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], HomepageConfigController.prototype, "reorder", null);
exports.HomepageConfigController = HomepageConfigController = __decorate([
    (0, common_1.Controller)('homepage-config'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], HomepageConfigController);
//# sourceMappingURL=homepage-config.controller.js.map