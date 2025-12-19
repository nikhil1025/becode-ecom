import { TrackingStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
export declare class DeliveryService {
    private prisma;
    constructor(prisma: PrismaService);
    createAgent(name: string, phone: string, vehicleInfo?: string): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        vehicleInfo: string | null;
    }>;
    findAllAgents(): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        vehicleInfo: string | null;
    }[]>;
    updateAgent(id: string, data: {
        name?: string;
        phone?: string;
        vehicleInfo?: string;
        isActive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        vehicleInfo: string | null;
    }>;
    assignAgent(orderId: string, agentId: string): Promise<{
        deliveryAgent: {
            name: string;
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            vehicleInfo: string | null;
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        orderNumber: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        discount: number;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        billingAddress: import("@prisma/client/runtime/client").JsonValue;
        paymentMethod: string | null;
        notes: string | null;
        trackingStatus: import("@prisma/client").$Enums.TrackingStatus;
        deliveryAgentId: string | null;
    }>;
    updateTrackingStatus(orderId: string, status: TrackingStatus): Promise<{
        deliveryAgent: {
            name: string;
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            vehicleInfo: string | null;
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        orderNumber: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        discount: number;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        billingAddress: import("@prisma/client/runtime/client").JsonValue;
        paymentMethod: string | null;
        notes: string | null;
        trackingStatus: import("@prisma/client").$Enums.TrackingStatus;
        deliveryAgentId: string | null;
    }>;
    getOrderTracking(orderId: string): Promise<{
        deliveryAgent: {
            name: string;
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            vehicleInfo: string | null;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        trackingStatus: import("@prisma/client").$Enums.TrackingStatus;
    }>;
}
