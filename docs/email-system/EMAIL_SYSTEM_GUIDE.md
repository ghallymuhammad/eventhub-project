# Email System Implementation Guide for EventHub

## Overview
This guide covers implementing email notifications for:
1. ✉️ Email verification
2. 🔐 Password reset
3. 🎟️ Ticket purchase confirmation with ticket image attachment
4. 📧 General notifications

---

## 📦 Required Packages

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
npm install qrcode
npm install @types/qrcode --save-dev
npm install canvas
npm install handlebars
```

---

## 🛠️ Implementation Steps

### Step 1: Environment Variables

Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@eventhub.com
SMTP_FROM_NAME=EventHub

# Base URL for email links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000
```

**Note for Gmail:**
- Enable 2-Factor Authentication
- Create an App Password: https://myaccount.google.com/apppasswords
- Use the generated password in `SMTP_PASSWORD`

---

### Step 2: Email Service Configuration

Create `/api/src/services/email.service.ts`:

```typescript
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
      host: process.env.SMTP_HOST,
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
        console.error('Email service connection error:', error);
      } else {
        console.log('Email service is ready to send messages');
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
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Email Verification
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = \`\${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=\${token}\`;
    
    const html = \`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to EventHub!</h1>
            </div>
            <div class="content">
              <h2>Hi \${firstName},</h2>
              <p>Thank you for joining EventHub! We're excited to have you discover amazing events.</p>
              <p>Please verify your email address to activate your account and start booking tickets:</p>
              <a href="\${verificationUrl}" class="button">Verify Email Address</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">\${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with EventHub, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    \`;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your EventHub Email Address',
      html,
    });
  }

  // Password Reset
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = \`\${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=\${token}\`;
    
    const html = \`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi \${firstName},</h2>
              <p>We received a request to reset your password for your EventHub account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="\${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">\${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    \`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your EventHub Password',
      html,
    });
  }

  // Ticket Purchase Confirmation (will be implemented below with ticket generator)
  async sendTicketEmail(
    email: string,
    firstName: string,
    transaction: any,
    event: any,
    ticketImageBuffer: Buffer
  ): Promise<void> {
    const html = \`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #667eea; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; color: #155724; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Ticket Purchase Successful!</h1>
            </div>
            <div class="content">
              <h2>Hi \${firstName},</h2>
              <div class="success">
                ✅ Your ticket has been confirmed! We're excited to see you at the event.
              </div>
              
              <div class="ticket-info">
                <h3>Event Details</h3>
                <div class="info-row">
                  <span class="label">Event:</span>
                  <span>\${event.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date:</span>
                  <span>\${new Date(event.startDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="label">Location:</span>
                  <span>\${event.location}</span>
                </div>
                <div class="info-row">
                  <span class="label">Address:</span>
                  <span>\${event.address}</span>
                </div>
              </div>

              <div class="ticket-info">
                <h3>Purchase Details</h3>
                <div class="info-row">
                  <span class="label">Transaction ID:</span>
                  <span>#\${transaction.id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Amount:</span>
                  <span>Rp \${transaction.finalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Status:</span>
                  <span>\${transaction.status}</span>
                </div>
              </div>

              <p><strong>📎 Your ticket is attached to this email as a JPG image.</strong></p>
              <p>Please present this ticket (digital or printed) at the event entrance.</p>
              
              <p>Need help? Contact us at support@eventhub.com</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    \`;

    await this.sendEmail({
      to: email,
      subject: \`Your Ticket for \${event.name} - EventHub\`,
      html,
      attachments: [
        {
          filename: \`ticket-\${transaction.id}.jpg\`,
          content: ticketImageBuffer,
          contentType: 'image/jpeg',
        },
      ],
    });
  }

  // Payment Confirmation Email
  async sendPaymentConfirmationEmail(
    email: string,
    firstName: string,
    transactionId: number,
    eventName: string
  ): Promise<void> {
    const html = \`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; color: #155724; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hi \${firstName},</h2>
              <div class="success">
                Great news! Your payment has been confirmed by the event organizer.
              </div>
              <p><strong>Event:</strong> \${eventName}</p>
              <p><strong>Transaction ID:</strong> #\${transactionId}</p>
              <p>Your tickets have been sent to your email. Please check your inbox for the ticket attachment.</p>
              <a href="\${process.env.NEXT_PUBLIC_BASE_URL}/transactions/\${transactionId}" class="button">View Transaction</a>
            </div>
            <div class="footer">
              <p>&copy; 2025 EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    \`;

    await this.sendEmail({
      to: email,
      subject: \`Payment Confirmed - \${eventName}\`,
      html,
    });
  }
}

export default new EmailService();
```

