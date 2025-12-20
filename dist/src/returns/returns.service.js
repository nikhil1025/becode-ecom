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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const file_upload_service_1 = require("../common/services/file-upload.service");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let ReturnsService = class ReturnsService {
    prisma;
    fileUploadService;
    walletService;
    mailService;
    constructor(prisma, fileUploadService, walletService, mailService) {
        this.prisma = prisma;
        this.fileUploadService = fileUploadService;
        this.walletService = walletService;
        this.mailService = mailService;
    }
    async requestReturn(userId, createReturnRequest, files) {
        const { orderId, reason, items, type } = createReturnRequest;
        const newReturn = await this.prisma.$transaction(async (tx) => {
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
            if (order.status !== client_1.OrderStatus.DELIVERED) {
                throw new common_1.BadRequestException('Returns can only be requested for delivered orders.');
            }
            const deliveryDate = order.updatedAt;
            const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
            const RETURN_WINDOW_DAYS = 30;
            if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
                throw new common_1.BadRequestException(`Returns can only be requested within ${RETURN_WINDOW_DAYS} days of delivery. This order was delivered ${daysSinceDelivery} days ago.`);
            }
            for (const item of items) {
                const orderItem = await tx.orderItem.findUnique({
                    where: { id: item.orderItemId },
                });
                if (!orderItem || orderItem.orderId !== orderId) {
                    throw new common_1.BadRequestException(`Order item ${item.orderItemId} is not valid for this order.`);
                }
                if (orderItem.status === 'CANCELLED') {
                    throw new common_1.BadRequestException(`Cannot return cancelled item ${item.orderItemId}. Item was already cancelled.`);
                }
                if (orderItem.status === 'RETURNED') {
                    throw new common_1.BadRequestException(`Cannot return item ${item.orderItemId}. Item was already returned.`);
                }
                if (item.quantity > orderItem.quantity) {
                    throw new common_1.BadRequestException(`Cannot return more items than were purchased for ${orderItem.id}.`);
                }
                const existingReturnItems = await tx.returnItem.findMany({
                    where: {
                        orderItemId: item.orderItemId,
                        return: {
                            status: {
                                notIn: [client_1.ReturnStatus.REJECTED, client_1.ReturnStatus.CANCELLED],
                            },
                        },
                    },
                });
                const totalReturnedQuantity = existingReturnItems.reduce((sum, ri) => sum + ri.quantity, 0);
                if (totalReturnedQuantity + item.quantity > orderItem.quantity) {
                    throw new common_1.ConflictException(`Cannot return ${item.quantity} units of item ${item.orderItemId}. Already returned ${totalReturnedQuantity} out of ${orderItem.quantity} purchased. You can only return ${orderItem.quantity - totalReturnedQuantity} more.`);
                }
                const duplicateReturn = existingReturnItems.find((ri) => ri.quantity === item.quantity);
                if (duplicateReturn) {
                    throw new common_1.ConflictException(`A return request for ${item.quantity} units of item ${item.orderItemId} already exists. Please check your existing returns.`);
                }
            }
            const createdReturn = await tx.return.create({
                data: {
                    orderId,
                    userId,
                    reason,
                    type,
                    status: client_1.ReturnStatus.REQUESTED,
                    statusHistory: [
                        {
                            status: 'REQUESTED',
                            timestamp: new Date().toISOString(),
                            note: 'Return request submitted',
                        },
                    ],
                    items: {
                        create: items.map((item) => ({
                            orderItemId: item.orderItemId,
                            quantity: item.quantity,
                        })),
                    },
                },
            });
            let imageUrls = [];
            if (files && files.length > 0) {
                const uploadedImages = await this.fileUploadService.uploadMultipleImages(files, `returns/${createdReturn.id}`);
                imageUrls = uploadedImages.map((img) => img.url);
            }
            if (imageUrls.length > 0) {
                return tx.return.update({
                    where: { id: createdReturn.id },
                    data: { images: imageUrls },
                    include: {
                        items: true,
                        order: true,
                    },
                });
            }
            return tx.return.findUnique({
                where: { id: createdReturn.id },
                include: {
                    items: true,
                    order: true,
                },
            });
        });
        return newReturn;
    }
    async findByUser(userId) {
        try {
            return await this.prisma.return.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            orderItem: {
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
                                    variant: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                            exchangeProductRef: {
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
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve returns: ' + error.message);
        }
    }
    async findAll(page = 1, limit = 20, status, userId) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (userId) {
                where.userId = userId;
            }
            const [returns, total] = await Promise.all([
                this.prisma.return.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        items: {
                            include: {
                                orderItem: {
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
                                        variant: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },
                                },
                                exchangeProductRef: {
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
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        order: {
                            select: {
                                id: true,
                                orderNumber: true,
                                createdAt: true,
                                total: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.return.count({ where }),
            ]);
            return {
                returns,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve returns: ' + error.message);
        }
    }
    async findOneForAdmin(returnId) {
        const returnRequest = await this.prisma.return.findUnique({
            where: { id: returnId },
            include: {
                items: {
                    include: {
                        orderItem: {
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
                                variant: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                order: true,
            },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException('Return request not found.');
        }
        return returnRequest;
    }
    async updateStatus(returnId, status, rejectionReason, adminNote) {
        if (status === client_1.ReturnStatus.REFUNDED) {
            throw new common_1.BadRequestException('Refunds must be processed through the refund endpoint, not by updating status directly.');
        }
        if (status === client_1.ReturnStatus.REJECTED && !rejectionReason) {
            throw new common_1.BadRequestException('Rejection reason is required when rejecting a return');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const currentReturn = await tx.return.findUnique({
                    where: { id: returnId },
                    include: {
                        items: {
                            include: {
                                orderItem: true,
                            },
                        },
                    },
                });
                if (!currentReturn) {
                    throw new common_1.NotFoundException('Return request not found.');
                }
                const validTransitions = {
                    [client_1.ReturnStatus.REQUESTED]: [
                        client_1.ReturnStatus.UNDER_REVIEW,
                        client_1.ReturnStatus.REJECTED,
                        client_1.ReturnStatus.CANCELLED,
                    ],
                    [client_1.ReturnStatus.UNDER_REVIEW]: [
                        client_1.ReturnStatus.HOLD_FOR_INSPECTION,
                        client_1.ReturnStatus.ACCEPTED,
                        client_1.ReturnStatus.REJECTED,
                    ],
                    [client_1.ReturnStatus.HOLD_FOR_INSPECTION]: [
                        client_1.ReturnStatus.ACCEPTED,
                        client_1.ReturnStatus.REJECTED,
                    ],
                    [client_1.ReturnStatus.ACCEPTED]: [
                        client_1.ReturnStatus.EXCHANGE_APPROVED,
                        client_1.ReturnStatus.APPROVED,
                    ],
                    [client_1.ReturnStatus.APPROVED]: [client_1.ReturnStatus.EXCHANGE_APPROVED],
                    [client_1.ReturnStatus.EXCHANGE_APPROVED]: [],
                    [client_1.ReturnStatus.REJECTED]: [],
                    [client_1.ReturnStatus.CANCELLED]: [],
                    [client_1.ReturnStatus.REFUNDED]: [],
                    [client_1.ReturnStatus.PENDING]: [
                        client_1.ReturnStatus.UNDER_REVIEW,
                        client_1.ReturnStatus.REJECTED,
                    ],
                    [client_1.ReturnStatus.PROCESSING]: [
                        client_1.ReturnStatus.COMPLETED,
                        client_1.ReturnStatus.CANCELLED,
                    ],
                    [client_1.ReturnStatus.COMPLETED]: [],
                };
                const allowedNextStates = validTransitions[currentReturn.status] || [];
                if (!allowedNextStates.includes(status) &&
                    currentReturn.status !== status) {
                    throw new common_1.BadRequestException(`Invalid status transition from ${currentReturn.status} to ${status}. Allowed transitions: ${allowedNextStates.join(', ') || 'none'}`);
                }
                if (status === client_1.ReturnStatus.ACCEPTED ||
                    status === client_1.ReturnStatus.APPROVED) {
                    for (const item of currentReturn.items) {
                        await tx.orderItem.update({
                            where: { id: item.orderItemId },
                            data: { status: 'RETURNED' },
                        });
                        if (item.orderItem.variantId) {
                            await tx.productVariant.update({
                                where: { id: item.orderItem.variantId },
                                data: { stockQuantity: { increment: item.quantity } },
                            });
                        }
                        else {
                            await tx.product.update({
                                where: { id: item.orderItem.productId },
                                data: { stockQuantity: { increment: item.quantity } },
                            });
                        }
                    }
                }
                const statusHistory = currentReturn.statusHistory || [];
                statusHistory.push({
                    status,
                    timestamp: new Date().toISOString(),
                    note: adminNote || `Status changed to ${status}`,
                });
                const updatedReturn = await tx.return.update({
                    where: { id: returnId },
                    data: {
                        status,
                        rejectionReason: status === client_1.ReturnStatus.REJECTED ? rejectionReason : undefined,
                        statusHistory,
                    },
                    include: {
                        items: true,
                        order: true,
                        user: true,
                    },
                });
                try {
                    await this.mailService.sendReturnStatusUpdate(updatedReturn.user.email, {
                        returnId: updatedReturn.id,
                        orderNumber: updatedReturn.order.orderNumber,
                        status,
                        rejectionReason,
                        adminNote,
                    });
                }
                catch (emailError) {
                    console.error('Failed to send return status email:', emailError);
                }
                return updatedReturn;
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update return status: ' + error.message);
        }
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_upload_service_1.FileUploadService,
        wallet_service_1.WalletService,
        mail_service_1.MailService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map