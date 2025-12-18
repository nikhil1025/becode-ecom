export declare class RazorpayService {
    private razorpay;
    constructor();
    createOrder(amount: number, currency?: string, receipt?: string): Promise<any>;
    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean;
    capturePayment(paymentId: string, amount: number): Promise<any>;
    refundPayment(paymentId: string, amount?: number): Promise<any>;
}
