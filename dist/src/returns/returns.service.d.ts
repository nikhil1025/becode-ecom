import { ReturnStatus } from '@prisma/client';
import { FileUploadService } from '../common/services/file-upload.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateReturnDto, ReturnItemDto } from './dto';
type CreateReturnRequest = Omit<CreateReturnDto, 'items'> & {
    items: ReturnItemDto[];
};
export declare class ReturnsService {
    private prisma;
    private fileUploadService;
    private walletService;
    private mailService;
    constructor(prisma: PrismaService, fileUploadService: FileUploadService, walletService: WalletService, mailService: MailService);
    requestReturn(userId: string, createReturnRequest: CreateReturnRequest, files: Express.Multer.File[]): Promise<({
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
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
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
                status: import("@prisma/client").$Enums.OrderItemStatus;
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
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    findAll(page?: number, limit?: number, status?: ReturnStatus, userId?: string): Promise<{
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
                    status: import("@prisma/client").$Enums.OrderItemStatus;
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
            type: import("@prisma/client").$Enums.ReturnType;
            status: import("@prisma/client").$Enums.ReturnStatus;
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
    findOneForAdmin(returnId: string): Promise<{
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
                status: import("@prisma/client").$Enums.OrderItemStatus;
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
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateStatus(returnId: string, status: ReturnStatus, rejectionReason?: string, adminNote?: string): Promise<{
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
            role: import("@prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            isActive: boolean;
        };
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
        type: import("@prisma/client").$Enums.ReturnType;
        status: import("@prisma/client").$Enums.ReturnStatus;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string;
        reason: string;
        rejectionReason: string | null;
        statusHistory: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
export {};
