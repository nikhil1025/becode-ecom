import { OrderStatus, PaymentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
export declare class OrdersService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    createOrder(userId: string, data: {
        items: Array<{
            productId: string;
            quantity: number;
            price: number;
            variantId?: string;
        }>;
        shippingAddress: any;
        billingAddress?: any;
    }): Promise<{
        items: ({
            product: {
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    isFeatured: boolean;
                    productId: string;
                    position: number;
                    altText: string | null;
                }[];
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                isFeatured: boolean;
                sku: string;
                shortDescription: string | null;
                longDescription: string | null;
                categoryId: string;
                brandId: string | null;
                regularPrice: number;
                salePrice: number | null;
                costPrice: number | null;
                stockQuantity: number;
                lowStockThreshold: number;
                weight: number | null;
                dimensions: import("@prisma/client/runtime/client").JsonValue | null;
                status: import("@prisma/client").$Enums.ProductStatus;
                allowReviews: boolean;
                averageRating: number;
                reviewCount: number;
                metaTitle: string | null;
                metaDescription: string | null;
            };
            variant: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sku: string;
                stockQuantity: number;
                productId: string;
                price: number;
                attributes: import("@prisma/client/runtime/client").JsonValue;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            variantId: string | null;
            quantity: number;
            price: number;
            orderId: string;
            productSnapshot: import("@prisma/client/runtime/client").JsonValue;
        })[];
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
    getUserOrders(userId: string): Promise<any[]>;
    getOrderById(userId: string, orderId: string): Promise<any>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<any>;
    updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<any>;
    cancelOrder(userId: string, orderId: string): Promise<any>;
    getAllOrders(page?: number, limit?: number): Promise<{
        orders: any[];
        pagination: any;
    }>;
    getOrderTracking(userId: string, orderId: string): Promise<any>;
    requestReturn(userId: string, orderId: string, reason: string, items?: string[]): Promise<any>;
    getAllReturns(page?: number, limit?: number): Promise<{
        returns: any[];
        pagination: any;
    }>;
    updateReturnStatus(returnId: string, status: string): Promise<any>;
}
