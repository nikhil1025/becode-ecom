import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(
    amount: number,
    currency = 'INR',
    receipt?: string,
  ): Promise<any> {
    try {
      if (!amount || amount <= 0) {
        throw new BadRequestException('Valid amount is required');
      }

      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create Razorpay order: ' + error.message,
      );
    }
  }

  verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    try {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(text)
        .digest('hex');

      return signature === razorpaySignature;
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify payment');
    }
  }

  async capturePayment(paymentId: string, amount: number): Promise<any> {
    try {
      return await this.razorpay.payments.capture(
        paymentId,
        amount * 100,
        'INR',
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to capture payment');
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const options: any = {
        amount: amount ? amount * 100 : undefined,
      };
      return await this.razorpay.payments.refund(paymentId, options);
    } catch (error) {
      throw new InternalServerErrorException('Failed to process refund');
    }
  }
}
