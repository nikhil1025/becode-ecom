import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testBrevoSMTP() {
  console.log('🧪 Testing Brevo SMTP Configuration...\n');

  // Display configuration (without exposing secrets)
  console.log('Configuration:');
  console.log('  Host:', process.env.BREVO_SMTP_HOST);
  console.log('  Port:', process.env.BREVO_SMTP_PORT);
  console.log('  User:', process.env.BREVO_SMTP_USER ? '✓ Set' : '✗ Missing');
  console.log(
    '  API Key:',
    process.env.BREVO_SMTP_KEY
      ? `✓ Set (${process.env.BREVO_SMTP_KEY.substring(0, 10)}...)`
      : '✗ Missing',
  );
  console.log('  From Email:', process.env.MAIL_FROM);
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
    secure: false, // Use TLS
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
    logger: true, // Enable logging
    debug: true, // Show SMTP traffic in console
  });

  try {
    console.log('📡 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('📧 Step 2: Sending test email...');
    const testEmail = {
      from: process.env.MAIL_FROM || 'noreply@themingcart.com',
      to: process.env.ADMIN_EMAIL || 'admin@themingcart.com',
      subject: '🧪 Test Email - Brevo SMTP Configuration',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #4CAF50; margin-bottom: 20px;">✅ Brevo SMTP Test Successful!</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                This is a test email to verify that your Brevo SMTP configuration is working correctly.
              </p>
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Configuration Details:</p>
                <p style="margin: 5px 0;">Host: ${process.env.BREVO_SMTP_HOST}</p>
                <p style="margin: 5px 0;">Port: ${process.env.BREVO_SMTP_PORT}</p>
                <p style="margin: 5px 0;">From: ${process.env.MAIL_FROM}</p>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                <strong>Timestamp:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('');

    console.log('🎉 All tests passed! Brevo SMTP is configured correctly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('  1. Invalid SMTP API key');
    console.error(
      '  2. Incorrect SMTP username (should be your Brevo login email)',
    );
    console.error('  3. SMTP API key not enabled in Brevo account');
    console.error('  4. Sender email not verified in Brevo');
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

testBrevoSMTP();
