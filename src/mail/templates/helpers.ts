/**
 * Email Template Helper Functions
 * Utilities for formatting data and generating dynamic email content
 */

import { EMAIL_STYLES, getSocialIconUrl, MAIL_CONFIG } from '../mail.config';

/**
 * Format currency to INR
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

/**
 * Format date in a readable format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format date without time
 */
export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Generate email header with logo
 */
export const generateHeader = (title?: string, emoji?: string): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${EMAIL_STYLES.header}">
      <tr>
        <td align="center">
          <img src="${MAIL_CONFIG.LOGO_URL}" alt="${MAIL_CONFIG.APP_NAME}" style="height: 50px; width: auto;">
          ${title ? `<h1 style="${EMAIL_STYLES.headerTitle}">${emoji ? emoji + ' ' : ''}${title}</h1>` : ''}
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generate email footer with social links
 */
export const generateFooter = (): string => {
  const socialLinks = Object.entries(MAIL_CONFIG.SOCIAL_LINKS)
    .map(
      ([platform, url]) => `
        <a href="${url}" style="display: inline-block; margin: 0 10px;">
          <img src="${getSocialIconUrl(platform)}" alt="${platform}" style="width: 30px; height: 30px; border-radius: 4px;">
        </a>
      `,
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${EMAIL_STYLES.footer}">
      <tr>
        <td align="center">
          <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold;">${MAIL_CONFIG.APP_NAME}</p>
          <p style="margin: 0 0 10px; font-size: 14px;">
            Need help? Contact us at 
            <a href="mailto:${MAIL_CONFIG.SUPPORT_EMAIL}" style="color: ${MAIL_CONFIG.SUCCESS_COLOR}; text-decoration: none;">
              ${MAIL_CONFIG.SUPPORT_EMAIL}
            </a>
          </p>
          <p style="margin: 0 0 10px; font-size: 14px;">or call ${MAIL_CONFIG.SUPPORT_PHONE}</p>
          
          <div style="margin: 20px 0;">
            ${socialLinks}
          </div>

          <p style="margin: 20px 0 0; font-size: 12px; color: #95a5a6;">${MAIL_CONFIG.FOOTER_TEXT}</p>
          <p style="margin: 5px 0 0; font-size: 12px; color: #95a5a6;">
            <a href="${MAIL_CONFIG.WEBSITE_URL}/privacy" style="color: #95a5a6; text-decoration: none;">Privacy Policy</a> | 
            <a href="${MAIL_CONFIG.WEBSITE_URL}/terms" style="color: #95a5a6; text-decoration: none;">Terms of Service</a> |
            <a href="${MAIL_CONFIG.WEBSITE_URL}/unsubscribe" style="color: #95a5a6; text-decoration: none;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generate CTA button
 */
export const generateButton = (
  text: string,
  url: string,
  color?: string,
): string => {
  const buttonColor = color || MAIL_CONFIG.PRIMARY_COLOR;
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="display: inline-block; padding: 15px 40px; background-color: ${buttonColor}; color: #ffffff; text-decoration: none; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; font-weight: bold; font-size: 16px;">
        ${text}
      </a>
    </div>
  `;
};

/**
 * Generate info box
 */
export const generateInfoBox = (
  content: string,
  type: 'info' | 'warning' | 'danger' | 'success' = 'info',
): string => {
  const styleMap = {
    info: EMAIL_STYLES.infoBox,
    warning: EMAIL_STYLES.warningBox,
    danger: EMAIL_STYLES.dangerBox,
    success: EMAIL_STYLES.successBox,
  };

  return `
    <div style="${styleMap[type]}">
      ${content}
    </div>
  `;
};

/**
 * Generate order items table
 */
export const generateOrderItemsTable = (items: any[]): string => {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px 12px; border-bottom: 1px solid #dee2e6;">
          <div style="display: flex; align-items: center;">
            ${
              item.variant?.images?.[0]?.url
                ? `
              <img src="${item.variant.images[0].url}" alt="${item.productSnapshot.name}" 
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
            `
                : ''
            }
            <div>
              <strong style="color: #333;">${item.productSnapshot.name}</strong>
              ${item.variant?.name ? `<br><small style="color: #666;">${item.variant.name}</small>` : ''}
              ${item.variant?.sku ? `<br><small style="color: #999;">SKU: ${item.variant.sku}</small>` : ''}
            </div>
          </div>
        </td>
        <td style="text-align: center; padding: 15px 12px; border-bottom: 1px solid #dee2e6; color: #333;">
          ${item.quantity}
        </td>
        <td style="text-align: right; padding: 15px 12px; border-bottom: 1px solid #dee2e6;">
          <strong style="color: #333;">${formatCurrency(item.price * item.quantity)}</strong>
        </td>
      </tr>
    `,
    )
    .join('');

  return `
    <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; color: #333;">Product</th>
          <th style="text-align: center; padding: 12px; border-bottom: 2px solid #dee2e6; color: #333;">Qty</th>
          <th style="text-align: right; padding: 12px; border-bottom: 2px solid #dee2e6; color: #333;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * Generate address block
 */
export const generateAddressBlock = (address: any): string => {
  return `
    <div style="background-color: #f8f9fa; padding: ${MAIL_CONFIG.PADDING_SMALL}; border-radius: ${MAIL_CONFIG.BORDER_RADIUS};">
      <p style="margin: 0; line-height: 1.8; color: #666;">
        ${address.firstName || ''} ${address.lastName || ''}<br>
        ${address.street}<br>
        ${address.city}, ${address.state} ${address.zipCode}<br>
        ${address.country}
        ${address.phone ? `<br>Phone: ${address.phone}` : ''}
      </p>
    </div>
  `;
};

/**
 * Wrap content in email body structure
 */
export const wrapEmailContent = (bodyContent: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${MAIL_CONFIG.APP_NAME}</title>
    </head>
    <body style="${EMAIL_STYLES.body}">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: ${MAIL_CONFIG.BORDER_RADIUS_LARGE}; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td>
                  ${bodyContent}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Generate order summary section
 */
export const generateOrderSummary = (order: any): string => {
  return `
    <div style="${EMAIL_STYLES.infoBox}">
      <p style="margin: 0 0 10px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p style="margin: 0 0 10px;"><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
      <p style="margin: 0 0 10px;"><strong>Order Status:</strong> 
        <span style="color: ${MAIL_CONFIG.PRIMARY_COLOR}; font-weight: bold;">${order.status}</span>
      </p>
      ${
        order.paymentStatus
          ? `<p style="margin: 0;"><strong>Payment Status:</strong> 
        <span style="color: ${MAIL_CONFIG.PRIMARY_COLOR}; font-weight: bold;">${order.paymentStatus}</span>
      </p>`
          : ''
      }
    </div>
  `;
};

/**
 * Generate order total section
 */
export const generateOrderTotal = (order: any): string => {
  return `
    <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0;">
      ${
        order.subtotal
          ? `
      <tr>
        <td style="text-align: right; color: #666;">Subtotal:</td>
        <td style="text-align: right; color: #333; width: 120px;">${formatCurrency(order.subtotal)}</td>
      </tr>
      `
          : ''
      }
      ${
        order.shippingCost
          ? `
      <tr>
        <td style="text-align: right; color: #666;">Shipping:</td>
        <td style="text-align: right; color: #333;">${formatCurrency(order.shippingCost)}</td>
      </tr>
      `
          : ''
      }
      ${
        order.tax
          ? `
      <tr>
        <td style="text-align: right; color: #666;">Tax:</td>
        <td style="text-align: right; color: #333;">${formatCurrency(order.tax)}</td>
      </tr>
      `
          : ''
      }
      ${
        order.discount
          ? `
      <tr>
        <td style="text-align: right; color: #666;">Discount:</td>
        <td style="text-align: right; color: ${MAIL_CONFIG.SUCCESS_COLOR};">-${formatCurrency(order.discount)}</td>
      </tr>
      `
          : ''
      }
      <tr style="border-top: 2px solid #dee2e6;">
        <td style="text-align: right; padding-top: 15px; font-size: 18px;"><strong>Total:</strong></td>
        <td style="text-align: right; padding-top: 15px; font-size: 18px; color: ${MAIL_CONFIG.PRIMARY_COLOR};">
          <strong>${formatCurrency(order.total)}</strong>
        </td>
      </tr>
    </table>
  `;
};
