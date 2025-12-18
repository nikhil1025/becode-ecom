import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    });
  }

  async sendOrderConfirmation(
    to: string,
    orderDetails: {
      orderId: string;
      totalAmount: number;
      items: Array<{ name: string; quantity: number; price: number }>;
    },
  ): Promise<void> {
    const itemsHtml = orderDetails.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Order Confirmation</h1>
            <p>Thank you for your order!</p>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            
            <h2>Order Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: left;">Quantity</th>
                  <th style="padding: 10px; text-align: left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <p style="margin-top: 20px; font-size: 18px;">
              <strong>Total: $${orderDetails.totalAmount.toFixed(2)}</strong>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              We'll send you another email when your order ships.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: `Order Confirmation - ${orderDetails.orderId}`,
      html,
    });
  }

  async sendOrderShipped(
    to: string,
    orderDetails: {
      orderId: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    },
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">Your Order Has Shipped! 📦</h1>
            <p>Great news! Your order is on its way.</p>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            ${orderDetails.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>` : ''}
            ${orderDetails.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>` : ''}
            
            <p style="margin-top: 30px; color: #666;">
              Thank you for shopping with us!
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: `Your Order ${orderDetails.orderId} Has Shipped`,
      html,
    });
  }

  async sendOrderDelivered(
    to: string,
    orderDetails: {
      orderId: string;
    },
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Delivered</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Order Delivered Successfully! ✓</h1>
            <p>Your order has been delivered.</p>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            
            <p style="margin-top: 20px;">
              We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Thank you for shopping with us!
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: `Your Order ${orderDetails.orderId} Has Been Delivered`,
      html,
    });
  }

  async sendContactFormResponse(
    to: string,
    details: {
      name: string;
      message: string;
    },
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Form Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Thank You for Contacting Us</h1>
            <p>Hi ${details.name},</p>
            <p>We've received your message and will get back to you as soon as possible.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p><strong>Your Message:</strong></p>
              <p>${details.message}</p>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br>
              The Support Team
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: 'We Received Your Message',
      html,
    });
  }

  async sendContactNotificationToAdmin(details: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2196F3;">New Contact Form Submission</h1>
            <p><strong>From:</strong> ${details.name} (${details.email})</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
              <p><strong>Message:</strong></p>
              <p>${details.message}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
      subject: `New Contact Form: ${details.name}`,
      html,
    });
  }
}
