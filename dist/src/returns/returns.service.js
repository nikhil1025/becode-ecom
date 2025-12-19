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
const prisma_service_1 = require("../prisma.service");
let ReturnsService = class ReturnsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, orderId, type, reason, items, comments) {
        try {
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, userId },
                include: { items: true },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            return await this.prisma.return.create({
                data: {
                    userId,
                    orderId,
                    type,
                    reason,
                    comments,
                    items: {
                        create: items.map((item) => ({
                            orderItemId: item.orderItemId,
                            quantity: item.quantity,
                            exchangeProduct: item.exchangeProductId,
                        })),
                    },
                },
                include: {
                    items: true,
                    order: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create return: ' + error.message);
        }
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
    async findAll() {
        try {
            return await this.prisma.return.findMany({
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
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve returns: ' + error.message);
        }
    }
    async updateStatus(returnId, status) {
        try {
            return await this.prisma.return.update({
                where: { id: returnId },
                data: { status },
                include: {
                    items: true,
                    order: true,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update return status: ' + error.message);
        }
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map