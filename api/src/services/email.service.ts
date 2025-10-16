import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Mail.Attachment[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service connection error:', error);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions: Mail.Options = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'EventHub',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!,
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification link to user
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
            .link { word-break: break-all; color: #667eea; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to EventHub!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for joining EventHub! We're excited to have you discover amazing events.</p>
              <p>Please verify your email address to activate your account and start booking tickets:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p class="link">${verificationUrl}</p>
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <strong>⏰ This link will expire in 24 hours.</strong>
              </p>
              <p style="color: #666; font-size: 14px;">
                If you didn't create an account with EventHub, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your EventHub Email Address 📧',
      html,
    });
  }

  /**
   * Send password reset link to user
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
            .link { word-break: break-all; color: #667eea; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password for your EventHub account.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p class="link">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your EventHub Password 🔑',
      html,
    });
  }

  /**
   * Send ticket confirmation with JPG attachment
   */
  async sendTicketEmail(
    email: string,
    firstName: string,
    transaction: any,
    event: any,
    ticketImageBuffer: Buffer
  ): Promise<void> {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #667eea; }
            .value { text-align: right; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; color: #155724; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
            .highlight { background: #ffeaa7; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Ticket Purchase Successful!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <div class="success">
                <strong>✅ Your ticket has been confirmed!</strong><br>
                We're excited to see you at the event.
              </div>
              
              <div class="ticket-info">
                <h3 style="margin-top: 0; color: #667eea;">📅 Event Details</h3>
                <div class="info-row">
                  <span class="label">Event:</span>
                  <span class="value"><strong>${event.name}</strong></span>
                </div>
                <div class="info-row">
                  <span class="label">Date & Time:</span>
                  <span class="value">${formatDate(event.startDate)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Location:</span>
                  <span class="value">${event.location}</span>
                </div>
                <div class="info-row">
                  <span class="label">Address:</span>
                  <span class="value">${event.address}</span>
                </div>
              </div>

              <div class="ticket-info">
                <h3 style="margin-top: 0; color: #667eea;">💳 Purchase Details</h3>
                <div class="info-row">
                  <span class="label">Transaction ID:</span>
                  <span class="value">#${transaction.id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Amount:</span>
                  <span class="value"><strong>${formatCurrency(transaction.finalAmount)}</strong></span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Status:</span>
                  <span class="value"><span class="highlight">${transaction.status}</span></span>
                </div>
              </div>

              <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>📎 Your ticket is attached to this email as a JPG image.</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">
                  Please present this ticket (digital or printed) at the event entrance for scanning.
                </p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Important Instructions:</strong>
              </p>
              <ul style="color: #666;">
                <li>Save the attached ticket image to your phone</li>
                <li>Arrive 30 minutes early for smooth check-in</li>
                <li>Have your ticket ready for QR code scanning</li>
                <li>Bring a valid ID for verification</li>
              </ul>
              
              <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Need help? Contact us at <a href="mailto:support@eventhub.com" style="color: #667eea;">support@eventhub.com</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `🎟️ Your Ticket for ${event.name} - EventHub`,
      html,
      attachments: [
        {
          filename: `EventHub-Ticket-${transaction.id}.jpg`,
          content: ticketImageBuffer,
          contentType: 'image/jpeg',
        },
      ],
    });
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmationEmail(
    email: string,
    firstName: string,
    transactionId: number,
    eventName: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; color: #155724; border-radius: 5px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <div class="success">
                <strong>Great news!</strong> Your payment has been confirmed by the event organizer.
              </div>
              <p><strong>Event:</strong> ${eventName}</p>
              <p><strong>Transaction ID:</strong> #${transactionId}</p>
              <p>Your tickets have been sent to your email. Please check your inbox for the ticket attachment.</p>
              <center>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/transactions/${transactionId}" class="button">View Transaction</a>
              </center>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Don't forget to save your ticket and present it at the event entrance!
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `✅ Payment Confirmed - ${eventName}`,
      html,
    });
  }
}

export default new EmailService();
