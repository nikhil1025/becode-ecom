import { EMAIL_STYLES } from '../../mail.config';

export type AlertType = 'info' | 'warning' | 'danger' | 'success';

export interface AlertBoxOptions {
  content: string;
  type?: AlertType;
  title?: string;
}

const alertIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🚨',
  success: '✅',
};

export const alertBoxTemplate = (options: AlertBoxOptions): string => {
  const { content, type = 'info', title } = options;

  const styleMap = {
    info: EMAIL_STYLES.infoBox,
    warning: EMAIL_STYLES.warningBox,
    danger: EMAIL_STYLES.dangerBox,
    success: EMAIL_STYLES.successBox,
  };

  const icon = alertIcons[type];

  return `
    <div style="${styleMap[type]}">
      ${title ? `<p style="margin: 0 0 10px; font-weight: bold; color: #333;">${icon} ${title}</p>` : ''}
      <div style="color: #555; line-height: 1.6;">
        ${content}
      </div>
    </div>
  `;
};
