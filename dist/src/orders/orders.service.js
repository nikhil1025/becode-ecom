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
const wallet_service_1 = require("../wallet/wallet.service");
let OrdersService = class OrdersService {
    prisma;
    mailService;
    walletService;
    constructor(prisma, mailService, walletService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.walletService = walletService;
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
            return await this.prisma.$transaction(async (tx) => {
                const stockUpdates = [];
                for (const item of items) {
                    if (item.variantId) {
                        const variant = await tx.productVariant.findUnique({
                            where: { id: item.variantId },
                        });
                        if (!variant || variant.stockQuantity < item.quantity) {
                            throw new common_1.BadRequestException(`Not enough stock for variant ${variant?.name || item.variantId}`);
                        }
                        stockUpdates.push(tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stockQuantity: { decrement: item.quantity } },
                        }));
                    }
                    else {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                        });
                        if (!product || product.stockQuantity < item.quantity) {
                            throw new common_1.BadRequestException(`Not enough stock for product ${product?.name || item.productId}`);
                        }
                        stockUpdates.push(tx.product.update({
                            where: { id: item.productId },
                            data: { stockQuantity: { decrement: item.quantity } },
                        }));
                    }
                }
                await Promise.all(stockUpdates);
                const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const tax = subtotal * 0.1;
                const shipping = subtotal > 50 ? 0 : 10;
                const total = subtotal + tax + shipping;
                const order = await tx.order.create({
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
                                status: client_1.OrderItemStatus.PLACED,
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
                const cart = await tx.cart.findUnique({ where: { userId } });
                if (cart) {
                    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
                }
                const user = await tx.user.findUnique({ where: { id: userId } });
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
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create order: ' + error.message);
        }
    }
    async cancelOrderItems(userId, orderId, cancelItemsDto) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found.');
            }
            if (order.userId !== userId) {
                throw new common_1.NotFoundException('Order does not belong to the current user.');
            }
            const allowedTrackingStatuses = ['ORDER_PLACED', 'CONFIRMED', 'PACKED'];
            if (!allowedTrackingStatuses.includes(order.trackingStatus)) {
                throw new common_1.BadRequestException(`Order cannot be cancelled as it is already ${order.trackingStatus}. Cancellation is only allowed before shipment.`);
            }
            const cancellableStatuses = [
                client_1.OrderStatus.PENDING,
                client_1.OrderStatus.PROCESSING,
                client_1.OrderStatus.CONFIRMED,
            ];
            if (!cancellableStatuses.includes(order.status)) {
                throw new common_1.BadRequestException(`Order cannot be cancelled in its current status: ${order.status}`);
            }
            let totalRefundAmount = 0;
            const itemsToCancel = cancelItemsDto.items;
            for (const item of itemsToCancel) {
                const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
                if (!orderItem) {
                    throw new common_1.BadRequestException(`Order item ${item.orderItemId} not found in this order.`);
                }
                if (orderItem.status === client_1.OrderItemStatus.CANCELLED) {
                    throw new common_1.BadRequestException(`Order item ${item.orderItemId} is already cancelled.`);
                }
                if (orderItem.status === client_1.OrderItemStatus.RETURNED) {
                    throw new common_1.BadRequestException(`Order item ${item.orderItemId} is already returned and cannot be cancelled.`);
                }
            }
            for (const item of itemsToCancel) {
                const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
                if (orderItem && orderItem.status === client_1.OrderItemStatus.PLACED) {
                    await tx.orderItem.update({
                        where: { id: orderItem.id },
                        data: {
                            status: client_1.OrderItemStatus.CANCELLED,
                            cancellationReason: item.reason,
                            cancelledAt: new Date(),
                        },
                    });
                    if (orderItem.variantId) {
                        await tx.productVariant.update({
                            where: { id: orderItem.variantId },
                            data: { stockQuantity: { increment: orderItem.quantity } },
                        });
                    }
                    else {
                        await tx.product.update({
                            where: { id: orderItem.productId },
                            data: { stockQuantity: { increment: orderItem.quantity } },
                        });
                    }
                    totalRefundAmount += orderItem.price * orderItem.quantity;
                }
            }
            if (totalRefundAmount > 0) {
                await this.walletService.credit(userId, totalRefundAmount, `Refund for cancelled items in order ${order.orderNumber}`, order.id);
            }
            try {
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (user) {
                    const cancelledItems = [];
                    for (const item of itemsToCancel) {
                        const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
                        if (orderItem) {
                            const productSnapshot = orderItem.productSnapshot;
                            cancelledItems.push({
                                name: productSnapshot?.name || 'Unknown Product',
                                quantity: orderItem.quantity,
                                refundAmount: orderItem.price * orderItem.quantity,
                            });
                        }
                    }
                    await this.mailService.sendOrderCancellation(user.email, {
                        orderNumber: order.orderNumber,
                        cancelledItems,
                        totalRefund: totalRefundAmount,
                    });
                }
            }
            catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }
            const updatedOrderItems = await tx.orderItem.findMany({
                where: { orderId: order.id },
            });
            const allItemsCancelled = updatedOrderItems.every((item) => item.status === client_1.OrderItemStatus.CANCELLED);
            if (allItemsCancelled) {
                return tx.order.update({
                    where: { id: order.id },
                    data: { status: client_1.OrderStatus.CANCELLED },
                    include: { items: true },
                });
            }
            return tx.order.findUnique({
                where: { id: order.id },
                include: { items: true },
            });
        });
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
    async getCancelledOrders(page = 1, limit = 20) {
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
                    where: {
                        OR: [
                            { status: client_1.OrderStatus.CANCELLED },
                            {
                                items: {
                                    some: {
                                        status: client_1.OrderItemStatus.CANCELLED,
                                    },
                                },
                            },
                        ],
                    },
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
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        images: {
                                            where: { isFeatured: true },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                }),
                this.prisma.order.count({
                    where: {
                        OR: [
                            { status: client_1.OrderStatus.CANCELLED },
                            {
                                items: {
                                    some: {
                                        status: client_1.OrderItemStatus.CANCELLED,
                                    },
                                },
                            },
                        ],
                    },
                }),
            ]);
            const transformedOrders = orders.map((order) => ({
                ...order,
                cancelledItems: order.items.filter((item) => item.status === client_1.OrderItemStatus.CANCELLED),
                hasCancelledItems: order.items.some((item) => item.status === client_1.OrderItemStatus.CANCELLED),
            }));
            return {
                orders: transformedOrders,
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
            throw new common_1.InternalServerErrorException('Failed to retrieve cancelled orders: ' + error.message);
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        wallet_service_1.WalletService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map