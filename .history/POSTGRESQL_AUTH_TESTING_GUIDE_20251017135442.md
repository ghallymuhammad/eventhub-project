# EventHub PostgreSQL Setup & Authentication Testing Guide

## 🎯 Overview
This guide will help you set up PostgreSQL database and test the complete authentication system including account creation, login, password reset, and forgot password functionality with real data.

## 📋 Prerequisites Installation

### Step 1: Install PostgreSQL

#### For macOS (using Homebrew):
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

#### For macOS (Alternative - Postgres.app):
1. Download Postgres.app from https://postgresapp.com/
2. Install and launch the app
3. Click "Initialize" to create a new server
4. Add PostgreSQL to your PATH:
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### For Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo -u postgres psql --version
```

#### For Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Follow the setup wizard
4. Remember the password you set for the `postgres` user

### Step 2: Create Database and User

#### Connect to PostgreSQL:
```bash
# Connect as postgres user
psql -U postgres

# Or if you're using the default installation
sudo -u postgres psql
```

#### Create Database and User:
```sql
-- Create database
CREATE DATABASE eventhub_db;

-- Create user
CREATE USER eventhub_user WITH PASSWORD 'eventhub_password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eventhub_db TO eventhub_user;

-- Connect to the database
\c eventhub_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO eventhub_user;

-- Exit
\q
```

#### Test Connection:
```bash
# Test connection with new user
psql -h localhost -U eventhub_user -d eventhub_db -W
# Enter password: eventhub_password123
```

## 🔧 Configure EventHub API for PostgreSQL

### Step 3: Update Prisma Configuration

#### Update `prisma/schema.prisma`:
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... rest of your schema remains the same
```

#### Update `.env` file:
```env
# Database
DATABASE_URL="postgresql://eventhub_user:eventhub_password123@localhost:5432/eventhub_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"

# Email Configuration (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App Configuration
PORT=8000
APP_NAME="EventHub API"
BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
```

### Step 4: Install PostgreSQL Dependencies

```bash
cd /Users/muhammadghally/Documents/eventhub-project/api

# Install PostgreSQL client
npm install pg @types/pg

# Install or update Prisma
npm install prisma @prisma/client
```

### Step 5: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init_postgresql_setup

# Push schema to database (alternative)
# npx prisma db push

