import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize transporter when needed
  getTransporter() {
    if (!this.transporter) {
      // Check if email credentials are configured
      const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

      if (isConfigured) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        console.log('⚠️ Email credentials not configured - OTP will be logged to console');
        return null;
      }
    }
    return this.transporter;
  }

  // Send OTP email with fallback to console logging
  async sendOTPEmail(email, name, otpCode) {
    const transporter = this.getTransporter();

    // If email is not configured, just log the OTP
    if (!transporter) {
      console.log(`📧 OTP Code for ${email}: ${otpCode}`);
      console.log('⚠️ Email service not configured - OTP logged to console');
      return { messageId: 'console-log', email, otpCode };
    }

    try {
      const mailOptions = {
        from: `"QuickCourt" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - QuickCourt',
        html: this.getOTPEmailTemplate(name, otpCode),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      console.log(`📧 OTP Code (email failed): ${otpCode}`);
      // Don't throw error, just log the OTP as fallback
      return { messageId: 'email-failed', email, otpCode, error: error.message };
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, name) {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.log(`📧 Welcome email would be sent to: ${email}`);
      return null;
    }

    try {
      const mailOptions = {
        from: `"QuickCourt" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to QuickCourt!',
        html: this.getWelcomeEmailTemplate(name),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return null;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, resetToken) {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.log(`📧 Password reset token for ${email}: ${resetToken}`);
      console.log('⚠️ Email service not configured - reset token logged to console');
      return { messageId: 'console-log', email, resetToken };
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: `"QuickCourt" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password - QuickCourt',
        html: this.getPasswordResetEmailTemplate(name, resetUrl, resetToken),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error.message);
      console.log(`📧 Password reset token (email failed): ${resetToken}`);
      return { messageId: 'email-failed', email, resetToken, error: error.message };
    }
  }

  // OTP Email Template
  getOTPEmailTemplate(name, otpCode) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; }
          .otp-box { background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏟️ QuickCourt</h1>
            <p>Sports Facility Booking Platform</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Welcome to QuickCourt! To complete your registration, please verify your email address using the OTP code below:</p>
            <div class="otp-box">
              <p>Your verification code is:</p>
              <div class="otp-code">${otpCode}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            <p>If you didn't create an account with QuickCourt, please ignore this email.</p>
            <p>Best regards,<br>The QuickCourt Team</p>
          </div>
          <div class="footer">
            <p><small>© 2025 QuickCourt. All rights reserved.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Welcome Email Template
  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to QuickCourt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; }
          .feature-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to QuickCourt!</h1>
            <p>Your account has been verified successfully</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Congratulations! Your email has been verified and your QuickCourt account is now active.</p>
            <h3>What you can do now:</h3>
            <div class="feature-box">
              <strong>🏟️ Browse Venues</strong><br>
              Discover sports facilities in your area
            </div>
            <div class="feature-box">
              <strong>📅 Book Courts</strong><br>
              Reserve your preferred time slots instantly
            </div>
            <div class="feature-box">
              <strong>⭐ Leave Reviews</strong><br>
              Share your experience and help others
            </div>
            <p>Ready to get started? Visit our platform and book your first court!</p>
            <p>Best regards,<br>The QuickCourt Team</p>
          </div>
          <div class="footer">
            <p><small>© 2025 QuickCourt. All rights reserved.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password Reset Email Template
  getPasswordResetEmailTemplate(name, resetUrl, resetToken) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; }
          .reset-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .token-box { background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 QuickCourt</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>We received a request to reset your password for your QuickCourt account. If you made this request, click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">
              <p><small>Reset Link:</small></p>
              <p style="word-break: break-all; font-size: 12px;">${resetUrl}</p>
            </div>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will not be changed.</p>
            <p>Best regards,<br>The QuickCourt Team</p>
          </div>
          <div class="footer">
            <p><small>© 2025 QuickCourt. All rights reserved.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Verify email service configuration
  async verifyConnection() {
    try {
      const transporter = this.getTransporter();

      if (!transporter) {
        console.log('⚠️ Email credentials not configured - OTP will be logged to console');
        return false;
      }

      await transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      console.log('⚠️ OTP codes will be logged to console instead');
      return false;
    }
  }
}

// Create and export a single instance
const emailService = new EmailService();
export default emailService;
