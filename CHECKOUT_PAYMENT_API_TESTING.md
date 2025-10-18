# EventHub - Checkout & Payment API Testing Guide

## 🎯 Overview
This guide walks you through testing the complete ticket checkout and payment flow using the EventHub API.

## 📋 Prerequisites
1. **API Server Running**: `cd /Users/muhammadghally/Documents/eventhub-project/api && npm run dev`
2. **Base URL**: `http://localhost:8000`
3. **Postman Collection**: Import `EventHub_API_Tests.postman_collection.json`
4. **Valid Auth Token**: Complete login flow first to get JWT token

## 🔄 Complete Checkout & Payment Flow

### Step 1: Setup Test Data

#### A. Login and Get Auth Token
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "pointBalance": 1000
    }
  }
}
```

#### B. Get Available Events
```http
GET http://localhost:8000/api/events
Authorization: Bearer {your_token_here}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tech Conference 2024",
      "tickets": [
        {
          "id": 1,
          "name": "Regular",
          "price": 50000,
          "availableSeats": 100
        },
        {
          "id": 2,
          "name": "VIP",
          "price": 100000,
          "availableSeats": 50
        }
      ]
    }
  ]
}
```

### Step 2: Create Transaction (Initiate Checkout)

```http
POST http://localhost:8000/api/transactions
Authorization: Bearer {your_token_here}
Content-Type: application/json

{
  "eventId": 1,
  "tickets": [
    {
      "ticketId": 1,
      "quantity": 2
    },
    {
      "ticketId": 2,
      "quantity": 1
    }
  ],
  "couponCode": "DISCOUNT10",
  "pointsUsed": 500
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully. Please upload payment proof.",
  "data": {
    "id": 1,
    "userId": 1,
    "eventId": 1,
    "totalAmount": 200000,
    "pointsUsed": 500,
    "finalAmount": 190000,
    "status": "WAITING_FOR_PAYMENT",
    "paymentDeadline": "2024-01-17T13:41:00.000Z",
    "tickets": [
      {
        "ticketId": 1,
        "quantity": 2,
        "price": 50000
      },
      {
        "ticketId": 2,
        "quantity": 1,
        "price": 100000
      }
    ]
  }
}
```

### Step 3: Upload Payment Proof

```http
POST http://localhost:8000/api/transactions/1/payment-proof
Authorization: Bearer {your_token_here}
Content-Type: multipart/form-data

Form Data:
- paymentProof: [Upload an image file]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully. Waiting for confirmation.",
  "data": {
    "id": 1,
    "paymentProof": "payment_proof_filename.jpg",
    "status": "WAITING_FOR_ADMIN_CONFIRMATION"
  }
}
```

### Step 4: Confirm Payment (Organizer/Admin Action)

```http
PATCH http://localhost:8000/api/transactions/1/confirm
Authorization: Bearer {organizer_token_here}
Content-Type: application/json

{
  "status": "DONE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and tickets generated successfully",
  "data": {
    "id": 1,
    "status": "DONE",
    "attendees": [
      {
        "id": "ATT-001",
        "eventId": 1,
        "ticketId": 1,
        "status": "ACTIVE"
      }
    ]
  }
}
```

### Step 5: Verify Transaction

```http
GET http://localhost:8000/api/transactions/1
Authorization: Bearer {your_token_here}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "DONE",
    "totalAmount": 200000,
    "finalAmount": 190000,
    "pointsUsed": 500,
    "tickets": [...],
    "attendees": [...]
  }
}
```

## 🧪 Test Scenarios

### Scenario 1: Basic Checkout Flow
**Goal**: Test standard ticket purchase with payment proof upload

1. ✅ Create transaction with valid tickets
2. ✅ Upload payment proof image
3. ✅ Organizer confirms payment
4. ✅ Verify tickets are generated

### Scenario 2: Checkout with Discounts
**Goal**: Test coupon and points usage

1. ✅ Create transaction with coupon code
2. ✅ Apply points from user balance
3. ✅ Verify correct final amount calculation
4. ✅ Complete payment flow

### Scenario 3: Error Handling
**Goal**: Test various error conditions

#### A. Insufficient Tickets
```json
{
  "eventId": 1,
  "tickets": [
    {
      "ticketId": 1,
      "quantity": 999
    }
  ]
}
```
**Expected**: `400 Bad Request - Not enough seats available`

#### B. Invalid Coupon
```json
{
  "eventId": 1,
  "tickets": [...],
  "couponCode": "INVALID_CODE"
}
```
**Expected**: Coupon ignored, no discount applied

#### C. Excessive Points Usage
```json
{
  "eventId": 1,
  "tickets": [...],
  "pointsUsed": 999999
}
```
**Expected**: Points capped at user balance and total amount

### Scenario 4: Payment Rejection
**Goal**: Test payment rejection flow

1. ✅ Create transaction
2. ✅ Upload payment proof
3. ✅ Organizer rejects payment (`status: "REJECTED"`)
4. ✅ Verify transaction status and ticket availability restored

## 🐛 Common Issues & Solutions

### Issue 1: "Transaction not found"
**Cause**: Invalid transaction ID or wrong user
**Solution**: Verify transaction ID and ensure correct user token

### Issue 2: "Not enough seats available"
**Cause**: Insufficient ticket inventory
**Solution**: Check ticket availability before creating transaction

### Issue 3: "Payment proof upload failed"
**Cause**: Invalid file format or missing file
**Solution**: Upload valid image file (JPG, PNG, etc.)

### Issue 4: "Unauthorized access to transaction"
**Cause**: User trying to access another user's transaction
**Solution**: Ensure user can only access their own transactions

## 📊 Test Data Examples

### Sample Event Creation
```json
{
  "name": "Tech Conference 2024",
  "description": "Annual technology conference",
  "category": "Technology",
  "location": "Convention Center",
  "address": "123 Tech Street, Silicon Valley",
  "startDate": "2024-03-15T09:00:00Z",
  "endDate": "2024-03-15T18:00:00Z",
  "price": 50000,
  "availableSeats": 500,
  "tickets": [
    {
      "name": "Early Bird",
      "price": 40000,
      "availableSeats": 100,
      "description": "Limited early bird tickets"
    },
    {
      "name": "Regular",
      "price": 50000,
      "availableSeats": 300,
      "description": "Standard admission"
    },
    {
      "name": "VIP",
      "price": 100000,
      "availableSeats": 50,
      "description": "VIP access with premium amenities"
    }
  ]
}
```

### Sample Coupon Creation
```json
{
  "code": "DISCOUNT10",
  "discount": 10,
  "isPercentage": true,
  "expiryDate": "2024-12-31T23:59:59Z",
  "eventId": 1
}
```

## 🎯 Success Criteria

- [x] Transaction creation works with valid data
- [x] Payment proof upload accepts image files
- [x] Organizer can confirm/reject payments
- [x] Ticket availability updates correctly
- [x] Points and coupons apply discounts properly
- [x] Email notifications sent (if configured)
- [x] Error handling works for edge cases
- [x] User can only access their own transactions
- [x] Attendee records created after payment confirmation

## 🚀 Quick Test Commands

```bash
# Start API server
cd /Users/muhammadghally/Documents/eventhub-project/api && npm run dev

# Test with curl (after getting auth token)
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "tickets": [{"ticketId": 1, "quantity": 1}]
  }'
```

---

**🔗 Related Documentation:**
- [Main Testing Guide](./TESTING_GUIDE.md)
- [Postman Collection](./EventHub_API_Tests.postman_collection.json)
- [API Documentation](./docs/README.md)
