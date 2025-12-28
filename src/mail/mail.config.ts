/**
 * Centralized Email Configuration for Theming Cart
 *
 * This file contains all branding and email settings.
 * Update the logo URL here to change it across all email templates.
 */

export const MAIL_CONFIG = {
  // Branding
  APP_NAME: 'Theming Cart',
  LOGO_URL:
    process.env.APP_LOGO_URL ||
    'https://via.placeholder.com/200x60/4CAF50/FFFFFF?text=Theming+Cart',

  // Color Scheme
  PRIMARY_COLOR: process.env.PRIMARY_BRAND_COLOR || '#4CAF50',
  SECONDARY_COLOR: '#2196F3',
  ACCENT_COLOR: '#FF9800',
  DANGER_COLOR: '#f44336',
  SUCCESS_COLOR: '#4CAF50',
  WARNING_COLOR: '#FFC107',
  INFO_COLOR: '#2196F3',

  // Contact Information
  FROM_EMAIL: process.env.MAIL_FROM || 'noreply@themingcart.com',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@themingcart.com',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@themingcart.com',
  SUPPORT_PHONE: process.env.SUPPORT_PHONE || '+1 (555) 123-4567',

  // URLs
  WEBSITE_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Social Media Links
  SOCIAL_LINKS: {
    facebook: process.env.FACEBOOK_URL || 'https://facebook.com/themingcart',
    instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/themingcart',
    twitter: process.env.TWITTER_URL || 'https://twitter.com/themingcart',
    linkedin:
      process.env.LINKEDIN_URL || 'https://linkedin.com/company/themingcart',
  },

  // Footer Text
  FOOTER_TEXT: `© ${new Date().getFullYear()} Theming Cart. All rights reserved.`,

  // Typography
  FONT_FAMILY: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",

  // Spacing
  PADDING_LARGE: '40px',
  PADDING_MEDIUM: '30px',
  PADDING_SMALL: '20px',

  // Border Radius
  BORDER_RADIUS: '8px',
  BORDER_RADIUS_LARGE: '12px',
};

/**
 * Get social media icon URLs
 * Using placeholder icons - replace with your actual icon URLs
 */
export const getSocialIconUrl = (platform: string): string => {
  const icons = {
    facebook: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
    instagram: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
    twitter: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
    linkedin: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
  };
  return icons[platform] || '';
};

/**
 * Email template wrapper styles
 */
export const EMAIL_STYLES = {
  body: `margin: 0; padding: 0; font-family: ${MAIL_CONFIG.FONT_FAMILY}; background-color: #f4f4f4;`,
  container: `width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;`,
  header: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: ${MAIL_CONFIG.PADDING_MEDIUM} 0; text-align: center;`,
  headerTitle: `color: #ffffff; margin: 10px 0 0; font-size: 24px; font-weight: 600;`,
  content: `padding: ${MAIL_CONFIG.PADDING_LARGE}; color: #333333; line-height: 1.6;`,
  footer: `background-color: #2c3e50; color: #ffffff; padding: ${MAIL_CONFIG.PADDING_LARGE} ${MAIL_CONFIG.PADDING_SMALL}; text-align: center;`,
  button: `display: inline-block; padding: 15px 40px; background-color: ${MAIL_CONFIG.PRIMARY_COLOR}; color: #ffffff; text-decoration: none; border-radius: ${MAIL_CONFIG.BORDER_RADIUS}; font-weight: bold; font-size: 16px;`,
  infoBox: `background-color: #f8f9fa; border-left: 4px solid ${MAIL_CONFIG.PRIMARY_COLOR}; padding: ${MAIL_CONFIG.PADDING_SMALL}; margin: 20px 0;`,
  warningBox: `background-color: #fff3cd; border-left: 4px solid ${MAIL_CONFIG.WARNING_COLOR}; padding: ${MAIL_CONFIG.PADDING_SMALL}; margin: 20px 0;`,
  dangerBox: `background-color: #f8d7da; border-left: 4px solid ${MAIL_CONFIG.DANGER_COLOR}; padding: ${MAIL_CONFIG.PADDING_SMALL}; margin: 20px 0;`,
  successBox: `background-color: #d4edda; border-left: 4px solid ${MAIL_CONFIG.SUCCESS_COLOR}; padding: ${MAIL_CONFIG.PADDING_SMALL}; margin: 20px 0;`,
};
