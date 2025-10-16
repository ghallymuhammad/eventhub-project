// Authentication DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'USER' | 'ORGANIZER' | 'ADMIN';
  referralCode?: string; // Referral code used during registration
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  email: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

// Event DTOs
export interface CreateEventDto {
  name: string;
  description: string;
  category: 'MUSIC' | 'TECHNOLOGY' | 'BUSINESS' | 'SPORTS' | 'ARTS' | 'FOOD' | 'EDUCATION' | 'HEALTH' | 'OTHER';
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  isFree: boolean;
  imageUrl?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventFilters {
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Transaction DTOs
export interface CreateTransactionDto {
  eventId: number;
  tickets: {
    ticketId: number;
    quantity: number;
  }[];
  promotionCode?: string;
  couponCode?: string;
  pointsToUse?: number;
}

export interface UpdateTransactionStatusDto {
  status: 'WAITING_FOR_ADMIN_CONFIRMATION' | 'DONE' | 'REJECTED';
  notes?: string;
}

// Review DTOs
export interface CreateReviewDto {
  eventId: number;
  rating: number;
  comment?: string;
}

// Promotion DTOs
export interface CreatePromotionDto {
  eventId: number;
  code: string;
  name: string;
  description?: string;
  discount: number;
  isPercentage: boolean;
  maxUses: number;
  startDate: string;
  endDate: string;
}

// Coupon DTOs
export interface CreateCouponDto {
  userId: number;
  eventId?: number;
  type: 'VOUCHER' | 'REWARD' | 'REFERRAL';
  name: string;
  description?: string;
  discount: number;
  isPercentage: boolean;
  expiryDate: string;
}

// Dashboard DTOs
export interface DashboardStatsDto {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalCustomers: number;
  recentTransactions: any[];
  monthlyRevenue: { month: string; revenue: number }[];
  eventPerformance: { eventId: number; name: string; revenue: number; ticketsSold: number }[];
}

export interface EventAnalyticsDto {
  eventId: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalViews: number;
  dailyStats: { date: string; revenue: number; ticketsSold: number }[];
  attendeeList: {
    userId: number;
    name: string;
    email: string;
    ticketType: string;
    quantity: number;
    totalPaid: number;
    transactionStatus: string;
  }[];
}

// Referral DTOs
export interface ReferralStatsDto {
  totalReferrals: number;
  totalPointsEarned: number;
  referralHistory: {
    referredUser: string;
    dateReferred: string;
    pointsEarned: number;
    status: string;
  }[];
}

// Point DTOs
export interface PointHistoryDto {
  id: number;
  points: number;
  description: string;
  createdAt: string;
  expiryDate?: string;
}

// Notification DTOs
export interface CreateNotificationDto {
  userId: number;
  type: 'TRANSACTION_ACCEPTED' | 'TRANSACTION_REJECTED' | 'PAYMENT_REMINDER' | 'EVENT_REMINDER' | 'REFERRAL_REWARD';
  title: string;
  message: string;
  metadata?: any;
}

// Upload DTOs
export interface UploadFileDto {
  file: Express.Multer.File;
  folder?: string;
}
