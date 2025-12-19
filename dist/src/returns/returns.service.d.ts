import { ReturnStatus, ReturnType } from '@prisma/client';
import { PrismaService } from '../prisma.service';
export declare class ReturnsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, orderId: string, type: ReturnType, reason: string, items: Array<{
        orderItemId: string;
        quantity: number;
        exchangeProductId?: string;
    }>, comments?: string): Promise<{
        order: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            exchangeVariantId: string | null;
            orderItemId: string;
            exchangeProductId: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
    findByUser(userId: string): Promise<({
        order: {
            id: string;
            createdAt: Date;
            orderNumber: string;
        };
        items: ({
            orderItem: {
                product: {
                    name: string;
                    id: string;
                    images: {
                        url: string;
                        id: string;
                        createdAt: Date;
                        isFeatured: boolean;
                        productId: string;
                        position: number;
                        altText: string | null;
                    }[];
                };
                variant: {
                    name: string;
                    id: string;
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
            };
            exchangeProductRef: {
                name: string;
                id: string;
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    isFeatured: boolean;
                    productId: string;
                    position: number;
                    altText: string | null;
                }[];
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            exchangeVariantId: string | null;
            orderItemId: string;
            exchangeProductId: string | null;
        })[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
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
            id: string;
            createdAt: Date;
            total: number;
            orderNumber: string;
        };
        items: ({
            orderItem: {
                product: {
                    name: string;
                    id: string;
                    images: {
                        url: string;
                        id: string;
                        createdAt: Date;
                        isFeatured: boolean;
                        productId: string;
                        position: number;
                        altText: string | null;
                    }[];
                };
                variant: {
                    name: string;
                    id: string;
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
            };
            exchangeProductRef: {
                name: string;
                id: string;
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    isFeatured: boolean;
                    productId: string;
                    position: number;
                    altText: string | null;
                }[];
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            exchangeVariantId: string | null;
            orderItemId: string;
            exchangeProductId: string | null;
        })[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        orderId: string;
        reason: string;
    })[]>;
    updateStatus(returnId: string, status: ReturnStatus): Promise<{
        order: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            returnId: string;
            exchangeVariantId: string | null;
            orderItemId: string;
            exchangeProductId: string | null;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
}
