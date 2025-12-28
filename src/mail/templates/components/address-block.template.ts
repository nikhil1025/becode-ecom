import { MAIL_CONFIG } from '../../mail.config';

export interface Address {
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export const addressBlockTemplate = (
  address: Address,
  title?: string,
): string => {
  return `
    ${title ? `<h3 style="color: #333; margin: 30px 0 15px; font-size: 18px;">${title}</h3>` : ''}
    <div style="background-color: #f8f9fa; padding: ${MAIL_CONFIG.PADDING_SMALL}; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; border: 1px solid #e9ecef;">
      <p style="margin: 0; line-height: 1.8; color: #555; font-size: 14px;">
        ${address.firstName && address.lastName ? `<strong style="color: #333;">${address.firstName} ${address.lastName}</strong><br>` : ''}
        ${address.street}<br>
        ${address.city}, ${address.state} ${address.zipCode}<br>
        ${address.country}
        ${address.phone ? `<br>📞 ${address.phone}` : ''}
      </p>
    </div>
  `;
};
