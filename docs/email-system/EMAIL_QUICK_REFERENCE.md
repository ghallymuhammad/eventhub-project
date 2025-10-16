# EventHub Email System - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Environment Setup
```bash
cd api
cp .env.example .env
```

Edit `.env`:
```env
AUTH_JWT_SECRET=your-secret-key-here
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Get Gmail App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first
3. Generate app password for "Mail"
4. Copy 16-character password to `.env`

### 3. Start Server
```bash
npm run dev
```

Look for: `✅ Email service is ready to send messages`

---

## 📧 Email Types

| Email | Trigger | Contains |
|-------|---------|----------|
| **Verification** | User registers | Welcome message + verify link (24h expiry) |
| **Password Reset** | User requests reset | Reset link + security warnings (1h expiry) |
| **Ticket** | Payment confirmed | Event details + JPG ticket with QR code |
| **Payment Confirmation** | Payment confirmed | Success message + transaction link |

---

## 🔑 API Endpoints

### Auth
```bash
# Register (sends verification email)
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Verify email
POST /api/auth/verify-email
{ "token": "token-from-email" }

# Request password reset (sends reset email)
POST /api/auth/forgot-password
{ "email": "user@example.com" }

# Reset password
POST /api/auth/reset-password
{
  "token": "token-from-email",
  "newPassword": "newPassword123"
}
```

### Transactions
```bash
# Create transaction
POST /api/transactions
Headers: { Authorization: "Bearer YOUR_JWT_TOKEN" }
{
  "eventId": 1,
  "tickets": [
    { "ticketId": 1, "quantity": 2 }
  ],
  "couponCode": "WELCOME-XXXX",
  "pointsUsed": 0
}

# Upload payment proof
POST /api/transactions/:id/payment-proof
Headers: { Authorization: "Bearer YOUR_JWT_TOKEN" }
Form-Data: { paymentProof: <image-file> }

# Confirm payment (organizer - sends ticket email)
PATCH /api/transactions/:id/confirm
Headers: { Authorization: "Bearer ORGANIZER_JWT_TOKEN" }
{ "status": "DONE" }
```

---

## 🎫 Ticket Email Features

**Automatically sent when organizer confirms payment**

### Email Content:
- ✅ Event name, date, location, address
- ✅ Transaction ID and total amount
- ✅ Payment status
- ✅ Check-in instructions

### JPG Attachment:
- ✅ 1200x600px beautiful ticket design
- ✅ QR code (280x280px) for scanning
- ✅ Purple gradient branding
- ✅ Event details
- ✅ Attendee name
- ✅ Transaction ID
- ✅ Perforated edge effect

---

## 🧪 Testing Checklist

```bash
# 1. Test Email Verification
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
# ✅ Check inbox for verification email

# 2. Test Password Reset
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com" }'
# ✅ Check inbox for reset email

# 3. Test Ticket Email
# - Create event and tickets (as organizer)
# - Create transaction (as user)
# - Upload payment proof
# - Confirm payment (as organizer)
# ✅ Check inbox for ticket email with JPG attachment
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Email service connection error" | Check SMTP credentials in `.env` |
| Emails go to spam | Use Gmail App Password, not regular password |
| "Authorization header missing" | Include `Authorization: Bearer <token>` header |
| Ticket image not attached | Check console for Canvas errors, reinstall if needed |
| Port 587 blocked | Try port 465 with `SMTP_SECURE=true` |

---

## 📁 Key Files

```
api/src/
├── services/
│   ├── email.service.ts          ← Email templates & sending
│   └── ticketGenerator.service.ts ← Ticket JPG generation
├── controllers/
│   ├── auth.controller.ts         ← Registration, login, password reset
│   └── transaction.controller.ts  ← Transaction & payment confirmation
└── routes/
    ├── auth.route.ts             ← /api/auth/*
    └── transaction.route.ts      ← /api/transactions/*
```

---

## 🌟 Quick Demo Flow

1. **User Registers**
   - POST /api/auth/register
   - ✉️ Receives verification email
   - Clicks link → verified!

2. **User Forgets Password**
   - POST /api/auth/forgot-password
   - ✉️ Receives reset email
   - Clicks link → enters new password → reset!

3. **User Buys Ticket**
   - POST /api/transactions (create)
   - POST /api/transactions/:id/payment-proof (upload)
   - Organizer: PATCH /api/transactions/:id/confirm
   - ✉️ User receives:
     - Payment confirmation email
     - Ticket email with JPG attachment 🎫

---

## 📧 Email Providers

### Development (Free)
- **Gmail** (100/day) - Use app password
- **Mailtrap** - Catches all emails for testing

### Production
- **SendGrid** - 100/day free, then paid
- **Mailgun** - Flexible pricing
- **Amazon SES** - Very low cost
- **Postmark** - Best for transactional emails

---

## 🎨 Customize Email Templates

Edit `api/src/services/email.service.ts`:

```typescript
async sendVerificationEmail(email, token, firstName) {
  const html = `
    <!-- Your custom HTML here -->
    <h1>Welcome ${firstName}!</h1>
    <!-- Modify colors, text, layout -->
  `;
  // ...
}
```

All templates use inline CSS for compatibility.

---

## ✅ Production Checklist

- [ ] `.env` configured with production values
- [ ] SMTP service set up (SendGrid/Mailgun/etc)
- [ ] `NEXT_PUBLIC_BASE_URL` set to production domain
- [ ] Email templates reviewed and tested
- [ ] SPF/DKIM/DMARC records configured
- [ ] Error logging enabled
- [ ] Rate limiting added (optional)

---

**🎉 Ready to send beautiful emails!**

For full details, see: `EMAIL_IMPLEMENTATION_GUIDE.md`
