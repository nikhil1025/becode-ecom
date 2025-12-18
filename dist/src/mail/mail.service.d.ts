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
}
