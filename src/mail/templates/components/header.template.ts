import { EMAIL_STYLES, MAIL_CONFIG } from '../../mail.config';

export interface HeaderOptions {
  title?: string;
  emoji?: string;
  subtitle?: string;
}

export const headerTemplate = (options: HeaderOptions = {}): string => {
  const { title, emoji, subtitle } = options;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${EMAIL_STYLES.header}">
      <tr>
        <td align="center" style="padding: 30px 20px;">
          <img src="${MAIL_CONFIG.LOGO_URL}" alt="${MAIL_CONFIG.APP_NAME}" style="height: 50px; width: auto; display: block; margin: 0 auto;">
          ${title ? `<h1 style="${EMAIL_STYLES.headerTitle}">${emoji ? emoji + ' ' : ''}${title}</h1>` : ''}
          ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">${subtitle}</p>` : ''}
        </td>
      </tr>
    </table>
  `;
};
