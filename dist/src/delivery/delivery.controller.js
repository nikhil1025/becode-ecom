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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const admin_jwt_auth_guard_1 = require("../auth/admin-jwt-auth.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const delivery_service_1 = require("./delivery.service");
let DeliveryController = class DeliveryController {
    deliveryService;
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    createAgent(body) {
        return this.deliveryService.createAgent(body.name, body.phone, body.vehicleInfo);
    }
    findAllAgents() {
        return this.deliveryService.findAllAgents();
    }
    updateAgent(id, body) {
        return this.deliveryService.updateAgent(id, body);
    }
    assignAgent(orderId, body) {
        return this.deliveryService.assignAgent(orderId, body.agentId);
    }
    updateTrackingStatus(orderId, body) {
        return this.deliveryService.updateTrackingStatus(orderId, body.status);
    }
    getOrderTracking(orderId) {
        return this.deliveryService.getOrderTracking(orderId);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Post)('agents'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Get)('agents'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "findAllAgents", null);
__decorate([
    (0, common_1.Put)('agents/:id'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/assign'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "assignAgent", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/status'),
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRole.ADMIN, client_1.$Enums.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateTrackingStatus", null);
__decorate([
    (0, common_1.Get)('orders/:orderId/track'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "getOrderTracking", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map