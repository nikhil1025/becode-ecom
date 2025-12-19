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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
let DeliveryService = class DeliveryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAgent(name, phone, vehicleInfo) {
        try {
            if (!name || !phone) {
                throw new common_1.BadRequestException('Name and phone are required');
            }
            return await this.prisma.deliveryAgent.create({
                data: { name, phone, vehicleInfo },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create delivery agent: ' + error.message);
        }
    }
    async findAllAgents() {
        try {
            return await this.prisma.deliveryAgent.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve delivery agents: ' + error.message);
        }
    }
    async updateAgent(id, data) {
        try {
            return await this.prisma.deliveryAgent.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update delivery agent: ' + error.message);
        }
    }
    async assignAgent(orderId, agentId) {
        try {
            const agent = await this.prisma.deliveryAgent.findUnique({
                where: { id: agentId },
            });
            if (!agent) {
                throw new common_1.NotFoundException('Delivery agent not found');
            }
            return await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    deliveryAgentId: agentId,
                    trackingStatus: client_1.TrackingStatus.CONFIRMED,
                },
                include: {
                    deliveryAgent: true,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to assign delivery agent: ' + error.message);
        }
    }
    async updateTrackingStatus(orderId, status) {
        try {
            return await this.prisma.order.update({
                where: { id: orderId },
                data: { trackingStatus: status },
                include: {
                    deliveryAgent: true,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update tracking status: ' + error.message);
        }
    }
    async getOrderTracking(orderId) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    trackingStatus: true,
                    deliveryAgent: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve order tracking: ' + error.message);
        }
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map