export declare class MailService {
    private transporter;
    constructor();
    sendOrderConfirmation(to: string, orderDetails: {
        orderId: string;
        totalAmount: number;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    }): Promise<void>;
    sendOrderShipped(to: string, orderDetails: {
        orderId: string;
        trackingNumber?: string;
        estimatedDelivery?: string;
    }): Promise<void>;
    sendOrderDelivered(to: string, orderDetails: {
        orderId: string;
    }): Promise<void>;
    sendContactFormResponse(to: string, details: {
        name: string;
        message: string;
    }): Promise<void>;
    sendContactNotificationToAdmin(details: {
        name: string;
        email: string;
        message: string;
    }): Promise<void>;
    sendReturnStatusUpdate(to: string, details: {
        returnId: string;
        orderNumber: string;
        status: string;
        rejectionReason?: string;
        adminNote?: string;
    }): Promise<void>;
    sendRefundConfirmation(to: string, details: {
        returnId: string;
        orderNumber: string;
        amount: number;
        method: string;
        transactionId: string;
    }): Promise<void>;
    sendOrderCancellation(to: string, details: {
        orderNumber: string;
        cancelledItems: Array<{
            name: string;
            quantity: number;
            refundAmount: number;
        }>;
        totalRefund: number;
    }): Promise<void>;
}
