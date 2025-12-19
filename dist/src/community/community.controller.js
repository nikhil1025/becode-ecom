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
exports.CommunityAdminController = exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const community_service_1 = require("./community.service");
const join_community_dto_1 = require("./dto/join-community.dto");
let CommunityController = class CommunityController {
    service;
    constructor(service) {
        this.service = service;
    }
    join(dto) {
        return this.service.join(dto);
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_community_dto_1.JoinCommunityDto]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "join", null);
exports.CommunityController = CommunityController = __decorate([
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
let CommunityAdminController = class CommunityAdminController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(status) {
        return this.service.findAll(status);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateStatus(id, status) {
        return this.service.updateStatus(id, status);
    }
    updateNotes(id, notes) {
        return this.service.updateNotes(id, notes);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.CommunityAdminController = CommunityAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunityAdminController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunityAdminController.prototype, "updateNotes", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityAdminController.prototype, "remove", null);
exports.CommunityAdminController = CommunityAdminController = __decorate([
    (0, common_1.Controller)('admin/community'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPERADMIN'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityAdminController);
//# sourceMappingURL=community.controller.js.map