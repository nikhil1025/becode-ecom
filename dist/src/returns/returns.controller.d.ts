import { $Enums, ReturnStatus, ReturnType, User } from '@prisma/client';
import { ReturnsService } from './returns.service';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    create(req: {
        user: User;
    }, body: {
        orderId: string;
        type: ReturnType;
        reason: string;
        items: Array<{
            orderItemId: string;
            quantity: number;
            exchangeProductId?: string;
        }>;
        comments?: string;
    }): Promise<{
        order: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            orderItemId: string;
            exchangeProduct: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
    findByUser(req: {
        user: User;
    }): Promise<({
        order: {
            createdAt: Date;
            orderNumber: string;
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            orderItemId: string;
            exchangeProduct: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    })[]>;
    findAll(): Promise<({
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        order: {
            createdAt: Date;
            orderNumber: string;
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            orderItemId: string;
            exchangeProduct: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    })[]>;
    updateStatus(id: string, body: {
        status: ReturnStatus;
    }): Promise<{
        order: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            orderItemId: string;
            exchangeProduct: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
}
