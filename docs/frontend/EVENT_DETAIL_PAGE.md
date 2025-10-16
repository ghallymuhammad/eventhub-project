# Event Detail Page Documentation

## Overview
The Event Detail Page is a comprehensive, modern event viewing experience built with Next.js 14, React, and TypeScript. It features a beautiful glassmorphism design that matches the EventHub landing page aesthetic.

## File Structure
```
/web/src/
  ├── app/
  │   └── events/
  │       └── [id]/
  │           └── page.tsx          # Dynamic route for event detail
  ├── components/
  │   ├── EventDetailPage.tsx       # Main event detail component
  │   ├── ShareModal.tsx            # Social sharing modal
  │   └── Countdown.tsx             # Countdown timer (reused)
  └── libs/
      └── api.ts                    # API utilities
```

## Features

### 1. **Hero Section**
- Full-width event image with gradient overlay
- Event title, category badge, location, date, and seat availability
- Floating action buttons for share and favorite

### 2. **Countdown Timer**
- Real-time countdown to event start
- Glassmorphism card design
- Reuses the existing Countdown component

### 3. **Event Information**
- **About Section**: Full event description
- **Event Details Grid**:
  - Date & Time with icons
  - Location & Address
  - Category
  - Available Seats with progress bar

### 4. **Organizer Information**
- Organizer name and contact
- Avatar placeholder with gradient background

### 5. **Reviews Section**
- Average rating display with star rating
- Individual reviews with:
  - User avatar
  - Star ratings
  - Comments
  - Timestamp
- "Show More/Less" toggle for reviews (displays 3 initially)
- Empty state for events with no reviews

### 6. **Ticket Selection (Sticky Sidebar)**
- **Multiple Ticket Types**:
  - Regular, VIP, Early Bird, Student
  - Color-coded badges
  - Price display
  - Available seats counter
- **Quantity Selector**:
  - Increment/decrement buttons
  - Prevents over-booking
  - Real-time total calculation
- **Purchase Button**:
  - Disabled when no tickets selected
  - Shows total amount
  - Gradient hover effect

### 7. **Interactive Features**
- **Share Event**:
  - Custom share modal
  - Facebook, Twitter, Email sharing
  - Copy link to clipboard
  - Responsive design
- **Favorite/Save Event**:
  - Toggle favorite state
  - Heart icon with fill animation
  - Toast notifications

### 8. **Event Status Badge**
- "Event Guaranteed" indicator
- Glassmorphism design

## API Integration

The page uses the following API endpoints:

```typescript
// Fetch event details
api.events.getById(eventId)

// Fetch available tickets
api.tickets.getByEventId(eventId)

// Fetch event reviews
api.reviews.getByEventId(eventId)
```

## Data Models

### Event
```typescript
interface EventData {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  isFree: boolean;
  imageUrl?: string;
  organizer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

### Ticket
```typescript
interface Ticket {
  id: number;
  type: string; // REGULAR, VIP, EARLY_BIRD, STUDENT
  name: string;
  description?: string;
  price: number;
  availableSeats: number;
}
```

### Review
```typescript
interface Review {
  id: number;
  rating: number; // 1-5
  comment?: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}
```

## Styling

### Glassmorphism Effects
- Uses custom `.glassmorphism` class
- Backdrop blur and semi-transparent backgrounds
- Smooth hover transitions

### Color Scheme
- Primary: Purple (#9333EA) to Blue (#3B82F6) gradients
- Background: Dark gradient from purple-900 to black
- Accents: Yellow for ratings, Green for success states

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - `md:` 768px (tablet)
  - `lg:` 1024px (desktop)
- Sticky sidebar on desktop
- Stacked layout on mobile

### Animations
- Fade-in animation for cards (`.animate-fadeIn`)
- Hover scale effects
- Progress bar transitions
- Star rating hover pulse

## User Interactions

### Ticket Selection Flow
1. User clicks + button on desired ticket type
2. Quantity increases (max: available seats)
3. Total amount updates in real-time
4. User clicks "Purchase Tickets"
5. Validates selection (minimum 1 ticket)
6. Proceeds to checkout (TODO: implement)

### Share Flow
1. User clicks share button
2. Share modal opens
3. Options:
   - Social media share (Facebook, Twitter)
   - Email share
   - Copy link to clipboard
4. Success toast notification

### Favorite Flow
1. User clicks heart icon
2. Toggle favorite state
3. Icon fills/unfills with animation
4. Toast notification confirms action

## Error Handling

### Loading State
- Full-screen spinner with gradient background
- Smooth transition to content

### Event Not Found
- Friendly error message
- Alert icon
- "Back to Home" button

### API Errors
- Toast notifications for fetch failures
- Graceful fallbacks (empty arrays for tickets/reviews)

## Accessibility

- Semantic HTML elements
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images
- Keyboard navigation support
- Disabled state for buttons
- ARIA labels (can be enhanced)

## Performance Optimizations

1. **Parallel Data Fetching**:
   ```typescript
   Promise.all([
     api.events.getById(eventId),
     api.tickets.getByEventId(eventId),
     api.reviews.getByEventId(eventId),
   ])
   ```

2. **Next.js Image Optimization**:
   - Uses `next/image` for automatic optimization
   - Lazy loading
   - Responsive images

3. **Conditional Rendering**:
   - Only renders reviews when data is available
   - Lazy loads "Show All Reviews" section

## Future Enhancements

### TODO: Implement Checkout Flow
```typescript
const handlePurchase = () => {
  // 1. Create transaction
  // 2. Navigate to checkout page
  // 3. Payment processing
  // 4. Confirmation
}
```

### Potential Features
- [ ] Add to calendar functionality
- [ ] Event directions/map integration
- [ ] Similar events recommendations
- [ ] Live chat with organizer
- [ ] QR code for ticket
- [ ] Email reminders
- [ ] Social proof (e.g., "150 people are viewing this event")
- [ ] Early bird/flash sale countdown
- [ ] Group booking discounts
- [ ] Wishlist persistence
- [ ] Review submission form
- [ ] Photo gallery
- [ ] Video preview
- [ ] Event FAQ section

## Testing Checklist

- [ ] Load event with valid ID
- [ ] Load event with invalid ID (404 handling)
- [ ] Select and deselect tickets
- [ ] Test quantity limits
- [ ] Share on different platforms
- [ ] Toggle favorite
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Review pagination
- [ ] Loading states
- [ ] Error states
- [ ] Empty states (no tickets, no reviews)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

```json
{
  "lucide-react": "^0.x.x",
  "sonner": "^1.x.x",
  "next": "^14.x.x",
  "react": "^18.x.x"
}
```

## Usage

```typescript
// In page component
import EventDetailPage from '@/components/EventDetailPage';

export default function EventPage({ params }: { params: { id: string } }) {
  return <EventDetailPage eventId={params.id} />;
}
```

Navigate to: `/events/[id]` (e.g., `/events/1`)

## Notes

- Ensure API endpoints return data matching the interfaces
- Event images should be served from a CDN for best performance
- Consider implementing caching for frequently accessed events
- Add authentication checks before allowing ticket purchases
- Implement rate limiting on the share functionality
