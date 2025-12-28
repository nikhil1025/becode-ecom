import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrackingStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { trackingStatus: status },
        include: {
          deliveryAgent: true,
          user: {
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      // Send appropriate tracking emails based on status
      if (order.user?.email) {
        switch (status) {
          case TrackingStatus.SHIPPED:
            this.mailService
              .sendOrderShipped(order.user.email, {
                orderId: order.orderNumber,
                trackingNumber: order.id,
              })
              .catch((err) =>
                console.error('Failed to send shipped email:', err),
              );
            break;

          case TrackingStatus.OUT_FOR_DELIVERY:
            this.mailService
              .sendOutForDeliveryEmail(order.user.email, {
                firstName: order.user.firstName || 'there',
                orderNumber: order.orderNumber,
                estimatedTime: 'by end of day',
                deliveryAgent: order.deliveryAgent
                  ? {
                      name: order.deliveryAgent.name,
                      phone: order.deliveryAgent.phone || undefined,
                    }
                  : undefined,
              })
              .catch((err) =>
                console.error('Failed to send out-for-delivery email:', err),
              );
            break;

          case TrackingStatus.DELIVERED:
            this.mailService
              .sendOrderDelivered(order.user.email, {
                orderId: order.orderNumber,
              })
              .catch((err) =>
                console.error('Failed to send delivered email:', err),
              );
            break;
        }
      }

      return order;
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
