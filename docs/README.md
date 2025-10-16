# 📚 EventHub Documentation

Welcome to the EventHub documentation! This folder contains all the documentation for the EventHub event management platform.

## 📖 Table of Contents

### 🚀 Getting Started
- [Main README](../README.md) - Project overview and quick start

### 📧 Email System Documentation
Located in [`email-system/`](./email-system/)

| Document | Description |
|----------|-------------|
| [📖 Setup Guide](./email-system/EMAIL_SETUP_README.md) | **Start here!** Quick 5-minute setup guide |
| [📘 Implementation Guide](./email-system/EMAIL_IMPLEMENTATION_GUIDE.md) | Complete implementation details |
| [📋 Quick Reference](./email-system/EMAIL_QUICK_REFERENCE.md) | Quick reference card for developers |
| [✨ Feature Summary](./email-system/EMAIL_FEATURE_SUMMARY.md) | Complete feature overview |
| [🔄 Flow Diagrams](./email-system/EMAIL_FLOW_DIAGRAMS.md) | Visual flow diagrams |
| [📧 System Guide](./email-system/EMAIL_SYSTEM_GUIDE.md) | Email system architecture guide |

**Email Features:**
- ✅ User email verification on registration
- ✅ Password reset with secure tokens
- ✅ Ticket delivery with JPG attachments
- ✅ Beautiful QR code generation
- ✅ Professional HTML templates

---

### 🎨 Frontend Documentation
Located in [`frontend/`](./frontend/)

| Document | Description |
|----------|-------------|
| [📄 Event Detail Page](./frontend/EVENT_DETAIL_PAGE.md) | Complete event detail page documentation |
| [🔧 Implementation Guide](./frontend/EVENT_DETAIL_IMPLEMENTATION.md) | Step-by-step implementation |
| [🗺️ Component Map](./frontend/EVENT_DETAIL_COMPONENT_MAP.md) | Visual component hierarchy |
| [⚡ Quick Reference](./frontend/QUICK_REFERENCE.md) | Quick reference for common tasks |

**Frontend Features:**
- ✅ Event detail page with glassmorphism design
- ✅ Ticket selection and purchase flow
- ✅ Review system with ratings
- ✅ Share functionality (social media, email, copy link)
- ✅ Countdown timer to event start
- ✅ Responsive design (mobile, tablet, desktop)

---

### 🗄️ Database Documentation
Located in [`database/`](./database/)

| Document | Description |
|----------|-------------|
| [📊 ERD Diagram](./database/database-erd.dbml) | Database Entity Relationship Diagram (DBML) |

