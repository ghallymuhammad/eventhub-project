# EventHub Email System - Complete Implementation Guide

## 🎉 Overview

The EventHub email notification system is fully implemented with the following features:
- ✅ User email verification on registration
- ✅ Password reset emails with secure tokens
- ✅ Ticket confirmation emails with JPG attachments
- ✅ Payment confirmation notifications
- ✅ Beautiful HTML email templates
- ✅ QR code generation for tickets
- ✅ Ticket image generation with Canvas

## 📁 File Structure

```
api/src/
├── services/
│   ├── email.service.ts          # Email sending logic with Nodemailer
│   └── ticketGenerator.service.ts # Ticket JPG generation with Canvas & QR codes
├── controllers/
│   ├── auth.controller.ts         # Authentication with email verification
│   └── transaction.controller.ts  # Transaction processing with ticket emails
├── routes/
│   ├── auth.route.ts             # Auth API routes
│   └── transaction.route.ts      # Transaction API routes
├── validations/
│   └── auth.validation.ts        # Request validation schemas
└── middlewares/
    └── auth.middleware.ts        # JWT verification middleware
```

## 🚀 Quick Start

### 1. Install Dependencies

All required packages are already installed:
- `nodemailer` - Email sending
- `canvas` - Image generation
- `qrcode` - QR code generation
- `@types/nodemailer` & `@types/qrcode` - TypeScript types

### 2. Environment Setup

Create a `.env` file in the `api` directory (use `.env.example` as a template):

```bash
cp .env.example .env
```

Configure the following variables:

```env
# JWT Secret
AUTH_JWT_SECRET=your-super-secret-jwt-key-change-in-production

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_NAME=EventHub
SMTP_FROM_EMAIL=your-email@gmail.com

# Frontend URL for email links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Gmail Setup (Recommended for Development)

To use Gmail as your SMTP server:

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as your `SMTP_PASSWORD` in `.env`

3. **Update .env:**
   ```env
   SMTP_USER=youremail@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=youremail@gmail.com
   ```

## 📧 Email Features

### 1. Email Verification

**Trigger:** User registration
**Template:** Beautiful gradient welcome email with verification link
**Expiry:** 24 hours

```typescript
// Sent automatically on registration
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Email includes:**
- Welcome message
- Verification button
- Plain text link fallback
- 24-hour expiry warning

### 2. Password Reset

**Trigger:** User requests password reset
**Template:** Security-focused email with reset link
**Expiry:** 1 hour

```typescript
// Request reset
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

// Reset password
POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Email includes:**
- Reset button
- Plain text link fallback
- Security warnings
- 1-hour expiry notice

### 3. Ticket Confirmation

**Trigger:** Organizer confirms payment
**Template:** Celebratory email with ticket details and JPG attachment
**Attachment:** Beautiful ticket image with QR code

```typescript
// Organizer confirms payment
PATCH /api/transactions/:transactionId/confirm
{
  "status": "DONE"
}
```

**Email includes:**
- Event details (name, date, location, address)
- Purchase details (transaction ID, amount, status)
- Attached ticket JPG with:
  - QR code for event check-in
  - Event information
  - Attendee details
  - Beautiful gradient design
  - Perforated edge effect
- Instructions for event entry

### 4. Payment Confirmation

**Trigger:** Organizer confirms payment (sent alongside ticket email)
**Template:** Confirmation notification with transaction link

**Email includes:**
- Confirmation message
- Event name
- Transaction ID
- Link to view transaction details

## 🎫 Ticket Image Generation

The ticket generator creates beautiful JPG images with:

### Visual Design
- ✅ 1200x600px canvas
- ✅ Purple gradient background (#667eea → #764ba2)
- ✅ White rounded card with shadow
- ✅ Left section with QR code (280x280px)
- ✅ Right section with event details
- ✅ Perforated edge effect between sections
- ✅ EventHub branding
- ✅ Transaction ID and instructions

### QR Code
- Contains encrypted transaction data
- Scannable at event entrance
- Includes transaction ID and attendee email
- High-quality rendering

### Information Included
- Event name (truncated if too long)
- Date & time (formatted)
- Location and address
- Ticket type
- Attendee name
- Transaction ID
- Check-in instructions

## 🔄 Complete User Flows

### Flow 1: User Registration
```
1. User submits registration → POST /api/auth/register
2. System creates user account
3. System generates verification token (JWT, 24h expiry)
4. System sends verification email
5. User clicks verification link in email
6. Frontend calls → POST /api/auth/verify-email with token
7. System marks user as verified
8. User can now book tickets
```

### Flow 2: Password Reset
```
1. User requests reset → POST /api/auth/forgot-password
2. System generates reset token (32-byte random, 1h expiry)
3. System saves token to user record
4. System sends reset email
5. User clicks reset link in email
6. Frontend displays reset form
7. User submits new password → POST /api/auth/reset-password
8. System validates token and updates password
9. Token is cleared from database
```

### Flow 3: Ticket Purchase
```
1. User creates transaction → POST /api/transactions
   - Selects event and tickets
   - Applies coupon/points if available
2. System calculates final amount
3. System creates transaction (WAITING_FOR_PAYMENT status)
4. User uploads payment proof → POST /api/transactions/:id/payment-proof
5. System updates status to WAITING_FOR_ADMIN_CONFIRMATION
6. Organizer reviews payment
7. Organizer confirms → PATCH /api/transactions/:id/confirm { status: "DONE" }
8. System:
   - Updates transaction to DONE
   - Creates attendee records
   - Generates ticket JPG with QR code
   - Sends ticket email with JPG attachment
   - Sends payment confirmation email
   - Creates notification for user
