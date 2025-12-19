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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma.service");
let OrdersService = class OrdersService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async createOrder(userId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!data || !data.items || data.items.length === 0) {
                throw new common_1.BadRequestException('Order items are required');
            }
            if (!data.shippingAddress) {
                throw new common_1.BadRequestException('Shipping address is required');
            }
            for (const item of data.items) {
                if (!item.productId) {
                    throw new common_1.BadRequestException('Product ID is required for all items');
                }
                if (!item.quantity || item.quantity < 1) {
                    throw new common_1.BadRequestException('Valid quantity is required for all items');
                }
                if (!item.price || item.price < 0) {
                    throw new common_1.BadRequestException('Valid price is required for all items');
                }
            }
            const { items, shippingAddress, billingAddress } = data;
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * 0.1;
            const shipping = subtotal > 50 ? 0 : 10;
            const total = subtotal + tax + shipping;
            const order = await this.prisma.order.create({
                data: {
                    userId,
                    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    status: client_1.OrderStatus.PENDING,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    subtotal,
                    tax,
                    shipping,
                    total,
                    shippingAddress: shippingAddress || {},
                    billingAddress: billingAddress || shippingAddress || {},
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.price,
                            productSnapshot: {
                                name: '',
                                price: item.price,
                            },
                        })),
                    },
                },
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
            const cart = await this.prisma.cart.findUnique({ where: { userId } });
            if (cart) {
                await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
                try {
                    await this.mailService.sendOrderConfirmation(user.email, {
                        orderId: order.orderNumber,
                        totalAmount: total,
                        items: items.map((item) => ({
                            name: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    });
                }
                catch (error) {
                    console.error('Failed to send order confirmation email:', error);
                }
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create order: ' + error.message);
        }
    }
    async getUserOrders(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            return await this.prisma.order.findMany({
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve user orders: ' + error.message);
        }
    }
    async getOrderById(userId, orderId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!orderId) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            const order = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                },
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
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve order: ' + error.message);
        }
    }
    async updateOrderStatus(orderId, status) {
        try {
            if (!orderId) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            if (!status) {
                throw new common_1.BadRequestException('Order status is required');
            }
            const existingOrder = await this.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!existingOrder) {
                throw new common_1.NotFoundException('Order not found');
            }
            const order = await this.prisma.order.update({
                where: { id: orderId },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                },
                            },
                        },
                    },
                    user: true,
                },
            });
            if (order.user?.email) {
                try {
                    if (status === client_1.OrderStatus.SHIPPED) {
                        await this.mailService.sendOrderShipped(order.user.email, {
                            orderId: order.orderNumber,
                        });
                    }
                    else if (status === client_1.OrderStatus.DELIVERED) {
                        await this.mailService.sendOrderDelivered(order.user.email, {
                            orderId: order.orderNumber,
                        });
                    }
                }
                catch (error) {
                    console.error('Failed to send order status email:', error);
                }
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update order status: ' + error.message);
        }
    }
    async updatePaymentStatus(orderId, paymentStatus) {
        try {
            if (!orderId) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            if (!paymentStatus) {
                throw new common_1.BadRequestException('Payment status is required');
            }
            const existingOrder = await this.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!existingOrder) {
                throw new common_1.NotFoundException('Order not found');
            }
            return await this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update payment status: ' + error.message);
        }
    }
    async cancelOrder(userId, orderId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!orderId) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            const order = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status !== client_1.OrderStatus.PENDING &&
                order.status !== client_1.OrderStatus.PROCESSING) {
                throw new common_1.BadRequestException('Cannot cancel order in current status');
            }
            return this.prisma.order.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.CANCELLED },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to cancel order: ' + error.message);
        }
    }
    async getAllOrders(page = 1, limit = 20) {
        try {
            if (page < 1) {
                throw new common_1.BadRequestException('Page must be at least 1');
            }
            if (limit < 1 || limit > 100) {
                throw new common_1.BadRequestException('Limit must be between 1 and 100');
            }
            const skip = (page - 1) * limit;
            const [orders, total] = await Promise.all([
                this.prisma.order.findMany({
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.order.count(),
            ]);
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve orders: ' + error.message);
        }
    }
    async getAdminOrderById(orderId) {
        try {
            if (!orderId) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                    deliveryAgent: true,
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
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            const returns = await this.prisma.return.findMany({
                where: { orderId: order.id },
                include: {
                    items: {
                        include: {
                            orderItem: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });
            return {
                ...order,
                returns,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve order: ' + error.message);
        }
    }
    async getOrderTracking(userId, orderId) {
        try {
            if (!userId || !orderId) {
                throw new common_1.BadRequestException('User ID and Order ID are required');
            }
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, userId },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            const timeline = [];
            timeline.push({
                status: 'PENDING',
                label: 'Order Placed',
                timestamp: order.createdAt,
                completed: true,
            });
            if (order.status === client_1.OrderStatus.PROCESSING ||
                order.status === client_1.OrderStatus.SHIPPED ||
                order.status === client_1.OrderStatus.DELIVERED) {
                timeline.push({
                    status: 'PROCESSING',
                    label: 'Processing',
                    timestamp: order.updatedAt,
                    completed: true,
                });
            }
            if (order.status === client_1.OrderStatus.SHIPPED ||
                order.status === client_1.OrderStatus.DELIVERED) {
                timeline.push({
                    status: 'SHIPPED',
                    label: 'Shipped',
                    timestamp: order.updatedAt,
                    completed: true,
                });
            }
            if (order.status === client_1.OrderStatus.DELIVERED) {
                timeline.push({
                    status: 'DELIVERED',
                    label: 'Delivered',
                    timestamp: order.updatedAt,
                    completed: true,
                });
            }
            if (order.status === client_1.OrderStatus.CANCELLED) {
                timeline.push({
                    status: 'CANCELLED',
                    label: 'Cancelled',
                    timestamp: order.updatedAt,
                    completed: true,
                });
            }
            return {
                orderId: order.id,
                orderNumber: order.orderNumber,
                currentStatus: order.status,
                timeline,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to get order tracking: ' + error.message);
        }
    }
    async requestReturn(userId, orderId, reason, items) {
        try {
            if (!userId || !orderId || !reason) {
                throw new common_1.BadRequestException('User ID, Order ID, and reason are required');
            }
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, userId },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status !== client_1.OrderStatus.DELIVERED) {
                throw new common_1.BadRequestException('Can only request return for delivered orders');
            }
            const returnRequest = {
                id: `RET-${Date.now()}`,
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId,
                reason,
                items: items || [],
                status: 'PENDING',
                createdAt: new Date(),
            };
            return returnRequest;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to request return: ' + error.message);
        }
    }
    async getAllReturns(page = 1, limit = 20) {
        try {
            await Promise.resolve();
            return {
                returns: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve returns: ' + error.message);
        }
    }
    async updateReturnStatus(returnId, status) {
        try {
            if (!returnId || !status) {
                throw new common_1.BadRequestException('Return ID and status are required');
            }
            await Promise.resolve();
            return {
                id: returnId,
                status,
                updatedAt: new Date(),
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update return status: ' + error.message);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map