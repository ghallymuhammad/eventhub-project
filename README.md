# 🎉 EventHub - Event Management Platform

A modern, full-stack event management platform built with Next.js, Express, and Prisma. Features include event discovery, ticket purchasing, email notifications with QR code tickets, and a beautiful glassmorphism UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎫 Core Features
- 📅 **Event Management** - Create, browse, and manage events
- 🎟️ **Ticket System** - Multiple ticket types (VIP, Regular, Early Bird, Student)
- 💳 **Transaction Processing** - Secure payment with proof upload
- ⭐ **Review System** - Rate and review events
- 🎁 **Coupon & Promotions** - Discount codes and referral rewards
- 👥 **Referral System** - Earn points by referring friends

### 📧 Email Notifications
- ✅ Email verification on registration
- 🔑 Password reset with secure tokens
- 🎫 **Ticket delivery with JPG attachments** (with QR codes)
- 💌 Payment confirmation emails
- 🎨 Beautiful HTML templates with branding

### 🎨 Frontend
- 💎 Glassmorphism design
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast and optimized with Next.js 14
- 🎭 Smooth animations and transitions
- 🔍 Advanced search and filtering

### 🔧 Backend
- 🚀 RESTful API with Express
- 🗄️ SQLite/PostgreSQL with Prisma ORM
- 🔐 JWT authentication
- 📤 File upload for payment proofs
- 🎨 Image generation (Canvas) for tickets
- 📧 Email service (Nodemailer)

---

## 📚 Documentation

Complete documentation is available in the [`docs/`](./docs/) folder:

### 📖 Quick Links
- **[📚 Documentation Home](./docs/README.md)** - Complete documentation index
- **[📧 Email Setup](./docs/email-system/EMAIL_SETUP_README.md)** - Quick 5-minute email setup
- **[🎨 Frontend Guide](./docs/frontend/EVENT_DETAIL_PAGE.md)** - Event detail page documentation
- **[🗄️ Database ERD](./docs/database/database-erd.dbml)** - Database schema

### 📂 Documentation Structure
```
docs/
├── README.md                    # Documentation index
├── email-system/                # Email notification docs
│   ├── EMAIL_SETUP_README.md
│   ├── EMAIL_IMPLEMENTATION_GUIDE.md
│   ├── EMAIL_QUICK_REFERENCE.md
│   ├── EMAIL_FEATURE_SUMMARY.md
│   └── EMAIL_FLOW_DIAGRAMS.md
├── frontend/                    # Frontend/UI docs
│   ├── EVENT_DETAIL_PAGE.md
│   ├── EVENT_DETAIL_IMPLEMENTATION.md
│   ├── EVENT_DETAIL_COMPONENT_MAP.md
│   └── QUICK_REFERENCE.md
└── database/                    # Database docs
    └── database-erd.dbml
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gmail account (for email features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd eventhub-minpro
```

2. **Install dependencies**
```bash
# Install API dependencies
cd api
npm install

# Install Web dependencies
cd ../web
npm install
```

3. **Setup environment variables**

**API (.env)**
```bash
cd api
cp .env.example .env
```

Edit `api/.env`:
```env
# JWT
AUTH_JWT_SECRET=your-super-secret-key

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_NAME=EventHub
SMTP_FROM_EMAIL=your-email@gmail.com

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Get Gmail App Password:**
1. Visit https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification
3. Generate app password for "Mail"
4. Copy to `SMTP_PASSWORD`

4. **Setup database**
```bash
cd api
npm run migrate:dev
```

5. **Start development servers**

**Terminal 1 - API:**
```bash
cd api
npm run dev
# Server runs on http://localhost:8000
```

**Terminal 2 - Web:**
```bash
cd web
npm run dev
# Web runs on http://localhost:3000
```

6. **Test email system (optional)**
```bash
cd api
npx ts-node src/tests/test-email.ts
```

---

## 🏗️ Project Structure

```
eventhub-minpro/
├── api/                         # Backend API
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic (email, tickets)
│   │   ├── routes/              # API routes
│   │   ├── middlewares/         # Auth, validation, upload
│   │   ├── models/              # Type definitions
│   │   ├── libs/                # Utilities (prisma, jwt, bcrypt)
│   │   └── tests/               # Test scripts
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── package.json
│
├── web/                         # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                 # Pages and layouts
│   │   ├── components/          # React components
│   │   ├── libs/                # API utilities
│   │   └── config/              # Configuration
│   └── package.json
│
└── docs/                        # 📚 Documentation
    ├── email-system/
    ├── frontend/
    └── database/
```

---

## 🎯 Key Features Implementation

### 📧 Email System
The platform sends beautiful HTML emails with JPG ticket attachments:

```typescript
// Example: Send ticket email after payment confirmation
await emailService.sendTicketEmail(
  user.email,
  user.firstName,
  transaction,
  event,
  ticketImageBuffer  // 1200x600 JPG with QR code
);
```

**See full guide:** [Email Setup](./docs/email-system/EMAIL_SETUP_README.md)

### 🎫 Ticket Generation
Automatic generation of beautiful ticket images with QR codes:

```typescript
const ticketData = {
  transactionId: 12345,
  eventName: 'Music Festival 2025',
  eventDate: '2025-12-31',
  attendeeName: 'John Doe',
  // ... more fields
};

const ticketJPG = await ticketGenerator.generateTicket(ticketData);
```

**Output:** 1200x600px JPG with gradient design, QR code, and event details

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register + email verification
POST   /api/auth/verify-email      # Verify email
POST   /api/auth/login             # Login
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/profile           # Get user profile
```

### Transactions
```
POST   /api/transactions                    # Create transaction
POST   /api/transactions/:id/payment-proof  # Upload payment
PATCH  /api/transactions/:id/confirm        # Confirm payment
GET    /api/transactions                    # Get user transactions
GET    /api/transactions/:id                # Get transaction details
```

**Full API documentation coming soon!**

---

## 🧪 Testing

### Test Email System
```bash
cd api
npx ts-node src/tests/test-email.ts
```

You'll receive:
- ✅ Verification email
- ✅ Password reset email
- ✅ Ticket email with JPG attachment
- ✅ Payment confirmation email

### Manual Testing
```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Express** - Web framework
- **Prisma** - ORM
- **SQLite/PostgreSQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Canvas** - Image generation
- **QRCode** - QR code generation
- **Multer** - File uploads

---

## 🎨 Screenshots

### Landing Page
Beautiful glassmorphism design with animated hero section

### Event Detail Page
Comprehensive event information with ticket selection

### Email Examples
Professional HTML emails with ticket attachments

**See full visual guide:** [Component Map](./docs/frontend/EVENT_DETAIL_COMPONENT_MAP.md)

---

## 🤝 Contributing

### Workflow
1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push to branch: `git push origin feat/your-feature`
4. Create Pull Request
5. After review and approval, merge to main

### Commit Convention
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation
- `style(scope): description` - Formatting
- `refactor(scope): description` - Code restructuring
- `test(scope): description` - Tests
- `build(scope): description` - Build system

---

## 📝 License

MIT License - feel free to use this project for learning and development.

---

## 🙏 Acknowledgments

Built with ❤️ for Purwadhika 2025 Mini Project

---

## 📞 Support

- 📚 [Full Documentation](./docs/README.md)
- 📧 [Email Setup Guide](./docs/email-system/EMAIL_SETUP_README.md)
- 🎨 [Frontend Guide](./docs/frontend/EVENT_DETAIL_PAGE.md)

---

**🎉 Happy Coding!**
