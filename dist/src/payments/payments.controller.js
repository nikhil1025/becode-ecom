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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const razorpay_service_1 = require("./razorpay.service");
let PaymentsController = class PaymentsController {
    razorpay;
    constructor(razorpay) {
        this.razorpay = razorpay;
    }
    async createOrder(body) {
        return this.razorpay.createOrder(body.amount, body.currency, body.receipt);
    }
    async verifyPayment(body) {
        const isValid = this.razorpay.verifyPayment(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
        return { success: isValid };
    }
    async capturePayment(body) {
        return this.razorpay.capturePayment(body.paymentId, body.amount);
    }
    async refundPayment(body) {
        return this.razorpay.refundPayment(body.paymentId, body.amount);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('razorpay/create-order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('razorpay/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('razorpay/capture'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "capturePayment", null);
__decorate([
    (0, common_1.Post)('razorpay/refund'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [razorpay_service_1.RazorpayService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map