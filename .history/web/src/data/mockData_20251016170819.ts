// Mock data for EventHub - Complete flow from event detail to payment success

export interface MockEvent {
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
  createdAt: string;
  updatedAt: string;
}

export interface MockTicket {
  id: number;
  eventId: number;
  type: 'REGULAR' | 'VIP' | 'EARLY_BIRD' | 'STUDENT';
  name: string;
  description: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockTransaction {
  id: string;
  eventId: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  paymentProofUrl?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  event: MockEvent;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  tickets: Array<{
    id: number;
    ticketId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    ticket: MockTicket;
  }>;
}

export interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  points: number;
  referralCount: number;
  avatar?: string;
  createdAt: string;
}

// Mock Events Data
export const mockEvents: MockEvent[] = [
  {
    id: 1,
    name: "Tech Conference 2025: Future of AI",
    description: "Join us for an incredible journey into the future of artificial intelligence. This comprehensive conference features world-renowned speakers, hands-on workshops, and networking opportunities that will transform your understanding of AI's potential. From machine learning fundamentals to cutting-edge applications in healthcare, finance, and beyond, this event covers it all. Whether you're a seasoned developer, a business leader, or simply curious about AI, you'll find valuable insights and actionable knowledge to take your projects to the next level.",
    category: "TECHNOLOGY",
    location: "Jakarta",
    address: "Grand Indonesia Convention Center, Jl. M.H. Thamrin No. 1, Jakarta Pusat 10310",
    startDate: "2025-11-15T09:00:00Z",
    endDate: "2025-11-15T18:00:00Z",
    price: 0, // Base price, actual pricing from tickets
    availableSeats: 485,
    totalSeats: 500,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    organizer: {
      id: 1,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@techconf.com"
    },
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-15T14:30:00Z"
  },
  {
    id: 2,
    name: "Jakarta Music Festival",
    description: "Experience the most electrifying music festival in Southeast Asia! Jakarta Music Festival brings together international and local artists for three days of non-stop entertainment. From pop to rock, electronic to indie, we've curated an incredible lineup that will keep you dancing from sunset to sunrise. Beyond the music, enjoy gourmet food trucks, art installations, and surprise performances throughout the festival grounds.",
    category: "MUSIC",
    location: "Jakarta",
    address: "Gelora Bung Karno Sports Complex, Jakarta Pusat 10270",
    startDate: "2025-12-20T16:00:00Z",
    endDate: "2025-12-22T23:00:00Z",
    price: 0,
    availableSeats: 2847,
    totalSeats: 3000,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    organizer: {
      id: 2,
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@jakartamusicfest.com"
    },
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-14T16:20:00Z"
  },
  {
    id: 3,
    name: "Startup Pitch Competition",
    description: "Witness the next generation of Indonesian startups as they compete for funding and recognition. This high-energy event features 20 carefully selected startups presenting their innovative solutions to a panel of seasoned investors and industry experts. Attendees will gain insights into the latest trends in technology, business models, and investment strategies while networking with entrepreneurs, investors, and thought leaders.",
    category: "BUSINESS",
    location: "Bandung",
    address: "Trans Luxury Hotel, Jl. Gatot Subroto No. 289, Bandung 40273",
    startDate: "2025-11-08T13:00:00Z",
    endDate: "2025-11-08T20:00:00Z",
    price: 0,
    availableSeats: 198,
    totalSeats: 200,
    isFree: false,
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
    organizer: {
      id: 3,
      firstName: "Diana",
      lastName: "Putri",
      email: "diana.putri@startuppitch.id"
    },
    createdAt: "2025-09-20T11:00:00Z",
    updatedAt: "2025-10-12T09:15:00Z"
  },
  {
    id: 4,
    name: "Community Art Workshop",
    description: "Unleash your creativity in our hands-on community art workshop! This free event is designed to bring together artists of all skill levels for a day of collaborative creation and learning. We'll provide all materials and expert guidance as you explore various mediums including painting, sculpture, and mixed media. It's a perfect opportunity to meet fellow art enthusiasts and create something beautiful together.",
    category: "ARTS",
    location: "Yogyakarta",
    address: "Taman Budaya Yogyakarta, Jl. Sriwedani No. 1, Yogyakarta 55122",
    startDate: "2025-10-25T10:00:00Z",
    endDate: "2025-10-25T16:00:00Z",
    price: 0,
    availableSeats: 47,
    totalSeats: 50,
    isFree: true,
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
    organizer: {
      id: 4,
      firstName: "Rini",
      lastName: "Sari",
      email: "rini.sari@artcommunity.org"
    },
    createdAt: "2025-10-05T08:00:00Z",
    updatedAt: "2025-10-16T12:45:00Z"
  }
];

