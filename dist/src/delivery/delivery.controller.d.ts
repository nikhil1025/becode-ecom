import { $Enums, TrackingStatus } from '@prisma/client';
import { DeliveryService } from './delivery.service';
export declare class DeliveryController {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    createAgent(body: {
        name: string;
        phone: string;
        vehicleInfo?: string;
    }): Promise<{
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
    updateAgent(id: string, body: {
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
    assignAgent(orderId: string, body: {
        agentId: string;
    }): Promise<{
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
        status: $Enums.OrderStatus;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        orderNumber: string;
        paymentStatus: $Enums.PaymentStatus;
        discount: number;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        billingAddress: import("@prisma/client/runtime/client").JsonValue;
        paymentMethod: string | null;
        notes: string | null;
        trackingStatus: $Enums.TrackingStatus;
        deliveryAgentId: string | null;
    }>;
    updateTrackingStatus(orderId: string, body: {
        status: TrackingStatus;
    }): Promise<{
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
        status: $Enums.OrderStatus;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        orderNumber: string;
        paymentStatus: $Enums.PaymentStatus;
        discount: number;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        billingAddress: import("@prisma/client/runtime/client").JsonValue;
        paymentMethod: string | null;
        notes: string | null;
        trackingStatus: $Enums.TrackingStatus;
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
        status: $Enums.OrderStatus;
        orderNumber: string;
        trackingStatus: $Enums.TrackingStatus;
    }>;
}
