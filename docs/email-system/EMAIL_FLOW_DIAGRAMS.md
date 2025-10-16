# EventHub Email System - Visual Flow Diagrams

## 📧 Email Verification Flow

```
┌─────────────┐
│   User      │
│ Registers   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/register            │
│  {email, password, firstName, ...}  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Create user account             │
│  2. Generate JWT token (24h)        │
│  3. Call emailService               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  📧 Send Verification Email         │
│  To: user@example.com               │
│  Subject: Verify Your Email 📧      │
│  Body: Welcome! Click to verify     │
│  Link: /verify-email?token=xxx      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  User receives email                │
│  Clicks "Verify Email Address"      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/verify-email        │
│  {token: "jwt-token-here"}          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Verify JWT token                │
│  2. Update user.isVerified = true   │
│  3. Return success                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   User      │
│  Verified!  │
│     ✅      │
└─────────────┘
```

---

## 🔑 Password Reset Flow

```
┌─────────────┐
│   User      │
│   Forgets   │
│  Password   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/forgot-password     │
│  {email: "user@example.com"}        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Find user by email              │
│  2. Generate random token (32-byte) │
│  3. Save token with 1h expiry       │
│  4. Call emailService               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  📧 Send Password Reset Email       │
│  To: user@example.com               │
│  Subject: Reset Your Password 🔑    │
│  Body: Click to reset password      │
│  Link: /reset-password?token=xxx    │
│  Expiry: 1 hour                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  User receives email                │
│  Clicks "Reset Password"            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  User enters new password           │
│  POST /api/auth/reset-password      │
│  {token: "xxx", newPassword: "yyy"} │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Validate token & expiry         │
│  2. Hash new password               │
│  3. Update user.password            │
│  4. Clear resetToken & resetExpiry  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Password   │
│   Reset!    │
│     ✅      │
└─────────────┘
```

---

## 🎫 Ticket Purchase & Email Flow

```
┌─────────────┐
│   User      │
│   Selects   │
│   Tickets   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/transactions             │
│  {eventId, tickets, coupon, points} │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Validate tickets available      │
│  2. Calculate total with discounts  │
│  3. Create transaction              │
│  4. Status: WAITING_FOR_PAYMENT     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  User uploads payment proof         │
│  POST /api/transactions/:id/        │
│       payment-proof                 │
│  FormData: {paymentProof: file}     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Save payment proof image        │
│  2. Update status:                  │
│     WAITING_FOR_ADMIN_CONFIRMATION  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Organizer reviews payment proof    │
│  PATCH /api/transactions/:id/       │
│        confirm                      │
│  {status: "DONE"}                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Update transaction.status=DONE  │
│  2. Create attendee records         │
│  3. Generate QR code data           │
│  4. Call ticketGenerator            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Ticket Generator Service:          │
│  1. Create 1200x600 canvas          │
│  2. Draw gradient background        │
│  3. Generate QR code (280x280)      │
│  4. Draw event details              │
│  5. Draw attendee info              │
│  6. Export as JPG buffer            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Email Service:                     │
│  1. Build HTML template             │
│  2. Format currency & dates         │
│  3. Attach ticket JPG               │
│  4. Send via SMTP                   │
└──────┬──────────────────────────────┘
       │
       ├─────────┬─────────┐
       │         │         │
       ▼         ▼         ▼
   ┌──────┐  ┌──────┐  ┌──────────┐
   │📧 #1 │  │📧 #2 │  │   📱     │
   │Ticket│  │ Pay  │  │Notific.  │
   │Email │  │Conf. │  │  in App  │
   └──────┘  └──────┘  └──────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  User receives:                     │
│  ✅ Ticket email with JPG           │
│  ✅ Payment confirmation            │
│  ✅ In-app notification             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   User      │
│  Downloads  │
│   Ticket    │
│     JPG     │
│     🎫      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Event     │
│     Day     │
│   Scans QR  │
│     ✅      │
└─────────────┘
```

---

## 🎨 Ticket Image Generation Process

```
┌─────────────────────────────────────┐
│  Input Data:                        │
│  - transactionId: 12345             │
│  - eventName: "Music Festival"      │
│  - eventDate: "2025-12-31"          │
│  - location: "Jakarta Expo"         │
│  - attendeeName: "John Doe"         │
│  - qrCodeData: JSON string          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 1: Create Canvas              │
│  Width: 1200px                      │
│  Height: 600px                      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 2: Draw Background            │
│  Gradient: #667eea → #764ba2        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 3: Draw White Card            │
│  Rounded corners, shadow            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 4: Draw Left Section          │
│  Purple gradient overlay            │
│  "EventHub" logo text               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 5: Generate QR Code           │
│  Data: {tid, email, timestamp}      │
│  Size: 280x280px                    │
│  Draw at position (80, 180)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 6: Draw Event Details         │
│  📅 Date & Time                      │
│  📍 Location                         │
│  🎫 Ticket Type                      │
│  👤 Attendee Name                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 7: Add Decorative Elements    │
│  - Perforated edge                  │
│  - Corner decorations               │
│  - Transaction ID                   │
│  - Instructions                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Step 8: Export to JPG              │
│  Quality: 95%                       │
│  Format: Buffer                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Output: ticket-buffer.jpg          │
│  Size: ~150-250 KB                  │
│  Ready to attach to email!          │
└─────────────────────────────────────┘
```

---

## 📊 Email System Architecture

