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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            let cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: { userId },
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: {
                                        images: true,
                                    },
                                },
                                variant: true,
                            },
                        },
                    },
                });
            }
            return cart;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve cart: ' + error.message);
        }
    }
    async addItem(userId, productId, quantity, variantId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            if (!quantity || quantity < 1) {
                throw new common_1.BadRequestException('Quantity must be at least 1');
            }
            const cart = await this.getCart(userId);
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: { variants: true },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            let availableStock = product.stockQuantity;
            if (variantId) {
                const variant = product.variants.find((v) => v.id === variantId);
                if (!variant) {
                    throw new common_1.NotFoundException('Product variant not found');
                }
                availableStock = variant.stockQuantity;
            }
            if (availableStock < quantity) {
                throw new common_1.BadRequestException(`Insufficient stock. Only ${availableStock} available`);
            }
            const existingItem = await this.prisma.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId,
                    variantId: variantId || null,
                },
            });
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > availableStock) {
                    throw new common_1.BadRequestException(`Cannot add ${quantity} more. Maximum ${availableStock - existingItem.quantity} can be added`);
                }
                return this.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: newQuantity },
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        },
                        variant: true,
                    },
                });
            }
            const price = product.salePrice || product.regularPrice;
            return this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    variantId,
                    quantity,
                    price,
                },
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                    variant: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to add item to cart: ' + error.message);
        }
    }
    async updateItem(userId, itemId, quantity) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!itemId) {
                throw new common_1.BadRequestException('Item ID is required');
            }
            if (!quantity || quantity < 1) {
                throw new common_1.BadRequestException('Quantity must be at least 1');
            }
            const cart = await this.getCart(userId);
            const existingItem = await this.prisma.cartItem.findFirst({
                where: {
                    id: itemId,
                    cartId: cart.id,
                },
                include: {
                    product: true,
                    variant: true,
                },
            });
            if (!existingItem) {
                throw new common_1.NotFoundException('Cart item not found');
            }
            let availableStock = existingItem.product.stockQuantity;
            if (existingItem.variant) {
                availableStock = existingItem.variant.stockQuantity;
            }
            if (quantity > availableStock) {
                throw new common_1.BadRequestException(`Requested quantity exceeds available stock. Only ${availableStock} available`);
            }
            return this.prisma.cartItem.update({
                where: {
                    id: itemId,
                    cartId: cart.id,
                },
                data: { quantity },
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                    variant: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update cart item: ' + error.message);
        }
    }
    async removeItem(userId, itemId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!itemId) {
                throw new common_1.BadRequestException('Item ID is required');
            }
            const cart = await this.getCart(userId);
            const existingItem = await this.prisma.cartItem.findFirst({
                where: {
                    id: itemId,
                    cartId: cart.id,
                },
            });
            if (!existingItem) {
                throw new common_1.NotFoundException('Cart item not found');
            }
            return this.prisma.cartItem.delete({
                where: {
                    id: itemId,
                    cartId: cart.id,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to remove cart item: ' + error.message);
        }
    }
    async clearCart(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            const cart = await this.getCart(userId);
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return { message: 'Cart cleared successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to clear cart: ' + error.message);
        }
    }
    async getCartTotal(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            const cart = await this.getCart(userId);
            const items = await this.prisma.cartItem.findMany({
                where: { cartId: cart.id },
            });
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * 0.1;
            const shipping = subtotal > 50 ? 0 : 10;
            const total = subtotal + tax + shipping;
            return {
                subtotal,
                tax,
                shipping,
                total,
                itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to calculate cart total: ' + error.message);
        }
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map