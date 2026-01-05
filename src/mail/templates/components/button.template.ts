import { MAIL_CONFIG } from '../../mail.config';

export interface ButtonOptions {
  text: string;
  url: string;
  color?: string;
  fullWidth?: boolean;
  primary?: boolean;
}

export const buttonTemplate = (options: ButtonOptions): string => {
  const {
    text,
    url,
    color = MAIL_CONFIG.PRIMARY_COLOR,
    fullWidth = false,
  } = options;

  const buttonStyle = fullWidth
    ? `display: block; width: 100%; padding: 15px 20px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; font-weight: bold; font-size: 16px; text-align: center; box-sizing: border-box;`
    : `display: inline-block; padding: 15px 40px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; font-weight: bold; font-size: 16px;`;

  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="${buttonStyle}" target="_blank">
        ${text}
      </a>
    </div>
  `;
};

export const buttonGroupTemplate = (buttons: ButtonOptions[]): string => {
  const buttonHtml = buttons
    .map((btn) => {
      const color = btn.color || MAIL_CONFIG.SECONDARY_COLOR;
      return `
        <a href="${btn.url}" style="display: inline-block; margin: 0 10px; padding: 12px 30px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; font-weight: bold; font-size: 14px;" target="_blank">
          ${btn.text}
        </a>
      `;
    })
    .join('');

  return `
    <div style="text-align: center; margin: 30px 0;">
      ${buttonHtml}
    </div>
  `;
};
