import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import nodemailer from 'nodemailer'

@Injectable()
export class MailUtils {


  public static async sendEmailVerificationLink(email: string, verificationUrl: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'karthikiruba012@gmail.com',
        pass: 'csxg hinr clnu pbjz',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error sending verification email: ${error.message}`);
    throw new Error('Failed to send verification email');
  }
}


  public static async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'karthikiruba012@gmail.com',
        pass: 'csxg hinr clnu pbjz',
      },
    });

    const mailOptions = {
      from: 'karthikiruba012@gmail.com',
      to: email,
      subject: 'Verify your email address',
      text: `Your verification code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
  }

   static async sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
          const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'karthikiruba012@gmail.com',
        pass: 'csxg hinr clnu pbjz',
      },
    });
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: 'Password Reset Instructions',
        html: `
          <h1>Reset Your Password</h1>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 30 Minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending password reset email: ${error.message}`);
      throw new Error('Failed to send password reset email');
    }
  }

}



export interface MailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  cc?: string[];
  attachments?: AttachmentOptions[];
}

export interface AttachmentOptions {
  filename: string;
  content: any;
  type?: string;
  disposition?: string;
}
