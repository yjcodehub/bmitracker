import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private transporter;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
  }

  async sendWelcome(email: string, name: string, gymName: string) {
    return this.send(
      email,
      `Welcome to ${gymName}`,
      `<h2>Welcome, ${name}!</h2><p>Your membership registration has been received. You will be notified once approved.</p>`
    );
  }

  async sendWelcomeApproved(email: string, name: string, gymName: string) {
    return this.send(
      email,
      `Welcome to ${gymName}!`,
      `<h2>Welcome to the Gym, ${name}!</h2><p>Your membership registration has been approved. You can now log in to the portal and view your diet plans, progress, and reports.</p>`
    );
  }

  async sendReport(email: string, name: string, pdfBuffer: Buffer, fileName: string) {
    return this.send(
      email,
      'Your Body Analysis Report',
      `<h2>Hello ${name},</h2><p>Please find your latest body analysis report attached.</p>`,
      [{ filename: fileName, content: pdfBuffer }]
    );
  }

  async sendPasswordReset(email: string, resetUrl: string) {
    return this.send(
      email,
      'Password Reset Request',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
    );
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; content: Buffer }[]
  ) {
    if (!this.transporter) {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
      return { messageId: 'mock' };
    }

    return this.transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });
  }
}

export const emailService = new EmailService();
