# 🎉 EventHub Email System Setup

## Quick Start Guide

### 1. Install Dependencies ✅
Already installed! The following packages are ready:
- `nodemailer` - Email sending
- `canvas` - Ticket image generation
- `qrcode` - QR code generation

### 2. Configure Environment Variables

Copy the example file:
```bash
cd api
cp .env.example .env
```

Edit `.env` and add your email credentials:
```env
# JWT Secret (required)
AUTH_JWT_SECRET=your-super-secret-key-here

# Gmail SMTP (recommended for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_NAME=EventHub
SMTP_FROM_EMAIL=your-email@gmail.com

# Frontend URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Get Gmail App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification (if not already enabled)
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)" → Type "EventHub"
5. Click "Generate"
6. Copy the 16-character password
7. Paste into `.env` as `SMTP_PASSWORD`

### 4. Start the Server

```bash
npm run dev
```

Look for this message in the console:
```
✅ Email service is ready to send messages
```

### 5. Test the Email System

#### Option A: Use the Test Script
```bash
# Set your test email in .env
echo "TEST_EMAIL=your-email@gmail.com" >> .env

# Run the test
npx ts-node src/tests/test-email.ts
```

You should receive 4 test emails:
1. ✅ Verification email
2. ✅ Password reset email
3. ✅ Ticket email with JPG attachment
4. ✅ Payment confirmation email

#### Option B: Manual API Testing
```bash
# Test registration (sends verification email)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Check your inbox for verification email!
```

---

## 📧 Email Features Implemented

| Feature | Status | Email Sent |
|---------|--------|------------|
| User Registration | ✅ Ready | Verification email with 24h link |
| Email Verification | ✅ Ready | - |
| Password Reset Request | ✅ Ready | Reset email with 1h link |
| Password Reset Confirmation | ✅ Ready | - |
| Ticket Purchase | ✅ Ready | Ticket email + JPG with QR code |
| Payment Confirmation | ✅ Ready | Confirmation email |

---

## 🎫 Ticket Email Highlights

When an organizer confirms a payment, the user receives:

**Email 1: Ticket Confirmation**
- 📧 Beautiful HTML email
- 📎 **Attached JPG ticket (1200x600px)**
  - QR code for event check-in
  - Event details (name, date, location, address)
  - Attendee name
  - Transaction ID
  - Professional purple gradient design
- 📝 Event and purchase details
- 📋 Check-in instructions

**Email 2: Payment Confirmation**
- 📧 Success notification
- 🔗 Link to view transaction

---

## 🔧 Troubleshooting

### "Email service connection error"
- Check SMTP credentials in `.env`
- Ensure Gmail App Password is correct (not regular password)
- Verify 2-Step Verification is enabled on Gmail

### "Authorization header missing"
- You need to login first and get a JWT token
- Include `Authorization: Bearer <token>` in request headers

### Emails go to spam
- Use Gmail App Password (not regular password)
- For production, use SendGrid/Mailgun with proper DNS setup

### Canvas installation issues
```bash
npm uninstall canvas
npm install canvas --legacy-peer-deps
```

---

## 📁 Key Files Created

```
api/
├── .env.example                           # Environment template
├── src/
│   ├── services/
│   │   ├── email.service.ts              # ✨ Email sending with templates
│   │   └── ticketGenerator.service.ts    # ✨ JPG ticket generation
│   ├── controllers/
│   │   ├── auth.controller.ts            # ✨ Auth with email verification
│   │   └── transaction.controller.ts     # ✨ Transactions with tickets
│   ├── routes/
│   │   ├── auth.route.ts                 # ✨ Auth endpoints
│   │   └── transaction.route.ts          # ✨ Transaction endpoints
│   ├── validations/
│   │   └── auth.validation.ts            # ✨ Updated with validators
│   ├── tests/
│   │   └── test-email.ts                 # ✨ Email test script
│   └── app.ts                            # ✨ Updated with new routes

Root Documentation:
├── EMAIL_IMPLEMENTATION_GUIDE.md          # ✨ Complete guide (detailed)
├── EMAIL_QUICK_REFERENCE.md               # ✨ Quick reference card
├── EMAIL_FEATURE_SUMMARY.md               # ✨ Feature summary
└── EMAIL_SETUP_README.md                  # ✨ This file
```

---

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register + send verification email
POST   /api/auth/verify-email      # Verify email with token
POST   /api/auth/login             # Login
POST   /api/auth/forgot-password   # Request password reset email
POST   /api/auth/reset-password    # Reset password with token
GET    /api/auth/profile           # Get current user (requires auth)
```

### Transactions
```
POST   /api/transactions                        # Create transaction
POST   /api/transactions/:id/payment-proof      # Upload payment proof
PATCH  /api/transactions/:id/confirm            # Confirm payment (sends ticket email)
GET    /api/transactions                        # Get user transactions
GET    /api/transactions/:id                    # Get transaction details
```

---

## 📖 Documentation

For more details, see:
- **Full Implementation Guide**: `EMAIL_IMPLEMENTATION_GUIDE.md`
- **Quick Reference**: `EMAIL_QUICK_REFERENCE.md`
- **Feature Summary**: `EMAIL_FEATURE_SUMMARY.md`

---

## ✅ Production Checklist

Before going live:
- [ ] Update `.env` with production SMTP credentials
- [ ] Use professional email service (SendGrid/Mailgun/SES)
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure SPF/DKIM/DMARC DNS records
- [ ] Test all email flows
- [ ] Check spam folder status
- [ ] Add rate limiting
- [ ] Set up email monitoring

---

## 🎉 You're All Set!

Your EventHub email notification system is ready to:
- ✅ Verify new user emails
- ✅ Send password reset links
- ✅ Deliver beautiful ticket images with QR codes
- ✅ Confirm payments

**Happy coding! 🚀**
