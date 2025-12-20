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
exports.ReturnsController = exports.UserReturnsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const file_filters_1 = require("../common/utils/file-filters");
const dto_1 = require("./dto");
const returns_service_1 = require("./returns.service");
let UserReturnsController = class UserReturnsController {
    returnsService;
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    async requestReturn(req, createReturnDto, files) {
        let parsedItems;
        try {
            parsedItems = JSON.parse(createReturnDto.items);
        }
        catch (error) {
            throw new common_1.BadRequestException('The "items" field must be a valid JSON string.');
        }
        if (!Array.isArray(parsedItems)) {
            throw new common_1.BadRequestException('The "items" field must be an array.');
        }
        const validationErrors = [];
        for (const item of parsedItems) {
            const dto = (0, class_transformer_1.plainToInstance)(dto_1.ReturnItemDto, item);
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                validationErrors.push({ item, errors });
            }
        }
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Validation failed for one or more items.',
                errors: validationErrors,
            });
        }
        const serviceDto = {
            ...createReturnDto,
            items: parsedItems,
        };
        return this.returnsService.requestReturn(req.user.userId, serviceDto, files);
    }
    findByUser(req) {
        return this.returnsService.findByUser(req.user.userId);
    }
};
exports.UserReturnsController = UserReturnsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, { fileFilter: file_filters_1.imageFileFilter })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateReturnDto, Array]),
    __metadata("design:returntype", Promise)
], UserReturnsController.prototype, "requestReturn", null);
__decorate([
    (0, common_1.Get)('my-returns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserReturnsController.prototype, "findByUser", null);
exports.UserReturnsController = UserReturnsController = __decorate([
    (0, common_1.Controller)('returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], UserReturnsController);
let ReturnsController = class ReturnsController {
    returnsService;
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    findAll() {
        return this.returnsService.findAll();
    }
    findOne(id) {
        return this.returnsService.findOneForAdmin(id);
    }
    updateStatus(id, body) {
        return this.returnsService.updateStatus(id, body.status, body.rejectionReason, body.adminNote);
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "updateStatus", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, common_1.Controller)('admin/returns'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map