import { MAIL_CONFIG, getSocialIconUrl } from '../../mail.config';

export const footerTemplate = (): string => {
  const socialLinks = Object.entries(MAIL_CONFIG.SOCIAL_LINKS)
    .map(
      ([platform, url]) => `
        <a href="${url}" style="display: inline-block; margin: 0 8px;" target="_blank">
          <img src="${getSocialIconUrl(platform)}" alt="${platform}" style="width: 30px; height: 30px; border-radius: 4px;">
        </a>
      `,
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #2c3e50; color: #ffffff;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <p style="margin: 0 0 15px; font-size: 18px; font-weight: bold; color: #ffffff;">${MAIL_CONFIG.APP_NAME}</p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #ecf0f1;">
            Need help? Contact us at 
            <a href="mailto:${MAIL_CONFIG.SUPPORT_EMAIL}" style="color: ${MAIL_CONFIG.SUCCESS_COLOR}; text-decoration: none; font-weight: 500;">
              ${MAIL_CONFIG.SUPPORT_EMAIL}
            </a>
          </p>
          <p style="margin: 0 0 20px; font-size: 14px; color: #ecf0f1;">or call ${MAIL_CONFIG.SUPPORT_PHONE}</p>
          
          <div style="margin: 25px 0;">
            ${socialLinks}
          </div>

          <p style="margin: 20px 0 0; font-size: 12px; color: #95a5a6;">${MAIL_CONFIG.FOOTER_TEXT}</p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #95a5a6; line-height: 1.6;">
            <a href="${MAIL_CONFIG.WEBSITE_URL}/privacy" style="color: #95a5a6; text-decoration: none; margin: 0 8px;">Privacy Policy</a> | 
            <a href="${MAIL_CONFIG.WEBSITE_URL}/terms" style="color: #95a5a6; text-decoration: none; margin: 0 8px;">Terms of Service</a> |
            <a href="${MAIL_CONFIG.WEBSITE_URL}/unsubscribe" style="color: #95a5a6; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  `;
};
