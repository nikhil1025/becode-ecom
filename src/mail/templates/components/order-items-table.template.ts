import { formatCurrency } from '../helpers';

export interface OrderItem {
  productSnapshot: {
    name: string;
  };
  variant?: {
    name?: string;
    sku?: string;
    images?: Array<{ url: string }>;
  };
  quantity: number;
  price: number;
}

export const orderItemsTableTemplate = (items: OrderItem[]): string => {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px 12px; border-bottom: 1px solid #dee2e6;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              ${
                item.variant?.images?.[0]?.url
                  ? `
                <td style="width: 75px; vertical-align: top;">
                  <img src="${item.variant.images[0].url}" alt="${item.productSnapshot.name}" 
                       style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; display: block;">
                </td>
              `
                  : ''
              }
              <td style="vertical-align: top;">
                <strong style="color: #333; font-size: 15px;">${item.productSnapshot.name}</strong>
                ${item.variant?.name ? `<br><span style="color: #666; font-size: 13px;">${item.variant.name}</span>` : ''}
                ${item.variant?.sku ? `<br><span style="color: #999; font-size: 12px;">SKU: ${item.variant.sku}</span>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="text-align: center; padding: 15px 12px; border-bottom: 1px solid #dee2e6; color: #333; font-size: 15px;">
          ${item.quantity}
        </td>
        <td style="text-align: right; padding: 15px 12px; border-bottom: 1px solid #dee2e6;">
          <strong style="color: #333; font-size: 15px;">${formatCurrency(item.price * item.quantity)}</strong>
          ${item.quantity > 1 ? `<br><span style="color: #999; font-size: 12px;">${formatCurrency(item.price)} each</span>` : ''}
        </td>
      </tr>
    `,
    )
    .join('');

  return `
    <h3 style="color: #333; margin: 30px 0 15px; font-size: 18px;">Order Items:</h3>
    <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
          <th style="text-align: center; padding: 12px; border-bottom: 2px solid #dee2e6; color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 80px;">Qty</th>
          <th style="text-align: right; padding: 12px; border-bottom: 2px solid #dee2e6; color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 120px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};
