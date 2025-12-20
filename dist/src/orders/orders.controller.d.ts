import { $Enums, OrderStatus, PaymentStatus } from '@prisma/client';
import { CancelItemsDto } from './dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: {
        user: {
            userId: string;
        };
    }, body: {
        items: Array<{
            productId: string;
            quantity: number;
            price: number;
            variantId?: string;
        }>;
        shippingAddress: any;
        billingAddress?: any;
    }): Promise<any>;
    getUserOrders(req: {
        user: {
            userId: string;
        };
    }): Promise<any[]>;
    getAllOrders(page?: string, limit?: string): Promise<{
        orders: any[];
        pagination: any;
    }>;
    getCancelledOrders(page?: string, limit?: string): Promise<{
        orders: any[];
        pagination: any;
    }>;
    getAdminOrderById(orderId: string): Promise<any>;
    getOrderById(req: {
        user: {
            userId: string;
        };
    }, orderId: string): Promise<any>;
    cancelOrderItems(req: {
        user: {
            userId: string;
        };
    }, orderId: string, cancelItemsDto: CancelItemsDto): Promise<({
        items: {
            id: string;
            createdAt: Date;
            status: $Enums.OrderItemStatus;
            productId: string;
            variantId: string | null;
            quantity: number;
            price: number;
            orderId: string;
            productSnapshot: import("@prisma/client/runtime/client").JsonValue;
            cancellationReason: string | null;
            cancelledAt: Date | null;
        }[];
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
    }) | null>;
    updateOrderStatus(orderId: string, body: {
        status: OrderStatus;
    }): Promise<any>;
    updatePaymentStatus(req: {
        user: {
            userId: string;
        };
    }, orderId: string, body: {
        paymentStatus: PaymentStatus;
    }): Promise<any>;
    adminUpdatePaymentStatus(orderId: string, body: {
        paymentStatus: PaymentStatus;
    }): Promise<any>;
    getOrderTracking(req: {
        user: {
            userId: string;
        };
    }, orderId: string): Promise<any>;
}
