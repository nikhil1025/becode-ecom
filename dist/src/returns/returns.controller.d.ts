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
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
    findByUser(req: {
        user: User;
    }): Promise<({
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
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        orderId: string;
        reason: string;
    }>;
}
