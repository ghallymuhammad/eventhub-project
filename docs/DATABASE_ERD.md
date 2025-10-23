# EventHub Database ERD (Entity Relationship Diagram)

## 🗄️ **Database Schema Overview**

### **Core Entities & Relationships**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      USERS      │         │     EVENTS      │         │   TRANSACTIONS  │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ • id (PK)       │ 1    ∞  │ • id (PK)       │ 1    ∞  │ • id (PK)       │
│ • email         │────────→│ • organizerId   │────────→│ • userId (FK)   │
│ • password      │         │ • name          │         │ • eventId (FK)  │
│ • firstName     │         │ • description   │         │ • totalAmount   │
│ • lastName      │         │ • category      │         │ • status        │
│ • phoneNumber   │         │ • location      │         │ • paymentProof  │
│ • role          │         │ • startDate     │         │ • createdAt     │
│ • pointBalance  │         │ • endDate       │         └─────────────────┘
│ • referralCode  │         │ • price         │                   │
│ • referredBy    │         │ • totalSeats    │                   │ ∞
│ • isVerified    │         │ • availableSeats│                   │
│ • createdAt     │         │ • isFree        │                   ▼
└─────────────────┘         │ • imageUrl      │         ┌─────────────────┐
                            │ • isActive      │         │TRANSACTION_TCKTS│
                            │ • createdAt     │         ├─────────────────┤
                            └─────────────────┘         │ • id (PK)       │
                                      │                 │ • transactionId │
                                      │ 1               │ • ticketId (FK) │
                                      │                 │ • quantity      │
                                      ▼ ∞              │ • price         │
                            ┌─────────────────┐         └─────────────────┘
                            │     TICKETS     │                   ▲
                            ├─────────────────┤                   │ ∞
                            │ • id (PK)       │                   │
                            │ • eventId (FK)  │───────────────────┘
                            │ • type          │
                            │ • name          │
                            │ • description   │
                            │ • price         │
                            │ • availableSeats│
                            │ • createdAt     │
                            └─────────────────┘
```

### **Supporting Entities**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   PROMOTIONS    │         │     COUPONS     │         │     REVIEWS     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ • id (PK)       │         │ • id (PK)       │         │ • id (PK)       │
│ • eventId (FK)  │         │ • userId (FK)   │         │ • userId (FK)   │
│ • code          │         │ • eventId (FK)  │         │ • eventId (FK)  │
│ • name          │         │ • code          │         │ • rating        │
│ • discount      │         │ • type          │         │ • comment       │
│ • isPercentage  │         │ • discount      │         │ • createdAt     │
│ • maxUses       │         │ • isUsed        │         └─────────────────┘
│ • usedCount     │         │ • expiryDate    │
│ • startDate     │         │ • createdAt     │
│ • endDate       │         └─────────────────┘
│ • isActive      │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  POINT_HISTORY  │         │ NOTIFICATIONS   │         │   ATTENDEES     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ • id (PK)       │         │ • id (PK)       │         │ • id (PK)       │
│ • userId (FK)   │         │ • userId (FK)   │         │ • transactionId │
│ • points        │         │ • type          │         │ • eventId (FK)  │
│ • description   │         │ • title         │         │ • userId (FK)   │
│ • createdAt     │         │ • message       │         │ • ticketType    │
└─────────────────┘         │ • isRead        │         │ • quantity      │
                            │ • metadata      │         │ • totalPaid     │
                            │ • createdAt     │         │ • attendedAt    │
                            └─────────────────┘         │ • createdAt     │
                                                        └─────────────────┘
```

## 🔗 **Relationship Details**

### **1. User → Events (One-to-Many)**
- One user can organize multiple events
- `events.organizerId` → `users.id`

### **2. Event → Tickets (One-to-Many)**
- One event can have multiple ticket types
- `tickets.eventId` → `events.id`

### **3. User → Transactions (One-to-Many)**
- One user can have multiple transactions
- `transactions.userId` → `users.id`

### **4. Event → Transactions (One-to-Many)**
- One event can have multiple transactions
- `transactions.eventId` → `events.id`

### **5. Transaction → TransactionTickets (One-to-Many)**
- One transaction can include multiple ticket types
- `transaction_tickets.transactionId` → `transactions.id`

### **6. Ticket → TransactionTickets (One-to-Many)**
- One ticket type can be in multiple transactions
- `transaction_tickets.ticketId` → `tickets.id`

### **7. User → Reviews (One-to-Many)**
- One user can review multiple events
- `reviews.userId` → `users.id`

### **8. Event → Reviews (One-to-Many)**
- One event can have multiple reviews
- `reviews.eventId` → `events.id`

## 📊 **Data Types & Constraints**

### **Enums:**
```typescript
Role: ADMIN | USER | ORGANIZER
EventCategory: MUSIC | TECHNOLOGY | BUSINESS | SPORTS | ARTS | FOOD | EDUCATION | HEALTH | OTHER
TransactionStatus: WAITING_FOR_PAYMENT | WAITING_FOR_ADMIN_CONFIRMATION | DONE | REJECTED | EXPIRED | CANCELED
TicketType: REGULAR | VIP | EARLY_BIRD | STUDENT
CouponType: VOUCHER | REWARD | REFERRAL
NotificationType: TRANSACTION_ACCEPTED | TRANSACTION_REJECTED | PAYMENT_REMINDER | EVENT_REMINDER | REFERRAL_REWARD
```

### **Key Constraints:**
- `users.email` → UNIQUE
- `users.referralCode` → UNIQUE
- `promotions.code` → UNIQUE
- `coupons.code` → UNIQUE
- `reviews.[userId, eventId]` → UNIQUE (one review per user per event)

### **Currency Storage:**
- All monetary values stored as integers in IDR (Indonesian Rupiah)
- Example: 300000 = IDR 300,000

## 🔄 **Business Logic Flow**

### **Ticket Purchase Flow:**
1. User selects event → `events` table
2. User selects tickets → `tickets` table
3. Creates transaction → `transactions` table
4. Links tickets to transaction → `transaction_tickets` table
5. Payment confirmation → Updates `transactions.status`
6. Creates attendee record → `attendees` table
7. Updates event capacity → `events.availableSeats`

### **Points & Rewards System:**
1. User earns points → `point_history` table
2. Updates user balance → `users.pointBalance`
3. Creates reward coupons → `coupons` table
4. User redeems → Updates `coupons.isUsed`

### **Referral System:**
1. User A shares referral code → `users.referralCode`
2. User B registers with code → `users.referredBy`
3. System creates reward → `coupons` table
4. Notification sent → `notifications` table

## 🔒 **Security & Data Integrity**

### **Password Security:**
- Passwords hashed using bcrypt
- Reset tokens with expiry for password recovery

### **Data Validation:**
- Email format validation
- Phone number format validation
- Date range validation (startDate < endDate)
- Seat availability validation
- Price validation (positive values)

### **Audit Trail:**
- `createdAt` and `updatedAt` timestamps on all entities
- Transaction status tracking
- Point history for financial auditing

This ERD supports the complete EventHub functionality including user management, event organization, ticket sales, payment processing, and reward systems.
