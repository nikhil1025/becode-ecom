import { OrderStatus, PaymentStatus } from '@prisma/client';
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
    getAdminOrderById(orderId: string): Promise<any>;
    getOrderById(req: {
        user: {
            userId: string;
        };
    }, orderId: string): Promise<any>;
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
    cancelOrder(req: {
        user: {
            userId: string;
        };
    }, orderId: string): Promise<any>;
    getOrderTracking(req: {
        user: {
            userId: string;
        };
    }, orderId: string): Promise<any>;
    requestReturn(req: {
        user: {
            userId: string;
        };
    }, orderId: string, body: {
        reason: string;
        items?: string[];
    }): Promise<any>;
    getAllReturns(page?: string, limit?: string): Promise<{
        returns: any[];
        pagination: any;
    }>;
    updateReturnStatus(returnId: string, body: {
        status: string;
    }): Promise<any>;
}
