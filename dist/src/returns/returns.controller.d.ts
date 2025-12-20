import { $Enums, ReturnStatus } from '@prisma/client';
import { CreateReturnDto } from './dto';
import { ReturnsService } from './returns.service';
export declare class UserReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    requestReturn(req: {
        user: {
            userId: string;
        };
    }, createReturnDto: CreateReturnDto, files: Express.Multer.File[]): Promise<({
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
            orderItemId: string;
            exchangeVariantId: string | null;
            exchangeProductId: string | null;
            returnId: string;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
    findByUser(req: {
        user: {
            userId: string;
        };
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
                status: $Enums.OrderItemStatus;
                productId: string;
                variantId: string | null;
                quantity: number;
                price: number;
                orderId: string;
                productSnapshot: import("@prisma/client/runtime/client").JsonValue;
                cancellationReason: string | null;
                cancelledAt: Date | null;
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
            orderItemId: string;
            exchangeVariantId: string | null;
            exchangeProductId: string | null;
            returnId: string;
        })[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
}
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    findAll(): Promise<{
        returns: ({
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
                    status: $Enums.OrderItemStatus;
                    productId: string;
                    variantId: string | null;
                    quantity: number;
                    price: number;
                    orderId: string;
                    productSnapshot: import("@prisma/client/runtime/client").JsonValue;
                    cancellationReason: string | null;
                    cancelledAt: Date | null;
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
                orderItemId: string;
                exchangeVariantId: string | null;
                exchangeProductId: string | null;
                returnId: string;
            })[];
        } & {
            comments: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            type: $Enums.ReturnType;
            status: $Enums.ReturnStatus;
            images: import("@prisma/client/runtime/client").JsonValue | null;
            orderId: string;
            reason: string;
            rejectionReason: string | null;
            statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
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
                status: $Enums.OrderItemStatus;
                productId: string;
                variantId: string | null;
                quantity: number;
                price: number;
                orderId: string;
                productSnapshot: import("@prisma/client/runtime/client").JsonValue;
                cancellationReason: string | null;
                cancelledAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            orderItemId: string;
            exchangeVariantId: string | null;
            exchangeProductId: string | null;
            returnId: string;
        })[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateStatus(id: string, body: {
        status: ReturnStatus;
        rejectionReason?: string;
        adminNote?: string;
    }): Promise<{
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            googleId: string | null;
            avatar: string | null;
            role: $Enums.UserRole;
            emailVerified: boolean;
            isActive: boolean;
        };
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
            orderItemId: string;
            exchangeVariantId: string | null;
            exchangeProductId: string | null;
            returnId: string;
        }[];
    } & {
        comments: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ReturnType;
        status: $Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
