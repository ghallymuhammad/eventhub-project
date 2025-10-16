# EventHub API Testing Guide

## Prerequisites
1. **Gmail App Password Setup**
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Generate App Password for Mail
   - Update /api/.env with your password

2. **Start API Server**
   ```bash
   cd /api
   npm run dev
   # Should show: ✅ Email service is ready to send messages
   ```

3. **Import Postman Collection**
   - Import: EventHub_API_Tests.postman_collection.json
   - Set baseUrl to: http://localhost:8000

## Testing Sequence

### 1. 🔐 Authentication Tests

#### A. Register New User
```
POST /api/auth/register
{
    "firstName": "Test",
    "lastName": "User", 
    "email": "your-test-email@gmail.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
}

Expected: 
- 201 Created
- Returns auth token
- Sends verification email
```

#### B. Login User
```
POST /api/auth/login
{
    "email": "your-test-email@gmail.com", 
    "password": "password123"
}

Expected:
- 200 OK
- Returns auth token and user data
```

#### C. Get Profile (Authenticated)
```
GET /api/auth/profile
Headers: Authorization: Bearer {token}

Expected:
- 200 OK
- Returns user profile data
```

### 2. 📧 Email Tests

#### A. Test Basic Email
```
POST /api/test/email
Headers: Authorization: Bearer {token}
{
    "to": "muh.ghally@gmail.com",
    "subject": "EventHub Test Email",
    "message": "Testing email functionality"
}

Expected:
- 200 OK
- Email received in inbox
```

#### B. Forgot Password
```
POST /api/auth/forgot-password
{
    "email": "your-test-email@gmail.com"
}

Expected:
- 200 OK
- Password reset email sent
- Contains reset token/link
```

#### C. Reset Password
```
POST /api/auth/reset-password
{
    "token": "reset_token_from_email",
    "newPassword": "newpassword123"
}

Expected:
- 200 OK
- Password updated
- Can login with new password
```

### 3. 🔔 Email Verification Tests

#### A. Verify Email
```
POST /api/auth/verify-email
{
    "token": "verification_token_from_email"
}

Expected:
- 200 OK
- Email marked as verified
```

#### B. Resend Verification
```
POST /api/auth/resend-verification
{
    "email": "your-test-email@gmail.com"
}

Expected:
- 200 OK
- New verification email sent
```

### 4. 🎟️ Event Tests

#### A. Create Event
```
POST /api/events
Headers: Authorization: Bearer {token}
{
    "name": "Test Event",
    "description": "Test event description",
    "category": "Technology", 
    "location": "Test Venue",
    "address": "123 Test Street",
    "startDate": "2025-01-01T10:00:00Z",
    "endDate": "2025-01-01T18:00:00Z",
    "price": 100000,
    "availableSeats": 100,
    "isFree": false
}

Expected:
- 201 Created
- Event created successfully
```

#### B. Get Events
```
GET /api/events

Expected:
- 200 OK
- List of events returned
```

## ✅ Success Criteria

### Email Service
- [ ] ✅ Email service connects without errors
- [ ] 📧 Test emails received in Gmail
- [ ] 🔑 Password reset emails work
- [ ] ✉️ Verification emails work

### Authentication
- [ ] 👤 User registration works
- [ ] 🔐 Login/logout works
- [ ] 🔒 Password reset flow works
- [ ] ✅ Email verification works
- [ ] 🛡️ Protected routes require auth

### API Functionality
- [ ] 🎪 Event creation works
- [ ] 📜 Event listing works
- [ ] 👤 Profile management works
- [ ] 🎫 Transaction handling works

## 🚨 Troubleshooting

### Email Issues
- **535 Authentication Error**: Wrong app password
- **No email received**: Check spam folder
- **Connection timeout**: Check SMTP settings

### API Issues  
- **401 Unauthorized**: Include Bearer token
- **404 Not Found**: Check route URLs
- **500 Server Error**: Check console logs

### Common Fixes
```bash
# Restart API after .env changes
cd /api && npm run dev

# Check email service status in logs
# Look for: ✅ Email service is ready

# Test email connectivity
curl -X POST http://localhost:8000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to":"muh.ghally@gmail.com","subject":"Test","message":"Hello"}'
```

## 📊 Expected Response Formats

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { /* response data */ }
}
```

### Error Response  
```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error info"
}
```

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| POST | /api/auth/verify-email | Verify email |
| POST | /api/auth/resend-verification | Resend verification |
| GET | /api/auth/profile | Get user profile |
| POST | /api/test/email | Test email service |
| POST | /api/events | Create event |
| GET | /api/events | List events |

## 🚨 Postman Setup Issues

### Problem: Variables Not Working
If you see `{{baseUrl}}/api/users/register` instead of `http://localhost:8000/api/users/register`:

**Solution:**
1. **Set Collection Variables:**
   - Right-click on "EventHub API Tests" collection
   - Click "Edit"
   - Go to "Variables" tab
   - Set: `baseUrl` = `http://localhost:8000`
   - Click "Save"

2. **Alternative - Direct URLs:**
   Use full URLs instead of variables:
   ```
   POST http://localhost:8000/api/users/register
   ```

### Problem: "Not Found" Error
This means the route doesn't exist. Check:

1. **API Server Running?**
   ```bash
   cd /Users/muhammadghally/Documents/eventhub-project/api
   npm run dev
   # Should show: -> [API] Local: http://localhost:8000
   ```

2. **Test Basic Connection:**
   ```bash
   # Test if API is responding
   curl http://localhost:8000/api
   # Should return: Welcome to the EventHub API
   ```

## ✅ FIXED: Correct API Routes

**The issue was incorrect route URLs. Here are the CORRECT routes:**

### 🎯 Working API Endpoints:
- Registration: `POST http://localhost:8000/api/auth/register` ✅
- Login: `POST http://localhost:8000/api/auth/login` ✅  
- Profile: `GET http://localhost:8000/api/auth/profile` ✅
- Test Email: `POST http://localhost:8000/api/test/email` ✅

### 🔧 Postman Quick Fix:
1. **Import Updated Collection**: Re-import the fixed `EventHub_API_Tests.postman_collection.json`
2. **Set Variables**: 
   - Right-click collection → Edit → Variables
   - Set `baseUrl` = `http://localhost:8000`
3. **Test Registration**: 
   ```
   POST {{baseUrl}}/api/auth/register
   Body: {
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com", 
       "password": "password123",
       "phoneNumber": "+1234567890"
   }
   ```

### ⚡ Quick Test (Works Now):
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","phoneNumber":"+1234567890"}'
```

**Expected Response:** ✅ Success with token and user data