---

### Step 3: Ticket Image Generator

Create `/api/src/services/ticketGenerator.service.ts`:

```typescript
import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';

interface TicketData {
  transactionId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  attendeeName: string;
  quantity: number;
  qrCodeData: string;
}

class TicketGeneratorService {
  async generateTicket(data: TicketData): Promise<Buffer> {
    // Canvas dimensions
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // White ticket area
    const ticketX = 40;
    const ticketY = 40;
    const ticketWidth = width - 80;
    const ticketHeight = height - 80;
    
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.roundRect(ticketX, ticketY, ticketWidth, ticketHeight, 15);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Header
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('🎟️ EventHub Ticket', ticketX + 30, ticketY + 50);

    // Divider line
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ticketX + 30, ticketY + 70);
    ctx.lineTo(ticketX + ticketWidth - 30, ticketY + 70);
    ctx.stroke();

    // Event name
    ctx.fillStyle = '#333';
    ctx.font = 'bold 28px Arial';
    const eventNameY = ticketY + 110;
    ctx.fillText(this.truncateText(ctx, data.eventName, ticketWidth - 260), ticketX + 30, eventNameY);

    // Event details
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666';
    
    // Date icon and text
    ctx.fillText('📅', ticketX + 30, eventNameY + 40);
    ctx.fillText(data.eventDate, ticketX + 60, eventNameY + 40);
    
    // Location icon and text
    ctx.fillText('📍', ticketX + 30, eventNameY + 70);
    ctx.fillText(this.truncateText(ctx, data.eventLocation, ticketWidth - 260), ticketX + 60, eventNameY + 70);
    
    // Ticket type
    ctx.fillText('🎫', ticketX + 30, eventNameY + 100);
    ctx.fillText(\`\${data.ticketType} x\${data.quantity}\`, ticketX + 60, eventNameY + 100);

    // Attendee name
    ctx.fillText('👤', ticketX + 30, eventNameY + 130);
    ctx.fillText(data.attendeeName, ticketX + 60, eventNameY + 130);

    // QR Code
    const qrCodeSize = 120;
    const qrCodeX = ticketX + ticketWidth - qrCodeSize - 30;
    const qrCodeY = ticketY + 90;
    
    const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeData, {
      width: qrCodeSize,
      margin: 0,
      color: {
        dark: '#667eea',
        light: '#ffffff',
      },
    });
    
    const qrImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrImage, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // Transaction ID at bottom
    ctx.font = '14px Arial';
    ctx.fillStyle = '#999';
    ctx.fillText(\`Transaction ID: #\${data.transactionId}\`, ticketX + 30, ticketY + ticketHeight - 20);

    // Scan instruction
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText('Scan at entrance', qrCodeX + qrCodeSize / 2, qrCodeY + qrCodeSize + 20);
    ctx.textAlign = 'left';

    // Convert to buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  }

  private truncateText(ctx: any, text: string, maxWidth: number): string {
    let width = ctx.measureText(text).width;
    if (width <= maxWidth) return text;
    
    while (width > maxWidth && text.length > 0) {
      text = text.slice(0, -1);
      width = ctx.measureText(text + '...').width;
    }
    return text + '...';
  }
}

export default new TicketGeneratorService();
```

---

### Step 4: Update User Controller for Email Verification

Add to `/api/src/controllers/user.controller.ts`:

