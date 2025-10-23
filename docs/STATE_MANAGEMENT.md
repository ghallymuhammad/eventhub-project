# EventHub State Management Architecture

## 🏗️ **State Management Overview**

EventHub uses a **hybrid state management approach** combining React Context for global state and local useState for component-specific state.

## 🌍 **Global State (React Context)**

### **AuthContext - Authentication State**

```typescript
// Location: /src/contexts/AuthContext.tsx

interface AuthState {
  user: User | null;           // Current user data
  token: string | null;        // JWT authentication token
  isAuthenticated: boolean;    // Authentication status
  isLoading: boolean;         // Loading state for auth checks
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => void;
}
```

### **State Flow:**
```
App Initialization
    ↓
AuthProvider wraps entire app
    ↓
checkAuth() runs on mount
    ↓
Checks localStorage + cookies for token
    ↓
If valid: Sets user + isAuthenticated = true
If invalid: Sets isAuthenticated = false
    ↓
Components consume via useAuth() hook
```

### **Storage Strategy:**
```
Login Success:
    ↓
Store in localStorage: 'eventhub_token', 'eventhub_user'
    ↓
Store in cookies: 'token' (for middleware)
    ↓
Update AuthContext state
    ↓
Components re-render with new auth state

Logout:
    ↓
Clear localStorage + cookies
    ↓
Reset AuthContext to null/false
    ↓
Redirect to login page
```

## 🏠 **Local State (Component-Level)**

### **Page-Level State Examples:**

#### **1. Dashboard Page State:**
```typescript
// /src/app/dashboard/page.tsx

const [tickets, setTickets] = useState<UserTicket[]>([]);
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState<DashboardStats>({
  totalTickets: 0,
  upcomingEvents: 0,
  eventsAttended: 0,
  pointsBalance: 0
});

// State Flow:
useEffect → fetchDashboardData() → API call → setTickets() + setStats() → setLoading(false)
```

#### **2. Checkout Page State:**
```typescript
// /src/app/checkout/[eventId]/page.tsx

const [event, setEvent] = useState<Event | null>(null);
const [tickets, setTickets] = useState<Ticket[]>([]);
const [cart, setCart] = useState<CartItem[]>([]);
const [submitting, setSubmitting] = useState(false);

// User form state via Yup validation hook
const { values, errors, isValid, handleChange } = useYupValidation(schema, defaults);

// State Flow:
Page Load → fetchEventData() → setEvent() + setTickets()
User Selection → addToCart() → setCart()
Form Input → handleChange() → validation updates
Submit → setSubmitting(true) → API call → redirect
```

#### **3. My Tickets Page State:**
```typescript
// /src/app/tickets/page.tsx

const [tickets, setTickets] = useState<TicketData[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'cancelled'>('all');

// State Flow:
Component Mount → fetchTickets() → setTickets() → setLoading(false)
Filter Change → setFilter() → re-filter tickets display
Action (download/email) → optimistic UI update → API call → toast feedback
```

## 🔄 **State Synchronization**

### **Auth State Sync:**
```
Client-Side Storage:
- localStorage: 'eventhub_token', 'eventhub_user'
- cookies: 'token' (HttpOnly for middleware)

Server-Side Access:
- Middleware reads from cookies
- API calls use Authorization header from localStorage

Sync Process:
1. Login sets both localStorage + cookies
2. checkAuth() ensures both are in sync
3. Logout clears both sources
4. 401 errors trigger automatic cleanup
```

### **API State Management:**

#### **API Service Pattern:**
```typescript
// /src/services/api.service.ts

class ApiService {
  // Request interceptor adds auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('eventhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor handles errors
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Auto logout on 401
        clearAuthData();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}
```

## 📡 **Data Flow Patterns**

### **1. Authentication Flow:**
```
User Login
    ↓
Login Form (local state)
    ↓
API call via apiService.login()
    ↓
Success: AuthContext.login() → Global state update
    ↓
Components re-render → Navbar shows user menu
    ↓
Redirect to dashboard
```

### **2. Event Purchase Flow:**
```
Event Page → Local state (event data)
    ↓
Checkout Page → Local state (cart, form)
    ↓
Payment Page → Local state (transaction)
    ↓
Success Page → Update global auth (points balance)
    ↓
My Tickets → Fresh API call → Local state (tickets)
```

### **3. Navigation State:**
```
Route Change
    ↓
Middleware checks auth (cookies)
    ↓
Protected route: Redirect if not authenticated
Public route: Continue
    ↓
Component mounts → useAuth() reads global state
    ↓
Conditional rendering based on isAuthenticated
```

## 🎯 **State Management Best Practices**

### **1. Separation of Concerns:**
- **Global State**: Authentication, user data, app-wide settings
- **Local State**: Page-specific data, form inputs, UI state
- **Server State**: API responses, cached data

### **2. State Updates:**
```typescript
// ❌ Don't mutate state directly
tickets.push(newTicket);

// ✅ Use immutable updates
setTickets([...tickets, newTicket]);

// ✅ Use functional updates for complex state
setStats(prev => ({
  ...prev,
  totalTickets: prev.totalTickets + 1
}));
```

### **3. Error Handling:**
```typescript
// Consistent error handling pattern
try {
  setLoading(true);
  const response = await apiService.getData();
  setData(response.data);
} catch (error) {
  toast.error('Failed to load data');
  console.error('API Error:', error);
} finally {
  setLoading(false);
}
```

### **4. Loading States:**
```typescript
// Always provide loading feedback
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} retry={refetch} />;
}

return <DataComponent data={data} />;
```

## 🔧 **State Debugging**

### **Debug Tools:**
1. **Debug Auth Page**: `/debug-auth` - Shows auth state in real-time
2. **React DevTools**: Inspect component state and context
3. **Console Logging**: API calls and state changes
4. **Toast Notifications**: User feedback for actions

### **State Inspection:**
```typescript
// Auth state debugging
const { user, token, isAuthenticated, isLoading } = useAuth();
console.log('Auth State:', { user, token, isAuthenticated, isLoading });

// Local state debugging
useEffect(() => {
  console.log('Component State:', { tickets, loading, error });
}, [tickets, loading, error]);
```

## 🚀 **Performance Optimizations**

### **1. Memoization:**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateStats(tickets);
}, [tickets]);

// Memoize callbacks to prevent re-renders
const handleTicketSelect = useCallback((ticketId: number) => {
  setSelectedTickets(prev => [...prev, ticketId]);
}, []);
```

### **2. Optimistic Updates:**
```typescript
// Update UI immediately, rollback on error
const handleTicketPurchase = async () => {
  // Optimistic update
  setTickets(prev => [...prev, newTicket]);
  
  try {
    await apiService.purchaseTicket(ticketData);
    toast.success('Ticket purchased!');
  } catch (error) {
    // Rollback on error
    setTickets(prev => prev.filter(t => t.id !== newTicket.id));
    toast.error('Purchase failed');
  }
};
```

### **3. Lazy Loading:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./Dashboard'));
const MyTickets = lazy(() => import('./MyTickets'));

// Conditional data fetching
useEffect(() => {
  if (isAuthenticated && user) {
    fetchUserData();
  }
}, [isAuthenticated, user]);
```

This state management architecture ensures consistent, predictable, and maintainable state handling across the entire EventHub application.