# Verify migration
npx prisma migrate status
```

### Step 6: Seed Database with Real Test Data

Create comprehensive seed data:

```bash
# Create seed file
touch prisma/seed.ts
```

#### Seed Script Content:
```typescript
import { PrismaClient, Role, EventCategory, TicketType, CouponType } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.attendee.deleteMany();
  await prisma.transactionTicket.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.pointHistory.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users (Attendees/Customers)
  const attendee1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      role: Role.USER,
      isVerified: true,
      pointBalance: 500,
      referralCode: 'JOHN2024',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    }
  });

  const attendee2 = await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@gmail.com',
      password: hashedPassword,
      phoneNumber: '+1234567891',
      role: Role.USER,
      isVerified: false,
      pointBalance: 1000,
      referralCode: 'SARAH2024',
      referredBy: 'JOHN2024',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    }
  });

  const attendee3 = await prisma.user.create({
    data: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@gmail.com',
      password: hashedPassword,
      phoneNumber: '+1234567892',
      role: Role.USER,
      isVerified: true,
      pointBalance: 250,
      referralCode: 'MIKE2024',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  });

  // Create Organizers
  const organizer1 = await prisma.user.create({
    data: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.organizer@gmail.com',
      password: hashedPassword,
      phoneNumber: '+1234567893',
      role: Role.ORGANIZER,
      isVerified: true,
      pointBalance: 0,
      referralCode: 'EMILY2024',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  });

  const organizer2 = await prisma.user.create({
    data: {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.organizer@gmail.com',
      password: hashedPassword,
      phoneNumber: '+1234567894',
      role: Role.ORGANIZER,
      isVerified: true,
      pointBalance: 0,
      referralCode: 'DAVID2024',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eventhub.com',
      password: hashedPassword,
      phoneNumber: '+1234567895',
      role: Role.ADMIN,
      isVerified: true,
      pointBalance: 0,
      referralCode: 'ADMIN2024',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    }
  });

  // Create Events
  const techEvent = await prisma.event.create({
    data: {
      name: 'Tech Innovation Summit 2024',
      description: 'Join us for a comprehensive technology summit featuring the latest innovations in AI, blockchain, and cloud computing. Network with industry leaders and discover emerging trends.',
      category: EventCategory.TECHNOLOGY,
      location: 'Silicon Valley Convention Center',
      address: '2701 Mission College Blvd, Santa Clara, CA 95054',
      startDate: new Date('2024-11-15T09:00:00Z'),
      endDate: new Date('2024-11-15T18:00:00Z'),
      price: 75000,
      availableSeats: 300,
      totalSeats: 300,
      organizerId: organizer1.id,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      isActive: true
    }
  });

  const musicEvent = await prisma.event.create({
    data: {
      name: 'Summer Music Festival 2024',
      description: 'Experience an unforgettable night of music with top artists from around the world. Food trucks, art installations, and non-stop entertainment.',
      category: EventCategory.MUSIC,
      location: 'Golden Gate Park',
      address: 'Golden Gate Park, San Francisco, CA 94122',
      startDate: new Date('2024-12-01T16:00:00Z'),
      endDate: new Date('2024-12-01T23:00:00Z'),
      price: 50000,
      availableSeats: 500,
      totalSeats: 500,
      organizerId: organizer2.id,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      isActive: true
    }
  });

  const businessEvent = await prisma.event.create({
    data: {
      name: 'Startup Pitch Competition',
      description: 'Watch promising startups pitch their innovative ideas to a panel of venture capitalists and industry experts. Network with entrepreneurs and investors.',
      category: EventCategory.BUSINESS,
      location: 'Downtown Convention Center',
      address: '747 Howard St, San Francisco, CA 94103',
      startDate: new Date('2024-11-30T10:00:00Z'),
      endDate: new Date('2024-11-30T17:00:00Z'),
      price: 25000,
      availableSeats: 150,
      totalSeats: 150,
      organizerId: organizer1.id,
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      isActive: true
    }
  });

  // Create Tickets for each event
  // Tech Event Tickets
  await prisma.ticket.createMany({
    data: [
      {
        eventId: techEvent.id,
        type: TicketType.EARLY_BIRD,
        name: 'Early Bird',
        description: 'Limited early bird pricing - Save 30%!',
        price: 52500,
        availableSeats: 50
      },
      {
        eventId: techEvent.id,
        type: TicketType.REGULAR,
        name: 'General Admission',
        description: 'Standard conference access with all sessions',
        price: 75000,
        availableSeats: 200
      },
      {
        eventId: techEvent.id,
        type: TicketType.VIP,
        name: 'VIP Access',
        description: 'Premium access with networking lunch and swag bag',
        price: 125000,
        availableSeats: 50
      }
    ]
  });

  // Music Event Tickets
  await prisma.ticket.createMany({
    data: [
      {
        eventId: musicEvent.id,
        type: TicketType.REGULAR,
        name: 'General Admission',
        description: 'Access to all stages and performances',
        price: 50000,
        availableSeats: 400
      },
      {
        eventId: musicEvent.id,
        type: TicketType.VIP,
        name: 'VIP Experience',
        description: 'Front stage access, VIP lounge, and meet & greet',
        price: 100000,
        availableSeats: 100
      }
    ]
  });

  // Business Event Tickets
  await prisma.ticket.createMany({
    data: [
      {
        eventId: businessEvent.id,
        type: TicketType.STUDENT,
        name: 'Student Pass',
        description: 'Special pricing for students (ID required)',
        price: 15000,
        availableSeats: 50
      },
      {
        eventId: businessEvent.id,
        type: TicketType.REGULAR,
        name: 'Professional Pass',
        description: 'Full access to pitch presentations and networking',
        price: 25000,
        availableSeats: 100
      }
    ]
  });

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        userId: attendee1.id,
        eventId: techEvent.id,
        code: 'TECH20',
        type: CouponType.VOUCHER,
        name: '20% Tech Summit Discount',
        description: 'Special discount for Tech Innovation Summit',
        discount: 20,
        isPercentage: true,
        expiryDate: new Date('2024-11-14T23:59:59Z'),
        isUsed: false
      },
      {
        userId: attendee2.id,
        code: 'WELCOME10',
        type: CouponType.REWARD,
        name: 'Welcome Reward',
        description: '10% discount on your first event',
        discount: 10,
        isPercentage: true,
        expiryDate: new Date('2024-12-31T23:59:59Z'),
        isUsed: false
      },
      {
        userId: attendee1.id,
        code: 'REFER15',
        type: CouponType.REFERRAL,
        name: 'Referral Bonus',
        description: '15% discount for referring a friend',
        discount: 15,
        isPercentage: true,
        expiryDate: new Date('2024-12-31T23:59:59Z'),
        isUsed: false
      }
    ]
  });

  // Create Promotions
  await prisma.promotion.createMany({
    data: [
      {
        eventId: techEvent.id,
        code: 'EARLYTECH',
        name: 'Early Bird Special',
        description: 'Limited time early bird discount',
        discount: 30,
        isPercentage: true,
        maxUses: 100,
        usedCount: 25,
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-11-01T23:59:59Z'),
        isActive: true
      },
      {
        eventId: musicEvent.id,
        code: 'MUSICLOVER',
        name: 'Music Lover Discount',
        description: '25% off for music enthusiasts',
        discount: 25,
        isPercentage: true,
        maxUses: 50,
        usedCount: 10,
        startDate: new Date('2024-10-15T00:00:00Z'),
        endDate: new Date('2024-11-30T23:59:59Z'),
        isActive: true
      }
    ]
  });

  // Create Point History
  await prisma.pointHistory.createMany({
    data: [
      {
        userId: attendee1.id,
        points: 500,
        description: 'Welcome bonus points'
      },
      {
        userId: attendee2.id,
        points: 1000,
        description: 'Referral bonus points'
      },
      {
        userId: attendee3.id,
        points: 250,
        description: 'Event purchase reward'
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts Created:');
  console.log('\n👥 ATTENDEES/USERS:');
  console.log('- john.doe@gmail.com (Verified, 500 points)');
  console.log('- sarah.johnson@gmail.com (Unverified, 1000 points)');
  console.log('- michael.chen@gmail.com (Verified, 250 points)');
  console.log('\n🎪 ORGANIZERS:');
  console.log('- emily.organizer@gmail.com');
  console.log('- david.organizer@gmail.com');
  console.log('\n🛡️ ADMIN:');
  console.log('- admin@eventhub.com');
  console.log('\n🔑 Password for all accounts: password123');
  console.log('\n🎟️ Events Created:');
  console.log('- Tech Innovation Summit 2024 (3 ticket types)');
  console.log('- Summer Music Festival 2024 (2 ticket types)');
  console.log('- Startup Pitch Competition (2 ticket types)');
  console.log('\n🎫 Coupons Available:');
  console.log('- TECH20 (20% off Tech Summit)');
  console.log('- WELCOME10 (10% off first event)');
  console.log('- REFER15 (15% referral bonus)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Update package.json:
```json
{
  "scripts": {
    "seed": "npx ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "npx ts-node prisma/seed.ts"
  }
}
```

#### Run the seed:
```bash
npm run seed
```

## 🧪 Authentication Testing Guide

### Step 7: Test Account Creation (Registration)

#### Test Case 1: Attendee Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice.smith@gmail.com",
    "password": "securePassword123!",
    "phoneNumber": "+1555123456",
    "referredBy": "JOHN2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": 7,
      "email": "alice.smith@gmail.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "USER",
      "isVerified": false,
      "pointBalance": 1000,
      "referralCode": "ALICE2024"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Test Case 2: Organizer Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Robert",
    "lastName": "Taylor",
    "email": "robert.organizer@gmail.com",
    "password": "organizerPass123!",
    "phoneNumber": "+1555123457",
    "role": "ORGANIZER"
  }'
```

#### Test Case 3: Duplicate Email Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Duplicate",
    "email": "john.doe@gmail.com",
    "password": "password123",
    "phoneNumber": "+1555123458"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Step 8: Test Login

#### Test Case 1: Successful Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "password": "password123"
  }'
```

#### Test Case 2: Invalid Credentials
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "password": "wrongpassword"
  }'
```

#### Test Case 3: Unverified Account Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@gmail.com",
    "password": "password123"
  }'
```

### Step 9: Test Email Verification

#### Send Verification Email
```bash
curl -X POST http://localhost:8000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@gmail.com"
  }'
```

#### Verify Email (you'll need the token from email)
```bash
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

### Step 10: Test Forgot Password

#### Request Password Reset
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### Step 11: Test Password Reset

#### Reset Password (using token from email)
```bash
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "newPassword": "newSecurePassword123!"
  }'
```

#### Test Login with New Password
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "password": "newSecurePassword123!"
  }'
```

## 🔍 Database Verification

### Step 12: Verify Data in PostgreSQL

```bash
# Connect to database
psql -h localhost -U eventhub_user -d eventhub_db -W

# Check users
SELECT id, email, "firstName", "lastName", role, "isVerified", "pointBalance" FROM users;

# Check events
SELECT id, name, category, "organizerId", "availableSeats", "totalSeats" FROM events;

# Check tickets
SELECT t.id, t.name, t.price, t."availableSeats", e.name as event_name 
FROM tickets t 
JOIN events e ON t."eventId" = e.id;

# Check transactions
SELECT id, "userId", "eventId", "totalAmount", "finalAmount", status 
FROM transactions;

# Exit
\q
```

## 📧 Email Configuration Testing

### Gmail SMTP Setup:
1. Enable 2-Factor Authentication on your Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate password
3. Update `.env` with your credentials:

```env
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-character-app-password"
```

### Test Email Service:
```bash
curl -X POST http://localhost:8000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@gmail.com",
    "subject": "EventHub Test Email",
    "text": "Testing email functionality"
  }'
```

## 🚀 Complete Testing Checklist

### ✅ Database Setup
- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] Prisma schema updated for PostgreSQL
- [ ] Migration completed successfully
- [ ] Seed data created

### ✅ Authentication Tests
- [ ] User registration (attendee)
- [ ] User registration (organizer)
- [ ] Duplicate email prevention
- [ ] Successful login
- [ ] Invalid credentials handling
- [ ] Email verification flow
- [ ] Forgot password request
- [ ] Password reset completion
- [ ] Login with new password

### ✅ Email Integration
- [ ] SMTP configuration
- [ ] Verification emails sent
- [ ] Password reset emails sent
- [ ] Email templates working

### ✅ Database Verification
- [ ] User data stored correctly
- [ ] Password hashing working
- [ ] Email verification status updated
- [ ] Password reset tokens generated
- [ ] Referral system working

## 🛠️ Troubleshooting

### Common Issues:

1. **PostgreSQL Connection Error:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# Or for Ubuntu
sudo systemctl status postgresql
```

2. **Migration Errors:**
```bash
# Reset database
npx prisma migrate reset
npx prisma migrate dev --name fresh_start
```

3. **Email Not Sending:**
```bash
# Test email service endpoint
curl -X GET http://localhost:8000/api/test/email-status
```

4. **Permission Errors:**
```bash
# Re-grant permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE eventhub_db TO eventhub_user;"
```

This comprehensive setup will give you a fully functional PostgreSQL database with real test data for thorough authentication testing!
