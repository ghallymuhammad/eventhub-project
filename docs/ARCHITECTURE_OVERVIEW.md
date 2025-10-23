# EventHub Architecture Overview

## 🏗️ **Complete System Architecture**

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EVENTHUB APPLICATION                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   FRONTEND      │    │    BACKEND      │    │    DATABASE     │  │
│  │   (Next.js)     │    │   (Node.js)     │    │  (PostgreSQL)   │  │
│  │                 │    │                 │    │                 │  │
│  │ • React 18      │◄──►│ • Express.js    │◄──►│ • Prisma ORM    │  │
│  │ • TypeScript    │    │ • TypeScript    │    │ • Relations     │  │
│  │ • Tailwind CSS  │    │ • JWT Auth      │    │ • Constraints   │  │
│  │ • App Router    │    │ • API Routes    │    │ • Indexes       │  │
│  │ • SSR/CSR       │    │ • Middleware    │    │ • Migrations    │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │ GLOBAL STATE    │    │  LOCAL STATE    │    │  SERVER STATE   │  │
│  │ (React Context) │    │   (useState)    │    │  (API Calls)    │  │
│  │                 │    │                 │    │                 │  │
│  │ • Auth State    │    │ • Form Data     │    │ • Event Data    │  │
│  │ • User Data     │    │ • UI State      │    │ • Ticket Data   │  │
│  │ • Tokens        │    │ • Loading       │    │ • Transaction   │  │
│  │ • Permissions   │    │ • Errors        │    │ • Cache         │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Complete User Flow with State Management**

### **Authentication Flow:**
```
1. User visits /login
   ├── Local State: { email: '', password: '', loading: false, errors: {} }
   └── Global State: { isAuthenticated: false, user: null }

2. User enters credentials
   ├── Local State: { email: 'user@example.com', password: '***' }
   └── Form validation updates errors locally

3. User submits form
   ├── Local State: { loading: true }
   ├── API Call: POST /auth/login
   └── Response: { token: 'jwt...', user: {...} }

4. Login success
   ├── Storage: localStorage + cookies set
   ├── Global State: { isAuthenticated: true, user: {...}, token: '...' }
   ├── Components: Navbar re-renders with user menu
   └── Navigation: Redirect to /dashboard

5. Dashboard loads
   ├── Global State: Auth data available
   ├── Local State: { tickets: [], stats: {}, loading: true }
   ├── API Calls: GET /users/tickets, GET /users/stats
   └── Local State: { tickets: [...], stats: {...}, loading: false }
```

### **Ticket Purchase Flow:**
```
1. Event Discovery (/events/[id])
   ├── Local State: { event: null, loading: true }
   ├── API Call: GET /events/:id
   └── Local State: { event: {...}, loading: false }

2. Checkout Process (/checkout/[eventId])
   ├── Global State: User authenticated check
   ├── Local State: { 
   │     event: {...}, 
   │     tickets: [], 
   │     cart: [], 
   │     userInfo: {...},
   │     submitting: false 
   │   }
   ├── User Selection: cart state updates
   └── Form Validation: userInfo + errors state

3. Payment Processing (/payment/[transactionId])
   ├── API Call: POST /transactions
   ├── Local State: { transaction: {...}, loading: true }
   ├── Payment Gateway: External API integration
   └── Status Updates: Real-time transaction status

4. Success/Failure Pages
   ├── Success: /payment/[transactionId]/success
   │   ├── Global State: Update user points balance
   │   ├── API Call: Send email ticket
   │   └── Navigation: Link to /tickets
   └── Failure: /payment/[transactionId]/failed
       ├── Local State: { error: {...}, retryAvailable: true }
       └── Actions: Retry payment or contact support

5. My Tickets (/tickets)
   ├── Global State: User authenticated
   ├── Local State: { tickets: [], loading: true, filter: 'all' }
   ├── API Call: GET /users/tickets
   ├── Local State: { tickets: [...], loading: false }
   └── Actions: Download, email, share → Optimistic updates
```

## 📊 **Database → API → Frontend Data Flow**

### **Event Display Example:**
```
PostgreSQL Database
    ↓
SELECT * FROM events WHERE isActive = true
    ↓
Prisma ORM Query
    ↓
Express.js API Route: GET /api/events
    ↓
JSON Response: { success: true, data: [...] }
    ↓
Frontend API Service: apiService.getEvents()
    ↓
React Component State: setEvents(data)
    ↓
UI Rendering: Event cards displayed
```

### **User Authentication Example:**
```
Frontend Login Form
    ↓
POST /api/auth/login { email, password }
    ↓
Backend: Validate credentials + Generate JWT
    ↓
Database: SELECT user WHERE email = ? AND password = hash
    ↓
Response: { success: true, token: 'jwt...', user: {...} }
    ↓
Frontend: Store in localStorage + cookies
    ↓
AuthContext: Update global state
    ↓
Middleware: Verify token for protected routes
    ↓
Components: Conditional rendering based on auth state
```

## 🔧 **State Synchronization Patterns**

### **Client-Server Sync:**
```
1. Optimistic Updates
   ├── User Action → Immediate UI Update
   ├── API Call → Server Validation
   ├── Success → Confirm UI State
   └── Error → Rollback + Show Error

2. Real-time Updates
   ├── WebSocket Connection (Future)
   ├── Server Events → Client Updates
   └── Automatic State Synchronization

3. Cache Invalidation
   ├── User Action → API Call
   ├── Success → Invalidate Related Cache
   └── Refetch → Fresh Data Display
```

### **Multi-Tab Synchronization:**
```
Tab 1: User logs in
    ↓
localStorage + cookies updated
    ↓
Tab 2: Detects storage change
    ↓
AuthContext.checkAuth() runs
    ↓
Global state syncs across tabs
    ↓
Both tabs show authenticated state
```

## 🛡️ **Security & Validation Flow**

### **Input Validation:**
```
User Input → Frontend Validation (Yup) → Server Validation → Database Constraints
    ↓              ↓                      ↓                    ↓
Real-time     Prevent Submit        API Error Response    Data Integrity
Feedback      Invalid Forms         Security Layer       Final Validation
```

### **Authentication Security:**
```
1. Password Hashing
   ├── Frontend: Never store plain passwords
   ├── Backend: bcrypt hashing
   └── Database: Hashed passwords only

2. JWT Security
   ├── Signed tokens with secret
   ├── Expiration times
   ├── Refresh token rotation
   └── Secure cookie options

3. Route Protection
   ├── Middleware: Server-side validation
   ├── AuthContext: Client-side guards
   └── Automatic redirects
```

## 📈 **Performance & Optimization**

### **Frontend Optimizations:**
```
1. Code Splitting
   ├── Route-based chunks
   ├── Component lazy loading
   └── Dynamic imports

2. State Optimization
   ├── useMemo for expensive calculations
   ├── useCallback for event handlers
   └── Minimal re-renders

3. Caching Strategy
   ├── Browser cache for static assets
   ├── localStorage for user preferences
   └── API response caching
```

### **Backend Optimizations:**
```
1. Database Queries
   ├── Prisma query optimization
   ├── Proper indexing
   └── Relation eager loading

2. API Performance
   ├── Response compression
   ├── Request rate limiting
   └── Efficient error handling

3. Caching Layers
   ├── Redis for session data
   ├── CDN for static content
   └── Query result caching
```

This comprehensive architecture ensures scalable, maintainable, and performant operation of the EventHub platform across all layers of the application stack.
