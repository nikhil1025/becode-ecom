import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrackingStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  // Delivery Agent Management
  async createAgent(name: string, phone: string, vehicleInfo?: string) {
    try {
      if (!name || !phone) {
        throw new BadRequestException('Name and phone are required');
      }

      return await this.prisma.deliveryAgent.create({
        data: { name, phone, vehicleInfo },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create delivery agent: ' + error.message,
      );
    }
  }

  async findAllAgents() {
    try {
      return await this.prisma.deliveryAgent.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve delivery agents: ' + error.message,
      );
    }
  }

  async updateAgent(
    id: string,
    data: {
      name?: string;
      phone?: string;
      vehicleInfo?: string;
      isActive?: boolean;
    },
  ) {
    try {
      return await this.prisma.deliveryAgent.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update delivery agent: ' + error.message,
      );
    }
  }

  // Order Tracking Management
  async assignAgent(orderId: string, agentId: string) {
    try {
      const agent = await this.prisma.deliveryAgent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new NotFoundException('Delivery agent not found');
      }

      return await this.prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryAgentId: agentId,
          trackingStatus: TrackingStatus.CONFIRMED,
        },
        include: {
          deliveryAgent: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to assign delivery agent: ' + error.message,
      );
    }
  }

  async updateTrackingStatus(orderId: string, status: TrackingStatus) {
    try {
      return await this.prisma.order.update({
        where: { id: orderId },
        data: { trackingStatus: status },
        include: {
          deliveryAgent: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update tracking status: ' + error.message,
      );
    }
  }

  async getOrderTracking(orderId: string) {
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
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve order tracking: ' + error.message,
      );
    }
  }
}