```
┌──────────────────────────────────────────────────────┐
│                   EventHub API                        │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │            Controllers                         │  │
│  │  ┌──────────────┐    ┌────────────────────┐   │  │
│  │  │    Auth      │    │    Transaction     │   │  │
│  │  │  Controller  │    │     Controller     │   │  │
│  │  └──────┬───────┘    └─────────┬──────────┘   │  │
│  └─────────┼──────────────────────┼──────────────┘  │
│            │                      │                  │
│            │  Calls               │  Calls           │
│            ▼                      ▼                  │
│  ┌─────────────────────────────────────────────┐    │
│  │              Services                       │    │
│  │  ┌───────────────┐  ┌──────────────────┐   │    │
│  │  │ Email Service │  │ Ticket Generator │   │    │
│  │  │               │  │     Service      │   │    │
│  │  │ - Templates   │  │ - Canvas         │   │    │
│  │  │ - SMTP        │  │ - QR Code        │   │    │
│  │  │ - Nodemailer  │  │ - Image Export   │   │    │
│  │  └───────┬───────┘  └────────┬─────────┘   │    │
│  └──────────┼────────────────────┼─────────────┘    │
│             │                    │                   │
│             │  Uses              │  Generates        │
│             ▼                    ▼                   │
│  ┌──────────────────────────────────────────────┐   │
│  │           External Services                  │   │
│  │  ┌──────────────┐    ┌──────────────────┐   │   │
│  │  │ SMTP Server  │    │  Image Buffer    │   │   │
│  │  │ (Gmail/etc)  │◄───│  (JPG Ticket)    │   │   │
│  │  └──────┬───────┘    └──────────────────┘   │   │
│  └─────────┼──────────────────────────────────┘    │
└────────────┼─────────────────────────────────────┘
             │
             │  Sends Email
             ▼
        ┌─────────┐
        │  User   │
        │  Inbox  │
        │   📧    │
        └─────────┘
```

---

## 🔄 Transaction Status Flow

```
Transaction Created
       │
       ▼
┌──────────────────┐
│ WAITING_FOR_     │  ← User creates transaction
│    PAYMENT       │
└────────┬─────────┘
         │
         │  User uploads payment proof
         ▼
┌──────────────────┐
│ WAITING_FOR_     │  ← Waiting for organizer
│ ADMIN_CONFIRM    │
└────────┬─────────┘
         │
         ├─────────┬─────────┐
         │         │         │
    Approved   Rejected   Expired
         │         │         │
         ▼         ▼         ▼
    ┌──────┐  ┌────────┐  ┌────────┐
    │ DONE │  │REJECTED│  │EXPIRED │
    └──┬───┘  └───┬────┘  └────────┘
       │          │
       │          │  Refund:
       │          │  - Points
       │          │  - Coupon
       │          │  - Tickets
       │          │
       │  Sends:  │
       │  📧 Ticket Email
       │  📧 Confirmation
       │  📱 Notification
       │  🎫 JPG Attachment
       │
       ▼
   User receives
   complete ticket
       ✅
```

---

## 📧 Email Template Structure

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │     Header (Purple Gradient)      │  │
│  │                                   │  │
│  │        🎉 Title Here              │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Content (White Background)    │  │
│  │                                   │  │
│  │  Hi {firstName},                  │  │
│  │                                   │  │
│  │  [Message content here...]        │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Button (Gradient Hover)   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Plain text link fallback         │  │
│  │                                   │  │
│  │  [Additional info boxes...]       │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Footer (Gray Background)      │  │
│  │                                   │  │
│  │  © 2025 EventHub                  │  │
│  │  This is an automated email       │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎫 Ticket JPG Layout

```
┌──────────────────────────────────────────────────────────────┐
│                  [Purple Gradient Background]                │
│                                                              │
│  ┌─────────────────┬──────────────────────────────────────┐  │
│  │                 │                                      │  │
│  │   EventHub      │   Amazing Music Festival 2025        │  │
│  │   ─────────     │   ────────────────────────────────   │  │
│  │                 │                                      │  │
│  │  ┌───────────┐  │   📅 Date & Time                     │  │
│  │  │           │  │   Wed, Dec 31, 2025, 08:00 PM       │  │
│  │  │  ███████  │  │                                      │  │
│  │  │  ███████  │  │   📍 Location                        │  │
│  │  │  ███████  │  │   Jakarta International Expo        │  │
│  │  │  ███████  │  │                                      │  │
│  │  │  QR CODE  │  │   🏠 Address                         │  │
│  │  │  280x280  │  │   Jl. Gatot Subroto, Jakarta        │  │
│  │  │  ███████  │  │                                      │  │
│  │  │  ███████  │  │   🎫 Ticket Type                     │  │
│  │  │  ███████  │  │   VIP Access                         │  │
│  │  │  ███████  │  │                                      │  │
│  │  └───────────┘  │   👤 Attendee                        │  │
│  │                 │   John Doe                           │  │
│  │  ○ ○ ○ ○ ○ ○   │                                      │  │
│  │  (Perforated)   │   ┌──────────────────────────────┐   │  │
│  │                 │   │  Transaction #12345          │   │  │
│  │                 │   │  Scan QR at entrance         │   │  │
│  │                 │   └──────────────────────────────┘   │  │
│  │                 │                                      │  │
│  └─────────────────┴──────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
    1200px × 600px - Purple Gradient - QR Code - Event Info
```

---

**🎉 This completes the visual reference for the EventHub email system!**