// Mock Tickets Data
export const mockTickets: MockTicket[] = [
  // Tech Conference Tickets
  {
    id: 1,
    eventId: 1,
    type: "EARLY_BIRD",
    name: "Early Bird Special",
    description: "Get the best price with our early bird offer. Includes all conference sessions, lunch, and networking event.",
    price: 75000000, // 750,000 IDR in cents
    availableSeats: 95,
    totalSeats: 100,
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-16T14:30:00Z"
  },
  {
    id: 2,
    eventId: 1,
    type: "REGULAR",
    name: "Regular Admission",
    description: "Standard conference ticket including all sessions, lunch, and materials.",
    price: 100000000, // 1,000,000 IDR in cents
    availableSeats: 290,
    totalSeats: 300,
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-16T14:30:00Z"
  },
  {
    id: 3,
    eventId: 1,
    type: "VIP",
    name: "VIP Experience",
    description: "Premium access with front-row seating, exclusive networking session, signed book, and premium lunch.",
    price: 200000000, // 2,000,000 IDR in cents
    availableSeats: 85,
    totalSeats: 100,
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-16T14:30:00Z"
  },

  // Music Festival Tickets
  {
    id: 4,
    eventId: 2,
    type: "EARLY_BIRD",
    name: "Early Bird 3-Day Pass",
    description: "Complete 3-day festival experience at the best price. Limited time offer!",
    price: 150000000, // 1,500,000 IDR in cents
    availableSeats: 847,
    totalSeats: 1000,
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-16T16:20:00Z"
  },
  {
    id: 5,
    eventId: 2,
    type: "REGULAR",
    name: "Regular 3-Day Pass",
    description: "Full festival access for all three days with camping area access.",
    price: 200000000, // 2,000,000 IDR in cents
    availableSeats: 1500,
    totalSeats: 1500,
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-16T16:20:00Z"
  },
  {
    id: 6,
    eventId: 2,
    type: "VIP",
    name: "VIP Festival Experience",
    description: "Premium experience with backstage access, artist meet & greet, VIP lounge, and premium food & drinks.",
    price: 500000000, // 5,000,000 IDR in cents
    availableSeats: 450,
    totalSeats: 500,
    createdAt: "2025-09-15T09:00:00Z",
    updatedAt: "2025-10-16T16:20:00Z"
  },

  // Startup Pitch Tickets
  {
    id: 7,
    eventId: 3,
    type: "REGULAR",
    name: "General Admission",
    description: "Access to all pitch presentations and networking session.",
    price: 50000000, // 500,000 IDR in cents
    availableSeats: 150,
    totalSeats: 150,
    createdAt: "2025-09-20T11:00:00Z",
    updatedAt: "2025-10-16T09:15:00Z"
  },
  {
    id: 8,
    eventId: 3,
    type: "STUDENT",
    name: "Student Discount",
    description: "Special pricing for students with valid student ID. Same access as regular admission.",
    price: 25000000, // 250,000 IDR in cents
    availableSeats: 43,
    totalSeats: 50,
    createdAt: "2025-09-20T11:00:00Z",
    updatedAt: "2025-10-16T09:15:00Z"
  }
];

// Mock User Data
export const mockUser: MockUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phoneNumber: "+62 812 3456 7890",
  points: 1250,
  referralCount: 3,
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  createdAt: "2025-01-15T10:30:00Z"
};

