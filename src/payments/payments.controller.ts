import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RazorpayService } from './razorpay.service';

@Controller('payments')
export class PaymentsController {
  constructor(private razorpay: RazorpayService) {}

  @Post('razorpay/create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() body: { amount: number; currency?: string; receipt?: string },
  ) {
    return this.razorpay.createOrder(body.amount, body.currency, body.receipt);
  }

  @Post('razorpay/verify')
  @UseGuards(JwtAuthGuard)
  verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const isValid = this.razorpay.verifyPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );

    return { success: isValid };
  }

  @Post('razorpay/capture')
  @UseGuards(JwtAuthGuard)
  async capturePayment(@Body() body: { paymentId: string; amount: number }) {
    return this.razorpay.capturePayment(body.paymentId, body.amount);
  }

  @Post('razorpay/refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(@Body() body: { paymentId: string; amount?: number }) {
    return this.razorpay.refundPayment(body.paymentId, body.amount);
  }
}
