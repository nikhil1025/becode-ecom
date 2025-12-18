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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserWishlist(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            const items = await this.prisma.wishlistItem.findMany({
                where: { userId },
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isFeatured: true },
                                take: 1,
                            },
                            category: true,
                            brand: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return items;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve wishlist: ' + error.message);
        }
    }
    async addToWishlist(userId, productId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            const existingItem = await this.prisma.wishlistItem.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            if (existingItem) {
                throw new common_1.ConflictException('Product already in wishlist');
            }
            const wishlistItem = await this.prisma.wishlistItem.create({
                data: {
                    userId,
                    productId,
                },
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isFeatured: true },
                                take: 1,
                            },
                        },
                    },
                },
            });
            return wishlistItem;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to add to wishlist: ' + error.message);
        }
    }
    async removeFromWishlist(userId, itemId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!itemId) {
                throw new common_1.BadRequestException('Item ID is required');
            }
            const item = await this.prisma.wishlistItem.findFirst({
                where: {
                    id: itemId,
                    userId,
                },
            });
            if (!item) {
                throw new common_1.NotFoundException('Wishlist item not found');
            }
            await this.prisma.wishlistItem.delete({
                where: { id: itemId },
            });
            return { message: 'Item removed from wishlist' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to remove from wishlist: ' + error.message);
        }
    }
    async clearWishlist(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            await this.prisma.wishlistItem.deleteMany({
                where: { userId },
            });
            return { message: 'Wishlist cleared' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to clear wishlist: ' + error.message);
        }
    }
    async isInWishlist(userId, productId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            const item = await this.prisma.wishlistItem.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            return { inWishlist: !!item };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to check wishlist status: ' + error.message);
        }
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map