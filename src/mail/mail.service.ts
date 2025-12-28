import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MAIL_CONFIG } from './mail.config';
import {
  alertBoxTemplate,
  buttonGroupTemplate,
  buttonTemplate,
  footerTemplate,
  headerTemplate,
  orderItemsTableTemplate,
} from './templates/components';
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  generateOrderSummary,
  generateOrderTotal,
  wrapEmailContent,
} from './templates/helpers';

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

  // ============================================
  // 1. AUTHENTICATION & ACCOUNT EMAILS
  // ============================================

  /**
   * Send welcome email to newly registered user
   */
  async sendWelcomeEmail(
    to: string,
    userDetails: {
      firstName: string;
      email: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Welcome to Theming Cart!', emoji: '🎉' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${userDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Welcome to <strong>${MAIL_CONFIG.APP_NAME}</strong>! We're excited to have you join our community of satisfied shoppers.
        </p>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your account has been successfully created and you can now start exploring our wide range of products.
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          title: 'Account Details',
          content: `<p style="margin: 5px 0;"><strong>Email:</strong> ${userDetails.email}</p>
                    <p style="margin: 5px 0;">You can now log in and start shopping!</p>`,
        })}

        ${buttonTemplate({
          text: 'Start Shopping',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products`,
          color: MAIL_CONFIG.PRIMARY_COLOR,
        })}

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Welcome to ${MAIL_CONFIG.APP_NAME}! 🎉`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send Google OAuth welcome email
   */
  async sendGoogleOAuthWelcomeEmail(
    to: string,
    userDetails: {
      firstName: string;
      email: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Welcome via Google!', emoji: '✨' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${userDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          You've successfully signed up for <strong>${MAIL_CONFIG.APP_NAME}</strong> using your Google account!
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          title: 'Quick Sign-In',
          content: `<p style="margin: 0;">You can quickly sign in anytime using your Google account - no need to remember another password!</p>`,
        })}

        ${buttonTemplate({
          text: 'Explore Products',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Welcome to ${MAIL_CONFIG.APP_NAME}!`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send password reset email with token
   */
  async sendPasswordResetEmail(
    to: string,
    resetDetails: {
      firstName: string;
      resetToken: string;
      expiresIn: string;
    },
  ): Promise<void> {
    const resetUrl = `${MAIL_CONFIG.WEBSITE_URL}/reset-password?token=${resetDetails.resetToken}`;

    const content = `
      ${headerTemplate({ title: 'Password Reset Request', emoji: '🔐' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${resetDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          title: 'Security Notice',
          content: `<p style="margin: 0;">This link will expire in <strong>${resetDetails.expiresIn}</strong>. If you didn't request this reset, please ignore this email.</p>`,
        })}

        ${buttonTemplate({
          text: 'Reset My Password',
          url: resetUrl,
          color: MAIL_CONFIG.DANGER_COLOR,
        })}

        <p style="color: #999; font-size: 13px; margin-top: 30px; word-break: break-all;">
          Or copy this link: <a href="${resetUrl}" style="color: ${MAIL_CONFIG.PRIMARY_COLOR};">${resetUrl}</a>
        </p>
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Password Reset Request',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send password change confirmation
   */
  async sendPasswordChangedEmail(
    to: string,
    userDetails: {
      firstName: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Password Changed', emoji: '✅' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${userDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your password has been successfully changed.
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 0;">Your account is now secured with your new password. You can use it to log in from now on.</p>`,
        })}

        ${alertBoxTemplate({
          type: 'warning',
          title: "Didn't make this change?",
          content: `<p style="margin: 0;">If you didn't change your password, please contact our support team immediately at <a href="mailto:${MAIL_CONFIG.SUPPORT_EMAIL}" style="color: ${MAIL_CONFIG.DANGER_COLOR};">${MAIL_CONFIG.SUPPORT_EMAIL}</a></p>`,
        })}

        ${buttonTemplate({
          text: 'Go to My Account',
          url: `${MAIL_CONFIG.WEBSITE_URL}/profile`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Password Successfully Changed',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send email change notification
   */
  async sendEmailChangedEmail(
    to: string,
    userDetails: {
      firstName: string;
      oldEmail: string;
      newEmail: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Email Address Changed', emoji: '📧' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${userDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your account email address has been successfully updated.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          content: `<p style="margin: 5px 0;"><strong>Previous Email:</strong> ${userDetails.oldEmail}</p>
                    <p style="margin: 5px 0;"><strong>New Email:</strong> ${userDetails.newEmail}</p>`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 14px; margin-top: 20px;">
          All future communications will be sent to your new email address.
        </p>
      </div>
      ${footerTemplate()}
    `;

    // Send to both old and new email
    await Promise.all([
      this.transporter.sendMail({
        from: MAIL_CONFIG.FROM_EMAIL,
        to,
        subject: 'Email Address Changed',
        html: wrapEmailContent(content),
      }),
      this.transporter.sendMail({
        from: MAIL_CONFIG.FROM_EMAIL,
        to: userDetails.newEmail,
        subject: 'Email Address Changed',
        html: wrapEmailContent(content),
      }),
    ]);
  }

  /**
   * Send account linking notification (OAuth)
   */
  async sendAccountLinkedEmail(
    to: string,
    userDetails: {
      firstName: string;
      provider: string; // 'Google', 'Facebook', etc.
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Account Linked', emoji: '🔗' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${userDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your ${userDetails.provider} account has been successfully linked to your ${MAIL_CONFIG.APP_NAME} account.
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 0;">You can now sign in using your ${userDetails.provider} account for quick and easy access!</p>`,
        })}

        ${alertBoxTemplate({
          type: 'warning',
          title: "Didn't authorize this?",
          content: `<p style="margin: 0;">If you didn't link this account, please contact support immediately.</p>`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `${userDetails.provider} Account Linked`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send security alert for suspicious activity
   */
  async sendSecurityAlertEmail(
    to: string,
    securityDetails: {
      firstName: string;
      activityType: string; // 'New device login', 'Multiple failed attempts', etc.
      timestamp: Date;
      location?: string;
      device?: string;
      ipAddress?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Security Alert', emoji: '🚨' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${securityDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We detected unusual activity on your account and wanted to let you know.
        </p>
        
        ${alertBoxTemplate({
          type: 'danger',
          title: 'Activity Detected',
          content: `<p style="margin: 5px 0;"><strong>Type:</strong> ${securityDetails.activityType}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${formatDate(securityDetails.timestamp)}</p>
                    ${securityDetails.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${securityDetails.location}</p>` : ''}
                    ${securityDetails.device ? `<p style="margin: 5px 0;"><strong>Device:</strong> ${securityDetails.device}</p>` : ''}
                    ${securityDetails.ipAddress ? `<p style="margin: 5px 0;"><strong>IP Address:</strong> ${securityDetails.ipAddress}</p>` : ''}`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.
        </p>

        ${buttonGroupTemplate([
          {
            text: 'Change Password',
            url: `${MAIL_CONFIG.WEBSITE_URL}/change-password`,
            color: MAIL_CONFIG.DANGER_COLOR,
          },
          {
            text: 'Review Account Activity',
            url: `${MAIL_CONFIG.WEBSITE_URL}/account/security`,
          },
        ])}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: '🚨 Security Alert - Unusual Activity Detected',
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 2. ORDER MANAGEMENT EMAILS
  // ============================================

  /**
   * Send order processing notification
   */
  async sendOrderProcessingEmail(to: string, orderDetails: any): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Order is Being Processed', emoji: '⚙️' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Great news!</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We're now processing your order and getting it ready for shipment.
        </p>
        
        ${generateOrderSummary(orderDetails)}
        ${orderItemsTableTemplate(orderDetails.items)}
        ${generateOrderTotal(orderDetails)}

        ${buttonTemplate({
          text: 'Track Your Order',
          url: `${MAIL_CONFIG.WEBSITE_URL}/orders/${orderDetails.id}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Order ${orderDetails.orderNumber} - Processing`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send payment status update email
   */
  async sendPaymentStatusUpdateEmail(
    to: string,
    paymentDetails: {
      firstName: string;
      orderNumber: string;
      orderId: string;
      paymentStatus: string;
      amount: number;
      paymentMethod?: string;
    },
  ): Promise<void> {
    const isSuccess = paymentDetails.paymentStatus === 'PAID';
    const content = `
      ${headerTemplate({ title: isSuccess ? 'Payment Confirmed' : 'Payment Status Update', emoji: isSuccess ? '✅' : '⚠️' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${paymentDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          ${isSuccess ? 'Your payment has been successfully processed!' : 'There was an update to your payment status.'}
        </p>
        
        ${alertBoxTemplate({
          type: isSuccess ? 'success' : 'warning',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${paymentDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${formatCurrency(paymentDetails.amount)}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${paymentDetails.paymentStatus}</p>
                    ${paymentDetails.paymentMethod ? `<p style="margin: 5px 0;"><strong>Method:</strong> ${paymentDetails.paymentMethod}</p>` : ''}`,
        })}

        ${buttonTemplate({
          text: 'View Order Details',
          url: `${MAIL_CONFIG.WEBSITE_URL}/orders/${paymentDetails.orderId}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Payment ${isSuccess ? 'Confirmed' : 'Update'} - Order ${paymentDetails.orderNumber}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send shipping delay notification
   */
  async sendShippingDelayEmail(
    to: string,
    delayDetails: {
      firstName: string;
      orderNumber: string;
      orderId: string;
      originalDate: Date;
      newDate: Date;
      reason?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Shipping Delay Notice', emoji: '⏱️' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${delayDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We wanted to keep you informed about a delay in your order shipment.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          title: 'Delivery Date Update',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${delayDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Original Date:</strong> ${formatDateShort(delayDetails.originalDate)}</p>
                    <p style="margin: 5px 0;"><strong>New Expected Date:</strong> ${formatDateShort(delayDetails.newDate)}</p>
                    ${delayDetails.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${delayDetails.reason}</p>` : ''}`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We apologize for any inconvenience this may cause. We're working hard to get your order to you as soon as possible.
        </p>

        ${buttonTemplate({
          text: 'View Order Status',
          url: `${MAIL_CONFIG.WEBSITE_URL}/orders/${delayDetails.orderId}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Shipping Delay - Order ${delayDetails.orderNumber}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send order disputed/under investigation email
   */
  async sendOrderDisputedEmail(
    to: string,
    disputeDetails: {
      firstName: string;
      orderNumber: string;
      orderId: string;
      reason: string;
      expectedResolutionDays: number;
      requiredActions?: string[];
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Order Under Review', emoji: '🔍' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${disputeDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your order is currently under review for verification purposes.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          title: 'Investigation Details',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${disputeDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Reason:</strong> ${disputeDetails.reason}</p>
                    <p style="margin: 5px 0;"><strong>Expected Resolution:</strong> ${disputeDetails.expectedResolutionDays} business days</p>`,
        })}

        ${
          disputeDetails.requiredActions?.length
            ? alertBoxTemplate({
                type: 'info',
                title: 'Actions Required',
                content: `<ul style="margin: 10px 0; padding-left: 20px;">${disputeDetails.requiredActions.map((action) => `<li>${action}</li>`).join('')}</ul>`,
              })
            : ''
        }

        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We'll notify you as soon as the review is complete. Thank you for your patience and understanding.
        </p>

        ${buttonTemplate({
          text: 'Contact Support',
          url: `${MAIL_CONFIG.WEBSITE_URL}/contact`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Order Under Review - ${disputeDetails.orderNumber}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailedEmail(
    to: string,
    paymentDetails: {
      firstName: string;
      orderNumber: string;
      orderId: string;
      amount: number;
      reason?: string;
      retryUrl?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Payment Failed', emoji: '❌' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${paymentDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We were unable to process your payment for the following order.
        </p>
        
        ${alertBoxTemplate({
          type: 'danger',
          title: 'Payment Information',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${paymentDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${formatCurrency(paymentDetails.amount)}</p>
                    ${paymentDetails.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${paymentDetails.reason}</p>` : ''}`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Please verify your payment information and try again. Your order is being held and will be cancelled if payment is not received within 24 hours.
        </p>

        ${buttonTemplate({
          text: 'Retry Payment',
          url:
            paymentDetails.retryUrl ||
            `${MAIL_CONFIG.WEBSITE_URL}/orders/${paymentDetails.orderId}/payment`,
          color: MAIL_CONFIG.DANGER_COLOR,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Payment Failed - Order ${paymentDetails.orderNumber}`,
      html: wrapEmailContent(content),
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
          <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price.toFixed(2)}</td>
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
              <strong>Total: ₹${orderDetails.totalAmount.toFixed(2)}</strong>
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

  async sendReturnStatusUpdate(
    to: string,
    details: {
      returnId: string;
      orderNumber: string;
      status: string;
      rejectionReason?: string;
      adminNote?: string;
    },
  ): Promise<void> {
    const statusColors: Record<string, string> = {
      REQUESTED: '#2196F3',
      UNDER_REVIEW: '#FF9800',
      ACCEPTED: '#4CAF50',
      REJECTED: '#f44336',
      REFUNDED: '#4CAF50',
    };

    const color = statusColors[details.status] || '#666';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Return Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: ${color};">Return Request Status Update</h1>
            <p><strong>Order Number:</strong> ${details.orderNumber}</p>
            <p><strong>Return ID:</strong> ${details.returnId}</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid ${color};">
              <p style="font-size: 18px; margin: 0;"><strong>Status: ${details.status}</strong></p>
            </div>
            
            ${details.rejectionReason ? `<p><strong>Reason:</strong> ${details.rejectionReason}</p>` : ''}
            ${details.adminNote ? `<p><strong>Note:</strong> ${details.adminNote}</p>` : ''}
            
            <p style="margin-top: 30px; color: #666;">
              ${details.status === 'ACCEPTED' ? 'Your refund will be processed shortly.' : ''}
              ${details.status === 'REJECTED' ? 'If you have questions, please contact our support team.' : ''}
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: `Return Request ${details.status} - Order ${details.orderNumber}`,
      html,
    });
  }

  async sendRefundConfirmation(
    to: string,
    details: {
      returnId: string;
      orderNumber: string;
      amount: number;
      method: string;
      transactionId: string;
    },
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Refund Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">Refund Processed Successfully ✓</h1>
            <p>Your refund has been processed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
              <p><strong>Order Number:</strong> ${details.orderNumber}</p>
              <p><strong>Return ID:</strong> ${details.returnId}</p>
              <p><strong>Refund Amount:</strong> ₹${details.amount.toFixed(2)}</p>
              <p><strong>Method:</strong> ${details.method}</p>
              <p><strong>Transaction ID:</strong> ${details.transactionId}</p>
            </div>
            
            <p style="margin-top: 20px;">
              ${details.method === 'WALLET' ? 'The amount has been credited to your wallet and is available for use immediately.' : ''}
              ${details.method === 'BANK' || details.method === 'ORIGINAL' ? 'The refund will appear in your account within 5-7 business days.' : ''}
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
      subject: `Refund Processed - Order ${details.orderNumber}`,
      html,
    });
  }

  async sendOrderCancellation(
    to: string,
    details: {
      orderNumber: string;
      cancelledItems: Array<{
        name: string;
        quantity: number;
        refundAmount: number;
      }>;
      totalRefund: number;
    },
  ): Promise<void> {
    const itemsHtml = details.cancelledItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.refundAmount.toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Cancellation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF9800;">Order Cancellation Confirmed</h1>
            <p><strong>Order Number:</strong> ${details.orderNumber}</p>
            
            <h2>Cancelled Items:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: left;">Quantity</th>
                  <th style="padding: 10px; text-align: left;">Refund</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <p style="margin-top: 20px; font-size: 18px;">
              <strong>Total Refund: ₹${details.totalRefund.toFixed(2)}</strong>
            </p>
            
            <p style="margin-top: 20px;">
              The refund amount has been credited to your wallet and is available for immediate use.
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to,
      subject: `Order Cancellation Confirmed - ${details.orderNumber}`,
      html,
    });
  }

  // ============================================
  // 3. TRACKING & DELIVERY EMAILS
  // ============================================

  /**
   * Send tracking status update - In Transit
   */
  async sendOrderInTransitEmail(
    to: string,
    trackingDetails: {
      firstName: string;
      orderNumber: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: Date;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Order In Transit', emoji: '🚚' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${trackingDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Great news! Your order is now in transit and on its way to you.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${trackingDetails.orderNumber}</p>
                    ${trackingDetails.trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingDetails.trackingNumber}</p>` : ''}
                    ${trackingDetails.carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${trackingDetails.carrier}</p>` : ''}
                    ${trackingDetails.estimatedDelivery ? `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${formatDateShort(trackingDetails.estimatedDelivery)}</p>` : ''}`,
        })}

        ${buttonTemplate({
          text: 'Track Shipment',
          url: `${MAIL_CONFIG.WEBSITE_URL}/tracking?number=${trackingDetails.trackingNumber}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Order ${trackingDetails.orderNumber} is In Transit 🚚`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send out for delivery notification
   */
  async sendOutForDeliveryEmail(
    to: string,
    deliveryDetails: {
      firstName: string;
      orderNumber: string;
      estimatedTime?: string;
      deliveryAgent?: {
        name: string;
        phone?: string;
      };
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Out for Delivery Today!', emoji: '📦' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${deliveryDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your order is out for delivery and will arrive <strong>today</strong>!
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${deliveryDetails.orderNumber}</p>
                    ${deliveryDetails.estimatedTime ? `<p style="margin: 5px 0;"><strong>Estimated Time:</strong> ${deliveryDetails.estimatedTime}</p>` : ''}
                    ${deliveryDetails.deliveryAgent?.name ? `<p style="margin: 5px 0;"><strong>Delivery Agent:</strong> ${deliveryDetails.deliveryAgent.name}</p>` : ''}
                    ${deliveryDetails.deliveryAgent?.phone ? `<p style="margin: 5px 0;"><strong>Contact:</strong> ${deliveryDetails.deliveryAgent.phone}</p>` : ''}`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 14px;">
          Please ensure someone is available to receive the package.
        </p>
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Your Order is Out for Delivery Today! 📦`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send failed delivery attempt notification
   */
  async sendFailedDeliveryEmail(
    to: string,
    deliveryDetails: {
      firstName: string;
      orderNumber: string;
      attemptDate: Date;
      reason: string;
      nextAttemptDate?: Date;
      contactNumber?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Delivery Attempt Failed', emoji: '⚠️' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${deliveryDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We attempted to deliver your order but were unable to complete the delivery.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          title: 'Delivery Information',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${deliveryDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Attempt Date:</strong> ${formatDate(deliveryDetails.attemptDate)}</p>
                    <p style="margin: 5px 0;"><strong>Reason:</strong> ${deliveryDetails.reason}</p>
                    ${deliveryDetails.nextAttemptDate ? `<p style="margin: 5px 0;"><strong>Next Attempt:</strong> ${formatDateShort(deliveryDetails.nextAttemptDate)}</p>` : ''}`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          ${deliveryDetails.contactNumber ? `Please contact us at ${deliveryDetails.contactNumber} to reschedule delivery.` : 'Please ensure someone is available for the next delivery attempt.'}
        </p>

        ${buttonTemplate({
          text: 'Update Delivery Preferences',
          url: `${MAIL_CONFIG.WEBSITE_URL}/orders/${deliveryDetails.orderNumber}/delivery`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Delivery Attempt Failed - Order ${deliveryDetails.orderNumber}`,
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 4. REVIEWS & COMMUNITY EMAILS
  // ============================================

  /**
   * Send review submission confirmation
   */
  async sendReviewSubmittedEmail(
    to: string,
    reviewDetails: {
      firstName: string;
      productName: string;
      rating: number;
      reviewText: string;
    },
  ): Promise<void> {
    const stars = '⭐'.repeat(reviewDetails.rating);
    const content = `
      ${headerTemplate({ title: 'Review Submitted', emoji: '✍️' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${reviewDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Thank you for taking the time to review <strong>${reviewDetails.productName}</strong>!
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 5px 0; font-size: 20px;">${stars}</p>
                    <p style="margin: 10px 0; color: #555;">"${reviewDetails.reviewText.substring(0, 150)}${reviewDetails.reviewText.length > 150 ? '...' : ''}"</p>
                    <p style="margin: 5px 0; font-size: 13px; color: #999;">Your review is under moderation and will be published soon.</p>`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Thank You for Your Review!',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send review status notification (approved/rejected)
   */
  async sendReviewStatusEmail(
    to: string,
    reviewDetails: {
      firstName: string;
      productName: string;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
      reviewUrl?: string;
    },
  ): Promise<void> {
    const isApproved = reviewDetails.status === 'APPROVED';
    const content = `
      ${headerTemplate({ title: isApproved ? 'Review Published!' : 'Review Update', emoji: isApproved ? '✅' : '❌' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${reviewDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          ${isApproved ? `Your review for <strong>${reviewDetails.productName}</strong> has been approved and is now live!` : `We're unable to publish your review for <strong>${reviewDetails.productName}</strong>.`}
        </p>
        
        ${alertBoxTemplate({
          type: isApproved ? 'success' : 'warning',
          content: isApproved
            ? '<p style="margin: 0;">Thank you for helping other customers make informed decisions!</p>'
            : `<p style="margin: 0;">${reviewDetails.reason || 'The review did not meet our community guidelines.'}</p>`,
        })}

        ${
          isApproved
            ? buttonTemplate({
                text: 'View Your Review',
                url:
                  reviewDetails.reviewUrl ||
                  `${MAIL_CONFIG.WEBSITE_URL}/products/${reviewDetails.productName}`,
              })
            : ''
        }
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: isApproved ? 'Your Review is Live!' : 'Review Update',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send community membership confirmation
   */
  async sendCommunityJoinedEmail(
    to: string,
    memberDetails: {
      firstName: string;
      communityName: string;
      benefits?: string[];
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Welcome to the Community!', emoji: '🎉' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${memberDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Welcome to <strong>${memberDetails.communityName}</strong>! We're excited to have you as part of our community.
        </p>
        
        ${
          memberDetails.benefits?.length
            ? alertBoxTemplate({
                type: 'success',
                title: 'Member Benefits',
                content: `<ul style="margin: 10px 0; padding-left: 20px;">${memberDetails.benefits.map((benefit) => `<li style="margin: 5px 0;">${benefit}</li>`).join('')}</ul>`,
              })
            : ''
        }

        ${buttonTemplate({
          text: 'Explore Community',
          url: `${MAIL_CONFIG.WEBSITE_URL}/community`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Welcome to ${memberDetails.communityName}!`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send community membership status update
   */
  async sendCommunityStatusEmail(
    to: string,
    statusDetails: {
      firstName: string;
      communityName: string;
      status: 'APPROVED' | 'REJECTED' | 'REMOVED';
      reason?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Community Membership Update', emoji: '📢' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${statusDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          There's an update regarding your membership in <strong>${statusDetails.communityName}</strong>.
        </p>
        
        ${alertBoxTemplate({
          type: statusDetails.status === 'APPROVED' ? 'success' : 'warning',
          title: `Status: ${statusDetails.status}`,
          content: statusDetails.reason
            ? `<p style="margin: 0;">${statusDetails.reason}</p>`
            : '',
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `${statusDetails.communityName} - Membership Update`,
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 5. WALLET & NEWSLETTER EMAILS
  // ============================================

  /**
   * Send wallet credit notification
   */
  async sendWalletCreditEmail(
    to: string,
    walletDetails: {
      firstName: string;
      amount: number;
      reason: string;
      newBalance: number;
      transactionId: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Wallet Credit Added', emoji: '💰' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${walletDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your wallet has been credited successfully!
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 5px 0;"><strong>Amount Added:</strong> ${formatCurrency(walletDetails.amount)}</p>
                    <p style="margin: 5px 0;"><strong>Reason:</strong> ${walletDetails.reason}</p>
                    <p style="margin: 5px 0;"><strong>New Balance:</strong> ${formatCurrency(walletDetails.newBalance)}</p>
                    <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${walletDetails.transactionId}</p>`,
        })}

        ${buttonTemplate({
          text: 'View Wallet',
          url: `${MAIL_CONFIG.WEBSITE_URL}/wallet`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Wallet Credit Added!',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send wallet debit notification
   */
  async sendWalletDebitEmail(
    to: string,
    walletDetails: {
      firstName: string;
      amount: number;
      reason: string;
      newBalance: number;
      transactionId: string;
      orderNumber?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Wallet Payment', emoji: '💸' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${walletDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          A payment has been deducted from your wallet.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          content: `<p style="margin: 5px 0;"><strong>Amount Deducted:</strong> ${formatCurrency(walletDetails.amount)}</p>
                    <p style="margin: 5px 0;"><strong>Purpose:</strong> ${walletDetails.reason}</p>
                    ${walletDetails.orderNumber ? `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${walletDetails.orderNumber}</p>` : ''}
                    <p style="margin: 5px 0;"><strong>Remaining Balance:</strong> ${formatCurrency(walletDetails.newBalance)}</p>
                    <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${walletDetails.transactionId}</p>`,
        })}

        ${buttonTemplate({
          text: 'View Transaction History',
          url: `${MAIL_CONFIG.WEBSITE_URL}/wallet/transactions`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Wallet Payment Completed',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send newsletter subscription confirmation
   */
  async sendNewsletterWelcomeEmail(
    to: string,
    firstName?: string,
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Newsletter Subscription Confirmed!', emoji: '📰' })}
      <div style="padding: 40px;">
        ${firstName ? `<h2 style="color: #333; margin: 0 0 20px;">Hi ${firstName},</h2>` : ''}
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Thank you for subscribing to our newsletter! You'll now receive updates about new products, exclusive offers, and more.
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          content:
            '<p style="margin: 0;">You can unsubscribe anytime by clicking the link at the bottom of our emails.</p>',
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Welcome to Our Newsletter! 📰',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send newsletter unsubscribe confirmation
   */
  async sendNewsletterUnsubscribeEmail(
    to: string,
    firstName?: string,
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Unsubscribed from Newsletter', emoji: '👋' })}
      <div style="padding: 40px;">
        ${firstName ? `<h2 style="color: #333; margin: 0 0 20px;">Hi ${firstName},</h2>` : ''}
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          You've been successfully unsubscribed from our newsletter. We're sorry to see you go!
        </p>
        
        <p style="color: #666; line-height: 1.8; font-size: 14px;">
          You can resubscribe anytime from your account settings.
        </p>

        ${buttonTemplate({
          text: 'Resubscribe',
          url: `${MAIL_CONFIG.WEBSITE_URL}/newsletter/subscribe`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Newsletter Unsubscribe Confirmation',
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 6. CUSTOMER ENGAGEMENT & RETENTION EMAILS
  // ============================================

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCartEmail(
    to: string,
    cartDetails: {
      firstName: string;
      items: any[];
      total: number;
      discountCode?: string;
      expiresIn?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'You Left Items in Your Cart', emoji: '🛒' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${cartDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Looks like you forgot something! We've saved your cart for you.
        </p>
        
        ${orderItemsTableTemplate(cartDetails.items)}

        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 24px; color: ${MAIL_CONFIG.PRIMARY_COLOR}; margin: 10px 0;"><strong>${formatCurrency(cartDetails.total)}</strong></p>
        </div>

        ${
          cartDetails.discountCode
            ? alertBoxTemplate({
                type: 'success',
                title: 'Special Offer!',
                content: `<p style="margin: 0;">Use code <strong>${cartDetails.discountCode}</strong> for an exclusive discount! ${cartDetails.expiresIn ? `Valid for ${cartDetails.expiresIn}.` : ''}</p>`,
              })
            : ''
        }

        ${buttonTemplate({
          text: 'Complete Your Purchase',
          url: `${MAIL_CONFIG.WEBSITE_URL}/cart`,
          color: MAIL_CONFIG.PRIMARY_COLOR,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Your Cart is Waiting! 🛒',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send order anniversary/milestone email
   */
  async sendOrderAnniversaryEmail(
    to: string,
    milestoneDetails: {
      firstName: string;
      milestoneType: string;
      totalOrders?: number;
      totalSpent?: number;
      discountCode: string;
      discountValue: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Celebration Time!', emoji: '🎂' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${milestoneDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Congratulations on your <strong>${milestoneDetails.milestoneType}</strong> with ${MAIL_CONFIG.APP_NAME}!
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          title: 'Your Journey with Us',
          content: `${milestoneDetails.totalOrders ? `<p style="margin: 5px 0;"><strong>Total Orders:</strong> ${milestoneDetails.totalOrders}</p>` : ''}
                    ${milestoneDetails.totalSpent ? `<p style="margin: 5px 0;"><strong>Total Spent:</strong> ${formatCurrency(milestoneDetails.totalSpent)}</p>` : ''}
                    <p style="margin: 10px 0 5px; color: #333;">Thank you for being a valued customer!</p>`,
        })}

        ${alertBoxTemplate({
          type: 'info',
          title: 'Special Gift for You! 🎁',
          content: `<p style="margin: 5px 0;">Use code <strong style="font-size: 20px; color: ${MAIL_CONFIG.PRIMARY_COLOR};">${milestoneDetails.discountCode}</strong></p>
                    <p style="margin: 5px 0;">Get <strong>${milestoneDetails.discountValue}</strong> off your next order!</p>`,
        })}

        ${buttonTemplate({
          text: 'Shop Now',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Celebrating Your ${milestoneDetails.milestoneType}! 🎉`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send birthday greeting email
   */
  async sendBirthdayEmail(
    to: string,
    birthdayDetails: {
      firstName: string;
      discountCode: string;
      discountValue: string;
      validUntil: Date;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Happy Birthday!', emoji: '🎂' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Happy Birthday, ${birthdayDetails.firstName}! 🎉</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Wishing you a fantastic day filled with joy and celebration!
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          title: 'Birthday Gift from Us! 🎁',
          content: `<p style="margin: 5px 0;">We have a special birthday gift for you!</p>
                    <p style="margin: 10px 0; font-size: 24px;"><strong style="color: ${MAIL_CONFIG.PRIMARY_COLOR};">${birthdayDetails.discountCode}</strong></p>
                    <p style="margin: 5px 0;">Get <strong>${birthdayDetails.discountValue}</strong> off your next order!</p>
                    <p style="margin: 5px 0; font-size: 13px; color: #999;">Valid until ${formatDateShort(birthdayDetails.validUntil)}</p>`,
        })}

        ${buttonTemplate({
          text: 'Treat Yourself',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products`,
          color: MAIL_CONFIG.ACCENT_COLOR,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: '🎂 Happy Birthday from Theming Cart!',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send inactive account reminder
   */
  async sendInactiveAccountEmail(
    to: string,
    inactiveDetails: {
      firstName: string;
      lastLoginDate: Date;
      daysSinceLogin: number;
      comebackOffer?: {
        code: string;
        value: string;
      };
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'We Miss You!', emoji: '👋' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${inactiveDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          It's been a while since we've seen you! We've missed having you around.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          content: `<p style="margin: 0;">Your last visit was <strong>${formatDateShort(inactiveDetails.lastLoginDate)}</strong> (${inactiveDetails.daysSinceLogin} days ago)</p>`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px; margin-top: 20px;">
          Check out what's new since your last visit:
        </p>
        <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
          <li>New product arrivals</li>
          <li>Exclusive deals and offers</li>
          <li>Enhanced shopping experience</li>
        </ul>

        ${
          inactiveDetails.comebackOffer
            ? alertBoxTemplate({
                type: 'success',
                title: 'Welcome Back Offer! 🎁',
                content: `<p style="margin: 5px 0;">Use code <strong>${inactiveDetails.comebackOffer.code}</strong> for <strong>${inactiveDetails.comebackOffer.value}</strong> off!</p>`,
              })
            : ''
        }

        ${buttonTemplate({
          text: 'Come Back and Shop',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `We Miss You, ${inactiveDetails.firstName}! 👋`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send order follow-up survey email
   */
  async sendOrderSurveyEmail(
    to: string,
    surveyDetails: {
      firstName: string;
      orderNumber: string;
      orderId: string;
      deliveryDate: Date;
      surveyUrl: string;
      incentive?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'How Was Your Experience?', emoji: '💬' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${surveyDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We hope you're enjoying your recent purchase (Order ${surveyDetails.orderNumber})!
        </p>
        
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your feedback helps us improve our service. Would you mind taking 2 minutes to share your experience?
        </p>

        ${
          surveyDetails.incentive
            ? alertBoxTemplate({
                type: 'success',
                content: `<p style="margin: 0;"><strong>Complete the survey and get ${surveyDetails.incentive}!</strong></p>`,
              })
            : ''
        }

        ${buttonTemplate({
          text: 'Take Survey',
          url: surveyDetails.surveyUrl,
        })}

        <p style="color: #999; font-size: 13px; text-align: center; margin-top: 20px;">
          This survey takes approximately 2 minutes to complete
        </p>
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Share Your Feedback & Get Rewarded! 💬',
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 7. ADVANCED FEATURES & ALERTS
  // ============================================

  /**
   * Send stock alert for previously unavailable item
   */
  async sendStockAlertEmail(
    to: string,
    stockDetails: {
      firstName: string;
      productName: string;
      productId: string;
      productImage?: string;
      price: number;
      previousAttemptDate?: Date;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Back in Stock!', emoji: '🎉' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${stockDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Great news! The item you were looking for is back in stock!
        </p>
        
        ${
          stockDetails.productImage
            ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${stockDetails.productImage}" alt="${stockDetails.productName}" style="max-width: 300px; height: auto; border-radius: 8px;">
        </div>
        `
            : ''
        }

        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 5px 0;"><strong>${stockDetails.productName}</strong></p>
                    <p style="margin: 5px 0; font-size: 20px; color: ${MAIL_CONFIG.PRIMARY_COLOR};"><strong>${formatCurrency(stockDetails.price)}</strong></p>
                    ${stockDetails.previousAttemptDate ? `<p style="margin: 5px 0; font-size: 13px; color: #999;">You tried to purchase this on ${formatDateShort(stockDetails.previousAttemptDate)}</p>` : ''}`,
        })}

        ${alertBoxTemplate({
          type: 'warning',
          content:
            '<p style="margin: 0;"><strong>Limited stock available!</strong> Order soon to avoid missing out again.</p>',
        })}

        ${buttonTemplate({
          text: 'Buy Now',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products/${stockDetails.productId}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `${stockDetails.productName} is Back in Stock! 🎉`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send bulk order discount offer
   */
  async sendBulkDiscountOfferEmail(
    to: string,
    offerDetails: {
      firstName: string;
      currentCartValue: number;
      bulkThreshold: number;
      potentialSavings: number;
      discountPercentage: number;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Bulk Order Discount Available!', emoji: '💰' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${offerDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          We noticed you're purchasing multiple items. Great choice! You may qualify for our bulk order discount.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          content: `<p style="margin: 5px 0;"><strong>Current Cart Value:</strong> ${formatCurrency(offerDetails.currentCartValue)}</p>
                    <p style="margin: 5px 0;"><strong>Bulk Order Threshold:</strong> ${formatCurrency(offerDetails.bulkThreshold)}</p>`,
        })}

        ${alertBoxTemplate({
          type: 'success',
          title: 'Special Offer!',
          content: `<p style="margin: 5px 0;">Order ${formatCurrency(offerDetails.bulkThreshold)} or more and save <strong>${offerDetails.discountPercentage}%</strong>!</p>
                    <p style="margin: 5px 0; font-size: 20px; color: ${MAIL_CONFIG.PRIMARY_COLOR};"><strong>Potential Savings: ${formatCurrency(offerDetails.potentialSavings)}</strong></p>`,
        })}

        ${buttonTemplate({
          text: 'Complete Your Order',
          url: `${MAIL_CONFIG.WEBSITE_URL}/cart`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Save Big with Bulk Order Discount! 💰',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send product recall notice (CRITICAL)
   */
  async sendProductRecallEmail(
    to: string,
    recallDetails: {
      firstName: string;
      productName: string;
      orderNumber: string;
      purchaseDate: Date;
      reason: string;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      safetyInstructions: string[];
      returnInstructions: string;
      compensationOffer?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'IMPORTANT: Product Recall Notice', emoji: '🚨' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${recallDetails.firstName},</h2>
        
        ${alertBoxTemplate({
          type: 'danger',
          title: `${recallDetails.riskLevel} PRIORITY RECALL`,
          content: `<p style="margin: 5px 0;"><strong>Product:</strong> ${recallDetails.productName}</p>
                    <p style="margin: 5px 0;"><strong>Order Number:</strong> ${recallDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Purchase Date:</strong> ${formatDateShort(recallDetails.purchaseDate)}</p>
                    <p style="margin: 10px 0;"><strong>Reason for Recall:</strong></p>
                    <p style="margin: 0;">${recallDetails.reason}</p>`,
        })}

        ${alertBoxTemplate({
          type: 'warning',
          title: 'Immediate Action Required',
          content: `<ul style="margin: 10px 0; padding-left: 20px;">${recallDetails.safetyInstructions.map((instruction) => `<li style="margin: 5px 0;">${instruction}</li>`).join('')}</ul>`,
        })}

        <h3 style="color: #333; margin: 30px 0 15px;">Return Instructions:</h3>
        <p style="color: #666; line-height: 1.8;">${recallDetails.returnInstructions}</p>

        ${
          recallDetails.compensationOffer
            ? alertBoxTemplate({
                type: 'info',
                content: `<p style="margin: 0;"><strong>Compensation:</strong> ${recallDetails.compensationOffer}</p>`,
              })
            : ''
        }

        ${buttonTemplate({
          text: 'Initiate Return',
          url: `${MAIL_CONFIG.WEBSITE_URL}/orders/${recallDetails.orderNumber}/recall-return`,
          color: MAIL_CONFIG.DANGER_COLOR,
        })}

        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          If you have any questions or concerns, please contact our support team immediately at ${MAIL_CONFIG.SUPPORT_EMAIL} or ${MAIL_CONFIG.SUPPORT_PHONE}
        </p>
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `🚨 URGENT: Product Recall Notice - ${recallDetails.productName}`,
      html: wrapEmailContent(content),
      priority: 'high',
    } as any);
  }

  /**
   * Send membership expiry warning
   */
  async sendMembershipExpiryEmail(
    to: string,
    membershipDetails: {
      firstName: string;
      membershipType: string;
      expiryDate: Date;
      daysRemaining: number;
      benefits: string[];
      renewalUrl: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Membership Expiring Soon', emoji: '⏰' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${membershipDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Your <strong>${membershipDetails.membershipType}</strong> membership will expire in <strong>${membershipDetails.daysRemaining} days</strong>.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          content: `<p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${formatDateShort(membershipDetails.expiryDate)}</p>
                    <p style="margin: 5px 0;">Don't lose access to your exclusive benefits!</p>`,
        })}

        <h3 style="color: #333; margin: 25px 0 15px;">Your Member Benefits:</h3>
        <ul style="color: #666; line-height: 2; padding-left: 20px;">
          ${membershipDetails.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}
        </ul>

        ${buttonTemplate({
          text: 'Renew Membership',
          url: membershipDetails.renewalUrl,
          color: MAIL_CONFIG.ACCENT_COLOR,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `Your ${membershipDetails.membershipType} Membership Expires in ${membershipDetails.daysRemaining} Days`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send pre-order availability notification
   */
  async sendPreOrderAvailableEmail(
    to: string,
    preOrderDetails: {
      firstName: string;
      productName: string;
      productId: string;
      preOrderDate: Date;
      availableDate: Date;
      shippingTimeline: string;
      productImage?: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Your Pre-Order is Available!', emoji: '🎁' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${preOrderDetails.firstName},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Exciting news! Your pre-ordered item is now available!
        </p>
        
        ${
          preOrderDetails.productImage
            ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${preOrderDetails.productImage}" alt="${preOrderDetails.productName}" style="max-width: 300px; height: auto; border-radius: 8px;">
        </div>
        `
            : ''
        }

        ${alertBoxTemplate({
          type: 'success',
          content: `<p style="margin: 5px 0;"><strong>Product:</strong> ${preOrderDetails.productName}</p>
                    <p style="margin: 5px 0;"><strong>Pre-Order Date:</strong> ${formatDateShort(preOrderDetails.preOrderDate)}</p>
                    <p style="margin: 5px 0;"><strong>Now Available:</strong> ${formatDateShort(preOrderDetails.availableDate)}</p>
                    <p style="margin: 5px 0;"><strong>Shipping:</strong> ${preOrderDetails.shippingTimeline}</p>`,
        })}

        ${buttonTemplate({
          text: 'Confirm Your Order',
          url: `${MAIL_CONFIG.WEBSITE_URL}/products/${preOrderDetails.productId}/pre-order-confirm`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: `${preOrderDetails.productName} is Now Available! 🎁`,
      html: wrapEmailContent(content),
    });
  }

  // ============================================
  // 8. ADMIN NOTIFICATION EMAILS
  // ============================================

  /**
   * Send low stock alert to admin
   */
  async sendLowStockAlertToAdmin(productDetails: {
    productName: string;
    productId: string;
    variantName?: string;
    variantId?: string;
    currentStock: number;
    threshold: number;
    sku?: string;
  }): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Low Stock Alert', emoji: '📉' })}
      <div style="padding: 40px;">
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          A product has reached the low stock threshold and requires attention.
        </p>
        
        ${alertBoxTemplate({
          type: 'warning',
          title: 'Product Information',
          content: `<p style="margin: 5px 0;"><strong>Product:</strong> ${productDetails.productName}</p>
                    ${productDetails.variantName ? `<p style="margin: 5px 0;"><strong>Variant:</strong> ${productDetails.variantName}</p>` : ''}
                    ${productDetails.sku ? `<p style="margin: 5px 0;"><strong>SKU:</strong> ${productDetails.sku}</p>` : ''}
                    <p style="margin: 5px 0;"><strong>Current Stock:</strong> <span style="color: ${MAIL_CONFIG.DANGER_COLOR}; font-weight: bold;">${productDetails.currentStock}</span></p>
                    <p style="margin: 5px 0;"><strong>Alert Threshold:</strong> ${productDetails.threshold}</p>`,
        })}

        ${buttonTemplate({
          text: 'Manage Inventory',
          url: `${MAIL_CONFIG.WEBSITE_URL}/admin/products/${productDetails.productId}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to: MAIL_CONFIG.ADMIN_EMAIL,
      subject: `🚨 Low Stock Alert: ${productDetails.productName}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send exchange request notification to admin
   */
  async sendExchangeRequestToAdmin(exchangeDetails: {
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    productName: string;
    exchangeReason: string;
    exchangeForProduct: string;
    requestDate: Date;
  }): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'New Exchange Request', emoji: '🔄' })}
      <div style="padding: 40px;">
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          A new product exchange request has been submitted.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          title: 'Exchange Details',
          content: `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${exchangeDetails.orderNumber}</p>
                    <p style="margin: 5px 0;"><strong>Customer:</strong> ${exchangeDetails.customerName} (${exchangeDetails.customerEmail})</p>
                    <p style="margin: 5px 0;"><strong>Original Product:</strong> ${exchangeDetails.productName}</p>
                    <p style="margin: 5px 0;"><strong>Exchange For:</strong> ${exchangeDetails.exchangeForProduct}</p>
                    <p style="margin: 5px 0;"><strong>Reason:</strong> ${exchangeDetails.exchangeReason}</p>
                    <p style="margin: 5px 0;"><strong>Request Date:</strong> ${formatDate(exchangeDetails.requestDate)}</p>`,
        })}

        ${alertBoxTemplate({
          type: 'warning',
          content:
            '<p style="margin: 0;">This request requires admin review and approval.</p>',
        })}

        ${buttonTemplate({
          text: 'Review Exchange Request',
          url: `${MAIL_CONFIG.WEBSITE_URL}/admin/returns/${exchangeDetails.orderNumber}`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to: MAIL_CONFIG.ADMIN_EMAIL,
      subject: `New Exchange Request - Order ${exchangeDetails.orderNumber}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send bulk order inquiry to admin
   */
  async sendBulkOrderInquiryToAdmin(inquiryDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    companyName?: string;
    productDetails: string;
    estimatedQuantity: number;
    message: string;
    submittedAt: Date;
  }): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'Bulk Order Inquiry', emoji: '📦' })}
      <div style="padding: 40px;">
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          A new bulk order inquiry has been submitted.
        </p>
        
        ${alertBoxTemplate({
          type: 'success',
          title: 'Customer Information',
          content: `<p style="margin: 5px 0;"><strong>Name:</strong> ${inquiryDetails.customerName}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${inquiryDetails.customerEmail}</p>
                    ${inquiryDetails.customerPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${inquiryDetails.customerPhone}</p>` : ''}
                    ${inquiryDetails.companyName ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${inquiryDetails.companyName}</p>` : ''}`,
        })}

        ${alertBoxTemplate({
          type: 'info',
          title: 'Order Details',
          content: `<p style="margin: 5px 0;"><strong>Product:</strong> ${inquiryDetails.productDetails}</p>
                    <p style="margin: 5px 0;"><strong>Estimated Quantity:</strong> ${inquiryDetails.estimatedQuantity} units</p>
                    <p style="margin: 10px 0;"><strong>Message:</strong></p>
                    <p style="margin: 0;">${inquiryDetails.message}</p>`,
        })}

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          <strong>Submitted:</strong> ${formatDate(inquiryDetails.submittedAt)}
        </p>

        ${buttonTemplate({
          text: 'Respond to Inquiry',
          url: `mailto:${inquiryDetails.customerEmail}?subject=Re: Bulk Order Inquiry`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to: MAIL_CONFIG.ADMIN_EMAIL,
      subject: `💼 Bulk Order Inquiry from ${inquiryDetails.customerName}`,
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send contact form response to user
   */
  async sendContactFormResponse(
    to: string,
    contactDetails: {
      name: string;
      message: string;
    },
  ): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'We Received Your Message', emoji: '📧' })}
      <div style="padding: 40px;">
        <h2 style="color: #333; margin: 0 0 20px;">Hi ${contactDetails.name},</h2>
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          Thank you for contacting us! We've received your message and our team will get back to you within 24-48 hours.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          title: 'Your Message',
          content: `<p style="margin: 0; white-space: pre-wrap;">${contactDetails.message}</p>`,
        })}

        <p style="color: #666; line-height: 1.8; font-size: 16px; margin-top: 20px;">
          If you have any urgent concerns, please don't hesitate to call us at ${MAIL_CONFIG.SUPPORT_PHONE}.
        </p>

        ${buttonTemplate({
          text: 'Visit Our Help Center',
          url: `${MAIL_CONFIG.WEBSITE_URL}/help`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to,
      subject: 'Thank You for Contacting Theming Cart',
      html: wrapEmailContent(content),
    });
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotificationToAdmin(contactData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<void> {
    const content = `
      ${headerTemplate({ title: 'New Contact Form Submission', emoji: '📬' })}
      <div style="padding: 40px;">
        <p style="color: #666; line-height: 1.8; font-size: 16px;">
          A new contact form submission has been received.
        </p>
        
        ${alertBoxTemplate({
          type: 'info',
          title: 'Contact Information',
          content: `<p style="margin: 5px 0;"><strong>Name:</strong> ${contactData.name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${contactData.email}</p>
                    ${contactData.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${contactData.phone}</p>` : ''}`,
        })}

        ${alertBoxTemplate({
          type: 'success',
          title: 'Message',
          content: `<p style="margin: 0; white-space: pre-wrap;">${contactData.message}</p>`,
        })}

        ${buttonTemplate({
          text: 'Reply to Customer',
          url: `mailto:${contactData.email}?subject=Re: Your Contact Form Inquiry`,
        })}
      </div>
      ${footerTemplate()}
    `;

    await this.transporter.sendMail({
      from: MAIL_CONFIG.FROM_EMAIL,
      to: MAIL_CONFIG.ADMIN_EMAIL,
      subject: `📬 New Contact Form Submission from ${contactData.name}`,
      html: wrapEmailContent(content),
    });
  }
}
