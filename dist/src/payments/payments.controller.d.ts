import { RazorpayService } from './razorpay.service';
export declare class PaymentsController {
    private razorpay;
    constructor(razorpay: RazorpayService);
    createOrder(body: {
        amount: number;
        currency?: string;
        receipt?: string;
    }): Promise<any>;
    verifyPayment(body: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
        success: boolean;
    }>;
    capturePayment(body: {
        paymentId: string;
        amount: number;
    }): Promise<any>;
    refundPayment(body: {
        paymentId: string;
        amount?: number;
    }): Promise<any>;
}
