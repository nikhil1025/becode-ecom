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
exports.WishlistController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const wishlist_service_1 = require("./wishlist.service");
let WishlistController = class WishlistController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async getWishlist(req) {
        return this.wishlistService.getUserWishlist(req.user.userId);
    }
    async addToWishlist(req, productId) {
        return this.wishlistService.addToWishlist(req.user.userId, productId);
    }
    async removeFromWishlist(req, itemId) {
        return this.wishlistService.removeFromWishlist(req.user.userId, itemId);
    }
    async clearWishlist(req) {
        return this.wishlistService.clearWishlist(req.user.userId);
    }
    async checkWishlist(req, productId) {
        return this.wishlistService.isInWishlist(req.user.userId, productId);
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "getWishlist", null);
__decorate([
    (0, common_1.Post)(':productId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "addToWishlist", null);
__decorate([
    (0, common_1.Delete)(':itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "removeFromWishlist", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "clearWishlist", null);
__decorate([
    (0, common_1.Get)('check/:productId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "checkWishlist", null);
exports.WishlistController = WishlistController = __decorate([
    (0, common_1.Controller)('wishlist'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map