**How to use the ERD:**
1. Visit [dbdiagram.io](https://dbdiagram.io)
2. Click "Import" → "From DBML"
3. Paste the contents of `database-erd.dbml`
4. View your interactive database diagram!

**Database Models:**
- Users (authentication, referrals, points)
- Events (organizers, categories, seats)
- Tickets (types, prices, availability)
- Transactions (payments, status, proofs)
- Reviews (ratings, comments)
- Coupons & Promotions
- Notifications
- Attendees

---

## 🏗️ Project Structure

```
eventhub-minpro/
├── docs/                          # 📚 Documentation (you are here)
│   ├── README.md                  # This file
│   ├── email-system/              # Email notification docs
│   ├── frontend/                  # Frontend/UI docs
│   └── database/                  # Database schema docs
│
├── api/                           # 🔧 Backend API
│   ├── src/
│   │   ├── services/
│   │   │   ├── email.service.ts         # Email sending
│   │   │   └── ticketGenerator.service.ts # Ticket JPG generation
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts       # Authentication
│   │   │   └── transaction.controller.ts # Transactions
│   │   ├── routes/
│   │   │   ├── auth.route.ts
│   │   │   └── transaction.route.ts
│   │   └── tests/
│   │       └── test-email.ts            # Email testing
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── package.json
│
└── web/                           # 🎨 Frontend (Next.js)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                 # Landing page
    │   │   └── events/[id]/page.tsx     # Event detail page
    │   ├── components/
    │   │   ├── EventHomepage.tsx
    │   │   ├── EventDetailPage.tsx
    │   │   ├── ShareModal.tsx
    │   │   ├── Countdown.tsx
    │   │   └── ...
    │   └── libs/
    │       └── api.ts                   # API utilities
    └── package.json
```

---

## 🎯 Quick Links

### For Developers

**Setting up Email System:**
1. Read [Email Setup Guide](./email-system/EMAIL_SETUP_README.md)
2. Configure SMTP in `.env`
3. Run test: `npx ts-node src/tests/test-email.ts`

**Building Frontend:**
1. Read [Event Detail Page](./frontend/EVENT_DETAIL_PAGE.md)
2. Check [Component Map](./frontend/EVENT_DETAIL_COMPONENT_MAP.md)
3. Start dev server: `npm run dev`

**Database Setup:**
1. View [ERD Diagram](./database/database-erd.dbml)
2. Run migrations: `npm run migrate:dev`
3. View data: `npm run studio`

---

## 📊 Documentation Statistics

| Category | Files | Status |
|----------|-------|--------|
| Email System | 6 docs | ✅ Complete |
| Frontend | 4 docs | ✅ Complete |
| Database | 1 doc | ✅ Complete |
| **Total** | **11 docs** | **✅ 100% Complete** |

---

## 🔍 Finding What You Need

### "I want to..."

**Send emails from my app:**
→ Start with [Email Setup Guide](./email-system/EMAIL_SETUP_README.md)

**Understand the email flow:**
→ Check [Email Flow Diagrams](./email-system/EMAIL_FLOW_DIAGRAMS.md)

**Build event detail pages:**
→ Read [Event Detail Page](./frontend/EVENT_DETAIL_PAGE.md)

**See component structure:**
→ View [Component Map](./frontend/EVENT_DETAIL_COMPONENT_MAP.md)

**Design database schema:**
→ Import [ERD Diagram](./database/database-erd.dbml) to dbdiagram.io

**Quick API reference:**
→ Check [Email Quick Reference](./email-system/EMAIL_QUICK_REFERENCE.md)

---

## 🎨 Features Overview

### ✅ Implemented Features

#### Email System
- [x] Email verification on registration
- [x] Password reset with tokens
- [x] Ticket email with JPG attachment
- [x] Payment confirmation emails
- [x] QR code generation
- [x] Beautiful HTML templates
- [x] SMTP integration (Gmail, SendGrid, etc.)

#### Frontend
- [x] Landing page with glassmorphism
- [x] Event detail page
- [x] Ticket selection UI
- [x] Share modal (Facebook, Twitter, Email, Copy)
- [x] Favorite/Save functionality
- [x] Review system
- [x] Countdown timer
- [x] Responsive design

#### Backend
- [x] Authentication API
- [x] Transaction API
- [x] Email service
- [x] Ticket generator service
- [x] Payment proof upload
- [x] Payment confirmation

#### Database
- [x] Complete schema design
- [x] User management
- [x] Event management
- [x] Transaction processing
- [x] Review system
- [x] Coupon & promotion system
- [x] Referral system

---

## 🚀 Next Steps

1. **Read the setup guides** in each category
2. **Follow the implementation guides** step by step
3. **Test the features** using the provided test scripts
4. **Refer to quick references** during development

---

## 📞 Support

For questions or issues:
1. Check the relevant documentation first
2. Review the [Quick Reference](./email-system/EMAIL_QUICK_REFERENCE.md) guides
3. Check the [Flow Diagrams](./email-system/EMAIL_FLOW_DIAGRAMS.md) for visual understanding

---

## 📝 Documentation Standards

All documentation in this project follows these principles:
- ✅ Clear and concise
- ✅ Step-by-step instructions
- ✅ Code examples included
- ✅ Visual diagrams where helpful
- ✅ Quick reference sections
- ✅ Troubleshooting guides

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete

---

**Happy coding! 🎉**
