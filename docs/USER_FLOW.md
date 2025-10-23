# EventHub User Flow Documentation

## 🎯 Complete User Journey Map

### **1. Guest User Flow**
```
Homepage (/) 
    ↓
Browse Events → Event Details (/events/[id])
    ↓
[Not Logged In] → Login Required
    ↓
Login Page (/login) 
    ↓
[Success] → Redirect to intended page
[Failure] → Show error, retry
```

### **2. Authentication Flow**
```
Login Page (/login)
    ↓
Enter Credentials
    ↓
API Call: POST /auth/login
    ↓
[Success] → Store token in localStorage + cookies → AuthContext updates
    ↓
Redirect to:
- returnTo URL (if from protected route)
- Dashboard (default)
    ↓
[Failure] → Show error message, stay on login

Forgot Password (/forgot-password)
    ↓
Enter email → API call → Success message
```

### **3. Authenticated User Flow**
```
Homepage (/) [Logged In]
    ↓
Browse Events → Event Details (/events/[id])
    ↓
"Buy Tickets" → Checkout (/checkout/[eventId])
    ↓
Select Tickets + Fill Info
    ↓
"Proceed to Payment" → Payment Processing (/payment/[transactionId])
    ↓
Payment Gateway Integration
    ↓
Success (/payment/[transactionId]/success) OR Failed (/payment/[transactionId]/failed)
    ↓
[Success] → Auto email ticket → My Tickets (/tickets)
[Failed] → Retry payment OR Go back
```

### **4. Dashboard & Management Flow**
```
Dashboard (/dashboard)
    ↓
View Statistics, Quick Actions
    ↓
- Browse Events (/)
- My Tickets (/tickets) → View/Download/Share tickets
- Profile (/profile) → Edit user information
    ↓
My Tickets (/tickets)
    ↓
- Download PDF ticket
- Email ticket to someone
- Share ticket link
- View QR code
```

### **5. Navigation Flow**
```
Navbar (Always Present)
    ↓
[Logged Out]: Home, Login, Register
[Logged In]: Home, Dashboard, My Tickets, Profile, Logout
    ↓
Footer (Always Present)
```

## 📊 **Detailed Page Flow**

### **Page-by-Page Journey:**

1. **Homepage (/)** 
   - Hero section with CTA
   - Featured events grid
   - Event cards with "View Details" buttons

2. **Event Details (/events/[id])**
   - Event information
   - Organizer details
   - "Buy Tickets" button → Checkout

3. **Login (/login)**
   - Email/password form
   - "Forgot Password" link
   - Success → Dashboard or returnTo URL

4. **Checkout (/checkout/[eventId])**
   - Event summary
   - Ticket selection
   - User information form
   - Order summary
   - "Proceed to Payment" button

5. **Payment (/payment/[transactionId])**
   - Payment processing
   - Loading state
   - Auto-redirect to success/failure

6. **Payment Success (/payment/[transactionId]/success)**
   - Success message
   - Order details
   - "View My Tickets" button
   - Auto email sending

7. **Payment Failed (/payment/[transactionId]/failed)**
   - Error message
   - "Retry Payment" button
   - "Contact Support" option

8. **My Tickets (/tickets)**
   - Ticket list with status
   - Download/Email/Share actions
   - QR codes for entry

9. **Dashboard (/dashboard)**
   - User statistics
   - Quick action buttons
   - Recent tickets preview

10. **Profile (/profile)**
    - User information editing
    - Account settings
    - Points balance

## 🔄 **User State Transitions**

### **Authentication States:**
- `isLoading: true` → Checking authentication
- `isAuthenticated: false` → Guest user
- `isAuthenticated: true` → Logged in user
- `user: User | null` → User data or null

### **Page Loading States:**
- `loading: true` → Fetching data
- `loading: false` → Data loaded
- `error: string | null` → Error state

### **Form States:**
- `submitting: true` → Form being submitted
- `valid: boolean` → Form validation state
- `errors: object` → Field-specific errors

## 🛡️ **Protection & Guards**

### **Route Protection:**
- Middleware checks cookies for server-side routes
- AuthContext guards for client-side routes
- Automatic redirects to login with returnTo parameter

### **Error Handling:**
- 401 → Auto logout and redirect to login
- 404 → Show not found message
- 500 → Error boundary catches and shows fallback
- Network errors → Toast notifications

## 📱 **Responsive Behavior**

### **Mobile Flow:**
- Collapsible navbar
- Touch-friendly buttons
- Optimized form layouts
- Swipe gestures for carousels

### **Desktop Flow:**
- Full navigation menu
- Hover effects
- Keyboard shortcuts
- Multi-column layouts

## 🔔 **Feedback & Notifications**

### **User Feedback:**
- Toast notifications for actions
- Loading spinners for async operations
- Form validation messages
- Success/error states with icons

### **Email Notifications:**
- Registration confirmation
- Ticket purchase confirmation
- Event reminders
- Password reset links

This user flow ensures a smooth, intuitive experience from discovery to ticket purchase and management.
