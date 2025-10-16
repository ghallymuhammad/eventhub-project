# EventHub - Event Detail Page Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                          NAVBAR (Reused)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        HERO SECTION                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │              EVENT IMAGE / GRADIENT BACKGROUND            │  │
│  │                                                           │  │
│  │    [Share] [Favorite]                    (Floating)      │  │
│  │                                                           │  │
│  │    [Category Badge]                                      │  │
│  │    Event Title (Large)                                   │  │
│  │    📍 Location  📅 Date  👥 Seats Available              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────┐
│     LEFT COLUMN (2/3 width)      │  RIGHT COLUMN (1/3, sticky)  │
│                                  │                              │
│  ┌────────────────────────────┐  │  ┌────────────────────────┐ │
│  │  ⏰ EVENT STARTS IN        │  │  │  🎟️ SELECT TICKETS    │ │
│  │  [DD] [HH] [MM] [SS]       │  │  │                        │ │
│  │  Days Hours Mins Secs      │  │  │  ┌──────────────────┐  │ │
│  └────────────────────────────┘  │  │  │ VIP Ticket       │  │ │
│                                  │  │  │ IDR 500,000      │  │ │
│  ┌────────────────────────────┐  │  │  │ 50 seats left    │  │ │
│  │  📝 ABOUT THIS EVENT       │  │  │  │ [ - ] 0 [ + ]    │  │ │
│  │                            │  │  │  └──────────────────┘  │ │
│  │  Event description text... │  │  │                        │ │
│  │  Multiple paragraphs...    │  │  │  ┌──────────────────┐  │ │
│  └────────────────────────────┘  │  │  │ Regular Ticket   │  │ │
│                                  │  │  │ IDR 300,000      │  │ │
│  ┌────────────────────────────┐  │  │  │ 100 seats left   │  │ │
│  │  📋 EVENT DETAILS          │  │  │  │ [ - ] 2 [ + ]    │  │ │
│  │                            │  │  │  └──────────────────┘  │ │
│  │  📅 Date & Time            │  │  │                        │ │
│  │  📍 Location & Address     │  │  │  ────────────────────  │ │
│  │  🏷️ Category               │  │  │  Total: IDR 600,000   │ │
│  │  👥 Available Seats        │  │  │  [Purchase Tickets]   │ │
│  │      [Progress Bar]        │  │  └────────────────────────┘ │
│  └────────────────────────────┘  │                              │
│                                  │  ┌────────────────────────┐ │
│  ┌────────────────────────────┐  │  │  ✅ EVENT GUARANTEED  │ │
│  │  👤 ORGANIZER              │  │  │  This event will      │ │
│  │                            │  │  │  definitely happen    │ │
│  │  [Avatar] John Doe         │  │  └────────────────────────┘ │
│  │          john@email.com    │  │                              │
│  └────────────────────────────┘  │                              │
│                                  │                              │
│  ┌────────────────────────────┐  │                              │
│  │  ⭐ REVIEWS (4.5)          │  │                              │
│  │                            │  │                              │
│  │  ┌──────────────────────┐  │  │                              │
│  │  │ [👤] Jane Smith      │  │  │                              │
│  │  │ ⭐⭐⭐⭐⭐            │  │  │                              │
│  │  │ "Great event!"       │  │  │                              │
│  │  └──────────────────────┘  │  │                              │
│  │                            │  │                              │
│  │  ┌──────────────────────┐  │  │                              │
│  │  │ [👤] Bob Jones       │  │  │                              │
│  │  │ ⭐⭐⭐⭐☆            │  │  │                              │
│  │  │ "Enjoyed it!"        │  │  │                              │
│  │  └──────────────────────┘  │  │                              │
│  │                            │  │                              │
│  │  [Show All Reviews (15) ▼] │  │                              │
│  └────────────────────────────┘  │                              │
│                                  │                              │
└──────────────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FOOTER (Reused)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              SHARE MODAL (Overlay, Conditional)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Share Event                                          [X] │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐                     │  │
│  │  │  📘 Facebook │  │  🐦 Twitter  │                     │  │
│  │  └──────────────┘  └──────────────┘                     │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────┐                     │  │
│  │  │       📧 Email                  │                     │  │
│  │  └─────────────────────────────────┘                     │  │
│  │                                                           │  │
│  │  Or copy link:                                           │  │
│  │  ┌──────────────────────────┐ [Copy]                    │  │
│  │  │ https://eventhub.com/... │                           │  │
│  │  └──────────────────────────┘                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
EventDetailPage
├── ShareModal (conditional overlay)
├── Hero Section
│   ├── Event Image (Next.js Image)
│   ├── Gradient Overlay
│   ├── Floating Action Buttons
│   │   ├── Share Button
│   │   └── Favorite Button
│   └── Event Header
│       ├── Category Badge
│       ├── Event Title
│       └── Quick Info (Location, Date, Seats)
│
├── Main Content (Grid Layout)
│   ├── Left Column (Event Information)
│   │   ├── Countdown Card
│   │   │   └── Countdown Component (reused)
│   │   │
│   │   ├── About Card
│   │   │   └── Event Description
│   │   │
│   │   ├── Details Card
│   │   │   ├── Date & Time Info
│   │   │   ├── Location Info
│   │   │   ├── Category Info
│   │   │   └── Seats Progress
│   │   │
│   │   ├── Organizer Card
│   │   │   ├── Avatar
│   │   │   └── Contact Info
│   │   │
│   │   └── Reviews Card
│   │       ├── Rating Summary
│   │       ├── Review List
│   │       │   └── Review Item (loop)
│   │       │       ├── User Avatar
│   │       │       ├── Star Rating
│   │       │       ├── Comment
│   │       │       └── Timestamp
│   │       └── Show More Button
│   │
│   └── Right Column (Ticket Selection - Sticky)
│       ├── Ticket Selection Card
│       │   ├── Ticket List
│       │   │   └── Ticket Item (loop)
│       │   │       ├── Ticket Info
│       │   │       ├── Type Badge
│       │   │       ├── Price
│       │   │       ├── Seats Available
│       │   │       └── Quantity Selector
│       │   │           ├── Decrease Button
│       │   │           ├── Quantity Display
│       │   │           └── Increase Button
│       │   ├── Total Display
│       │   └── Purchase Button
│       │
│       └── Event Status Card
│           └── Guaranteed Badge
```

## State Management

```typescript
// Component State
const [event, setEvent]                     // Event data
const [tickets, setTickets]                 // Available tickets
const [reviews, setReviews]                 // Event reviews
const [loading, setLoading]                 // Loading state
const [selectedTickets, setSelectedTickets] // Cart items
const [showAllReviews, setShowAllReviews]   // Review expansion
const [isFavorite, setIsFavorite]           // Favorite status
const [showShareModal, setShowShareModal]   // Share modal visibility
```

## Data Flow

```
1. Component Mounts
   ↓
