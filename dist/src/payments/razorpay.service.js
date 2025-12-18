"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
let RazorpayService = class RazorpayService {
    razorpay;
    constructor() {
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });
    }
    async createOrder(amount, currency = 'INR', receipt) {
        try {
            if (!amount || amount <= 0) {
                throw new common_1.BadRequestException('Valid amount is required');
            }
            const options = {
                amount: Math.round(amount * 100),
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            };
            const order = await this.razorpay.orders.create(options);
            return order;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to create Razorpay order: ' + error.message);
        }
    }
    verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        try {
            const text = `${razorpayOrderId}|${razorpayPaymentId}`;
            const signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(text)
                .digest('hex');
            return signature === razorpaySignature;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to verify payment');
        }
    }
    async capturePayment(paymentId, amount) {
        try {
            return await this.razorpay.payments.capture(paymentId, amount * 100, 'INR');
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to capture payment');
        }
    }
    async refundPayment(paymentId, amount) {
        try {
            const options = {
                amount: amount ? amount * 100 : undefined,
            };
            return await this.razorpay.payments.refund(paymentId, options);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to process refund');
        }
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map