// Mock Transactions Data
export const mockTransactions: MockTransaction[] = [
  {
    id: "TXN-001-20251016-001",
    eventId: 1,
    userId: 1,
    totalAmount: 175000000, // 1,750,000 IDR in cents
    status: "confirmed",
    paymentMethod: "BANK_TRANSFER",
    paymentProofUrl: "https://example.com/payment-proof-1.jpg",
    expiresAt: "2025-10-18T12:00:00Z",
    createdAt: "2025-10-16T10:30:00Z",
    updatedAt: "2025-10-16T14:45:00Z",
    event: mockEvents[0],
    user: mockUser,
    tickets: [
      {
        id: 1,
        ticketId: 1,
        quantity: 1,
        unitPrice: 75000000,
        totalPrice: 75000000,
        ticket: mockTickets[0]
      },
      {
        id: 2,
        ticketId: 2,
        quantity: 1,
        unitPrice: 100000000,
        totalPrice: 100000000,
        ticket: mockTickets[1]
      }
    ]
  },
  {
    id: "TXN-002-20251016-002",
    eventId: 2,
    userId: 1,
    totalAmount: 350000000, // 3,500,000 IDR in cents
    status: "pending",
    paymentMethod: "BANK_TRANSFER",
    expiresAt: "2025-10-18T15:30:00Z",
    createdAt: "2025-10-16T13:30:00Z",
    updatedAt: "2025-10-16T13:30:00Z",
    event: mockEvents[1],
    user: mockUser,
    tickets: [
      {
        id: 3,
        ticketId: 4,
        quantity: 2,
        unitPrice: 150000000,
        totalPrice: 300000000,
        ticket: mockTickets[3]
      },
      {
        id: 4,
        ticketId: 5,
        quantity: 1,
        unitPrice: 50000000,
        totalPrice: 50000000,
        ticket: mockTickets[4]
      }
    ]
  },
  {
    id: "TXN-003-20251015-001",
    eventId: 3,
    userId: 1,
    totalAmount: 75000000, // 750,000 IDR in cents
    status: "confirmed",
    paymentMethod: "BANK_TRANSFER",
    paymentProofUrl: "https://example.com/payment-proof-3.jpg",
    expiresAt: "2025-10-17T10:00:00Z",
    createdAt: "2025-10-15T08:00:00Z",
    updatedAt: "2025-10-15T11:20:00Z",
    event: mockEvents[2],
    user: mockUser,
    tickets: [
      {
        id: 5,
        ticketId: 7,
        quantity: 1,
        unitPrice: 50000000,
        totalPrice: 50000000,
        ticket: mockTickets[6]
      },
      {
        id: 6,
        ticketId: 8,
        quantity: 1,
        unitPrice: 25000000,
        totalPrice: 25000000,
        ticket: mockTickets[7]
      }
    ]
  }
];

// Bank Account Details for Payment
export const mockBankAccounts = [
  {
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "1234567890",
    accountName: "PT EventHub Indonesia",
    bankCode: "BCA"
  },
  {
    bankName: "Bank Mandiri",
    accountNumber: "9876543210",
    accountName: "PT EventHub Indonesia",
    bankCode: "MANDIRI"
  },
  {
    bankName: "Bank Negara Indonesia (BNI)",
    accountNumber: "5555666677",
    accountName: "PT EventHub Indonesia",
    bankCode: "BNI"
  }
];

// Helper functions
export const getEventById = (id: number): MockEvent | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const getTicketsByEventId = (eventId: number): MockTicket[] => {
  return mockTickets.filter(ticket => ticket.eventId === eventId);
};

export const getTransactionById = (id: string): MockTransaction | undefined => {
  return mockTransactions.find(transaction => transaction.id === id);
};

export const getUserTransactions = (userId: number): MockTransaction[] => {
  return mockTransactions.filter(transaction => transaction.userId === userId);
};

export const generateTransactionId = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TXN-${randomNum}-${dateStr}-${timeStr}`;
};

// Calculate totals and stats
export const calculateUserStats = (userId: number) => {
  const userTransactions = getUserTransactions(userId);
  const confirmedTransactions = userTransactions.filter(t => t.status === 'confirmed');
  
  return {
    totalEvents: confirmedTransactions.length,
    totalSpent: confirmedTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
    totalTickets: confirmedTransactions.reduce((sum, t) => 
      sum + t.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0), 0
    ),
    upcomingEvents: confirmedTransactions.filter(t => 
      new Date(t.event.startDate) > new Date()
    ).length,
    points: mockUser.points,
    referralCount: mockUser.referralCount
  };
};

const mockData = {
  mockEvents,
  mockTickets,
  mockTransactions,
  mockUser,
  mockBankAccounts,
  getEventById,
  getTicketsByEventId,
  getTransactionById,
  getUserTransactions,
  generateTransactionId,
  calculateUserStats
};

export default mockData;
