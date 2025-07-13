import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validate environment variables
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will not work.');
}

interface PasswordResetEmailProps {
  email: string;
  resetToken: string;
  username: string;
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  username,
}: PasswordResetEmailProps) {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?reset_token=${resetToken}`;
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'contact@kumarutkarsh.in',
      to: [email],
      subject: 'Reset Your RSS Freeder Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF69B4; margin: 0;">RSS Freeder</h1>
              <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${username}!</h2>
              
              <p>We received a request to reset your password for your RSS Freeder account.</p>
              
              <p>To reset your password, please copy the following token and paste it in the password reset form:</p>
              
              <div style="background: #fff; padding: 15px; border-radius: 5px; border: 2px dashed #FF69B4; margin: 20px 0; text-align: center;">
                <code style="font-size: 18px; font-weight: bold; color: #FF69B4; letter-spacing: 2px;">${resetToken}</code>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                <strong>Important:</strong> This token will expire in 1 hour for security reasons.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
              <p>This email was sent from RSS Freeder</p>
              <p>If you have any questions, please contact us at contact@kumarutkarsh.in</p>
            </div>
          </body>
        </html>
      `,
      text: `
Hello ${username}!

We received a request to reset your password for your RSS Freeder account.

To reset your password, please copy the following token and paste it in the password reset form:

${resetToken}

This token will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
RSS Freeder
contact@kumarutkarsh.in
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendWelcomeEmail(email: string, username: string) {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'contact@kumarutkarsh.in',
      to: [email],
      subject: 'Welcome to RSS Freeder!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RSS Freeder</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF69B4; margin: 0;">RSS Freeder</h1>
              <p style="color: #666; margin: 5px 0;">Welcome to your new RSS reader!</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Welcome ${username}!</h2>
              
              <p>Thank you for joining RSS Freeder! Your account has been successfully created.</p>
              
              <p>We've pre-loaded some popular tech feeds to get you started:</p>
              <ul style="color: #666;">
                <li>Google Developers Blog</li>
                <li>Stack Overflow Blog</li>
                <li>Dev.to</li>
                <li>This Week in React</li>
                <li>A List Apart</li>
                <li>CSS-Tricks</li>
              </ul>
              
              <p>You can add your own feeds, bookmark articles, and track your reading history. Enjoy!</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
              <p>This email was sent from RSS Freeder</p>
              <p>If you have any questions, please contact us at contact@kumarutkarsh.in</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to send email' };
  }
} 