```

## 🛠️ API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user + send verification
POST   /api/auth/verify-email      # Verify email with token
POST   /api/auth/login             # Login
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
GET    /api/auth/profile           # Get current user (requires auth)
```

### Transactions
```
POST   /api/transactions                        # Create transaction
POST   /api/transactions/:id/payment-proof      # Upload payment proof
PATCH  /api/transactions/:id/confirm            # Confirm/reject payment (organizer)
GET    /api/transactions                        # Get user transactions
GET    /api/transactions/:id                    # Get transaction details
```

## 🧪 Testing the Email System

### Local Testing with Gmail

1. **Setup Gmail App Password** (see Gmail Setup above)

2. **Update .env with your credentials**

3. **Test Email Verification:**
   ```bash
   # Register a user
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   
   # Check your email inbox for verification link
   ```

4. **Test Password Reset:**
   ```bash
   # Request reset
   curl -X POST http://localhost:8000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com"
     }'
   
   # Check your email for reset link
   ```

5. **Test Ticket Email:**
   - Create a transaction
   - Upload payment proof
   - As organizer, confirm the payment
   - Check email for ticket with JPG attachment

### Using Mailtrap (Alternative for Testing)

For safer testing without sending real emails:

1. **Sign up at https://mailtrap.io**

2. **Get SMTP credentials from your inbox**

3. **Update .env:**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-mailtrap-username
   SMTP_PASSWORD=your-mailtrap-password
   ```

4. **All emails will appear in Mailtrap dashboard**

## 📝 Email Template Customization

All email templates are in `api/src/services/email.service.ts`. Each template includes:

- Inline CSS for maximum email client compatibility
- Responsive design
- Mobile-friendly
- Professional gradient branding
- Clear call-to-action buttons
- Plain text link fallbacks
- Footer with company info

To customize:
1. Open `email.service.ts`
2. Find the email method (e.g., `sendVerificationEmail`)
3. Modify the HTML template string
4. Test with different email clients

## 🔒 Security Best Practices

The implementation includes:

✅ **JWT tokens** for email verification (24h expiry)
✅ **Random tokens** for password reset (1h expiry)
✅ **Secure token storage** in database
✅ **Token cleanup** after use
✅ **Email privacy** (no user existence disclosure)
✅ **QR code data** includes timestamp for validation
✅ **Rate limiting** can be added to prevent abuse

## 🚀 Production Deployment

### 1. Use Production SMTP Service

Recommended providers:
- **SendGrid** (100 emails/day free)
- **Mailgun** (flexible pricing)
- **Amazon SES** (very low cost)
- **Postmark** (reliable, great for transactional emails)

### 2. Update Environment Variables

```env
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Configure DNS (SPF, DKIM, DMARC)

For better deliverability, set up:
- SPF record
- DKIM signing
- DMARC policy

Your email provider will provide instructions.

### 4. Monitor Email Delivery

- Check bounce rates
- Monitor spam complaints
- Track open rates (if needed)
- Set up email logs

## 📊 Database Schema

### User Model
```typescript
{
  email: string          // Unique, used for emails
  firstName: string      // Used in email personalization
  lastName: string       // Used in email personalization
  isVerified: boolean    // Email verification status
  resetToken: string?    // Password reset token
  resetExpiry: DateTime? // Token expiration
}
```

### Transaction Model
```typescript
{
  status: TransactionStatus  // WAITING_FOR_PAYMENT → WAITING_FOR_ADMIN_CONFIRMATION → DONE
  finalAmount: number        // Total paid
  paymentProof: string?      // Uploaded proof image
}
```

### Attendee Model
```typescript
{
  transactionId: number   // Link to transaction
  eventId: number         // Link to event
  userId: number          // Link to user
  ticketType: string      // Type of ticket
  quantity: number        // Number of tickets
  totalPaid: number       // Amount paid
}
```

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials**
   ```bash
   # Test in terminal
   cd api
   node -e "console.log(process.env.SMTP_USER)"
   ```

2. **Check email service logs**
   - Look for "✅ Email service is ready" in console
   - Look for "📧 Email sent successfully" after actions

3. **Gmail "Less secure apps" error**
   - Use App Password, not regular password
   - Enable 2-Step Verification first

4. **Port blocked**
   - Try port 465 (SSL) instead of 587 (TLS)
   - Set `SMTP_SECURE=true` for port 465

### Ticket Images Not Generating

1. **Canvas installation issues**
   ```bash
   # Reinstall canvas
   npm uninstall canvas
   npm install canvas --legacy-peer-deps
   ```

2. **Missing fonts**
   - Canvas uses Arial by default (available on most systems)
   - For custom fonts, use `registerFont()` in ticket generator

### Email Goes to Spam

1. **Set up SPF/DKIM/DMARC** (production only)
2. **Use verified sender domain**
3. **Avoid spam trigger words** in subject/body
4. **Include unsubscribe link** (for marketing emails)
5. **Warm up IP address** gradually

## ✅ Checklist for Go-Live

- [ ] Environment variables configured
- [ ] SMTP credentials tested
- [ ] Email verification flow tested
- [ ] Password reset flow tested  
- [ ] Ticket purchase + email tested
- [ ] Ticket JPG attachment opens correctly
- [ ] QR codes scan properly
- [ ] All email templates reviewed
- [ ] Production SMTP service configured
- [ ] DNS records configured (SPF/DKIM/DMARC)
- [ ] Error handling tested
- [ ] Rate limiting added (optional)

## 📞 Support

For issues or questions:
1. Check server logs for email service errors
2. Verify SMTP credentials are correct
3. Test with Mailtrap first
4. Check email provider documentation
5. Review Nodemailer docs: https://nodemailer.com

---

**🎉 Your EventHub email system is production-ready!**