2. useEffect triggers fetchEventData()
   ↓
3. Parallel API Calls
   ├─→ api.events.getById(eventId)
   ├─→ api.tickets.getByEventId(eventId)
   └─→ api.reviews.getByEventId(eventId)
   ↓
4. Update State
   ├─→ setEvent(eventData)
   ├─→ setTickets(ticketsData)
   └─→ setReviews(reviewsData)
   ↓
5. Render Complete UI
```

## User Interactions Flow

```
Ticket Selection:
  Click [+] → handleTicketQuantityChange()
           → Update selectedTickets state
           → Re-calculate total
           → Update Purchase button state

Share Event:
  Click Share → setShowShareModal(true)
              → ShareModal renders
              → Choose platform
              → Open share dialog / Copy link

Favorite:
  Click Heart → toggleFavorite()
              → Update isFavorite state
              → Animate heart icon
              → Show toast notification

Review Expansion:
  Click "Show All" → setShowAllReviews(true)
                   → Render all reviews
                   → Change button to "Show Less"

Purchase:
  Click Purchase → handlePurchase()
                 → Validate selection
                 → Show toast
                 → (TODO: Navigate to checkout)
```

## Responsive Behavior

```
Mobile (< 768px):
┌─────────────┐
│    Hero     │
├─────────────┤
│  Countdown  │
├─────────────┤
│   About     │
├─────────────┤
│  Details    │
├─────────────┤
│ Organizer   │
├─────────────┤
│  Reviews    │
├─────────────┤
│  Tickets    │
└─────────────┘

Desktop (> 1024px):
┌────────────┬────────┐
│    Hero            │
├────────────┬────────┤
│ Countdown  │Tickets │
│   About    │(sticky)│
│  Details   │        │
│ Organizer  │Status  │
│  Reviews   │        │
└────────────┴────────┘
```