```typescript
import emailService from '../services/email.service';
import crypto from 'crypto';

// Register with email verification
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Create user (existing logic)
    // ...

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to user (you'll need to add these fields to your schema)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry: tokenExpiry,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken, firstName);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists, a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry,
      },
    });

    await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

    res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request failed' });
  }
};
```

---

### Step 5: Update Transaction Controller for Ticket Emails

Add to `/api/src/controllers/transaction.controller.ts`:

```typescript
import emailService from '../services/email.service';
import ticketGeneratorService from '../services/ticketGenerator.service';

// Confirm payment and send ticket
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { status: 'DONE' },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
      },
    });

    // Generate QR code data
    const qrCodeData = JSON.stringify({
      transactionId: transaction.id,
      userId: transaction.user.id,
      eventId: transaction.event.id,
      verificationCode: crypto.randomBytes(16).toString('hex'),
    });

    // Generate ticket image
    const ticketImage = await ticketGeneratorService.generateTicket({
      transactionId: transaction.id,
      eventName: transaction.event.name,
      eventDate: new Date(transaction.event.startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      eventLocation: \`\${transaction.event.location} - \${transaction.event.address}\`,
      ticketType: transaction.tickets[0]?.ticket.name || 'General Admission',
      attendeeName: \`\${transaction.user.firstName} \${transaction.user.lastName}\`,
      quantity: transaction.tickets.reduce((sum, t) => sum + t.quantity, 0),
      qrCodeData,
    });

    // Send ticket email
    await emailService.sendTicketEmail(
      transaction.user.email,
      transaction.user.firstName,
      transaction,
      transaction.event,
      ticketImage
    );

    res.json({
      success: true,
      message: 'Payment confirmed and ticket sent to email',
      data: transaction,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
};
```

---

## 📝 Update Prisma Schema

Add these fields to your `User` model in `schema.prisma`:

```prisma
model User {
  // ...existing fields...
  
  // Email verification
  verificationToken String?  @map("verification_token")
  verificationExpiry DateTime? @map("verification_expiry")
  
  // Update existing fields if they don't match
  resetToken   String?  @map("reset_token")
  resetExpiry  DateTime? @map("reset_expiry")
  
  // ...rest of model...
}
```

Then run:
```bash
npx prisma migrate dev --name add_email_verification
```

---

## 🎨 Example Outputs

### 1. Email Verification Email
- Professional gradient header
- Clear call-to-action button
- Expiration notice
- Security message

### 2. Password Reset Email  
- Security warning box
- One-click reset button
- 1-hour expiration
- Reassurance message

### 3. Ticket Purchase Email
- Purchase confirmation
- Event details summary
- Transaction information
- JPG ticket attachment
- Beautiful ticket design with:
  - Gradient background
  - Event information
  - QR code for scanning
  - Transaction ID
  - Professional branding

---

## 🔐 Security Best Practices

1. **Use App Passwords** (not regular Gmail password)
2. **Use HTTPS** in production
3. **Validate tokens** before processing
4. **Expire tokens** after use
5. **Rate limit** password reset requests
6. **Don't reveal** if email exists in system
7. **Log** all email sending attempts
8. **Encrypt** sensitive data in QR codes

---

## 🚀 Testing

Test your email system:

```typescript
// Test verification email
await emailService.sendVerificationEmail(
  'user@example.com',
  'test-token-123',
  'John'
);

// Test password reset
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'reset-token-456',
  'John'
);
```

---

## 📱 Next Steps

1. ✅ Install required packages
2. ✅ Configure environment variables
3. ✅ Create email service
4. ✅ Create ticket generator service
5. ✅ Update controllers
6. ✅ Update Prisma schema
7. ✅ Test all email flows
8. 🎯 Deploy and monitor

---

## 🛠️ Troubleshooting

**Emails not sending?**
- Check SMTP credentials
- Verify firewall settings
- Check spam folder
- Enable less secure apps (Gmail)
- Use app password instead of regular password

**Images not generating?**
- Install canvas dependencies: `npm install canvas`
- On Mac: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- On Ubuntu: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

---

Your email system is now ready! 🎉
