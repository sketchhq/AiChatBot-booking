import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import { logger } from './logger';

@Injectable()
export class BrevoEmailService {
  private apiInstance: Brevo.TransactionalEmailsApi;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.senderEmail = process.env.BREVO_SENDER_EMAIL;
    this.senderName = process.env.BREVO_SENDER_NAME || 'No-Reply';

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error('BREVO_API_KEY missing from .env');
    }
    if (!this.senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL missing from .env');
    }

    const brevoClient = new Brevo.TransactionalEmailsApi();
    brevoClient.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );

    this.apiInstance = brevoClient;
  }

  // ---------------- Generic Send Email ----------------
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const emailData = {
        sender: { email: this.senderEmail, name: this.senderName },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      };

      const response = await this.apiInstance.sendTransacEmail(emailData);

      logger.info(`Email sent successfully to: ${to}`);
      return response;
    } catch (error: any) {
      const msg = error?.response?.body || error?.message;
      logger.error(`Brevo email send failed: ${JSON.stringify(msg)}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // ---------------- OTP Email ----------------
  async sendOtpEmail(email: string, otp: string) {
    const html = `
      <h2>Your Verification Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code will expire soon.</p>
    `;
    return this.sendEmail(email, 'Your OTP Code', html);
  }

  // ---------------- Email Verification Link ----------------
  async sendEmailVerification(email: string, verificationUrl: string) {
    const html = `
      <h2>Verify Your Email</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;
    return this.sendEmail(email, 'Verify Your Email', html);
  }

  // ---------------- Password Reset Email ----------------
async sendPasswordReset(email: string, resetUrl: string) {
  const html = `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
        
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>

        <p>You requested a password reset. Please click the button below to reset your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
            style="
              background-color: #4CAF50;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              font-size: 16px;
              border-radius: 6px;
              display: inline-block;
            ">
            Reset Password
          </a>
        </div>

        <p>This link will expire in <strong>30 minutes</strong>.</p>

        <p>If you didn't request this, please ignore this email.</p>

      </div>
    </body>
  </html>
  `;

  return this.sendEmail(email, 'Password Reset Instructions', html);
}


}
