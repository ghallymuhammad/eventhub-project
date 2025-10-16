import { axiosInstance } from "./axios/axios.config";
import {
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
  calculateUserStats,
  type MockEvent,
  type MockTicket,
  type MockTransaction
} from "@/data/mockData";

// Flag to determine whether to use mock data or real API
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Helper function to simulate API delay
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses wrapper
const createMockResponse = (data: any, success: boolean = true, message?: string) => {
  return {
    data: {
      success,
      message: message || (success ? 'Success' : 'Error'),
      ...data
    }
  };
};

// Enhanced API utility functions for EventHub operations
export const api = {
  // Authentication endpoints
  auth: {
    login: async (data: { email: string; password: string }) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        // Simulate login success for demo
        if (data.email === mockUser.email) {
          return createMockResponse({
            user: mockUser,
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
          });
        }
        throw new Error('Invalid credentials');
      }
      return axiosInstance.post("/auth/login", data);
    },
    logout: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(300);
        return createMockResponse({});
      }
      return axiosInstance.post("/auth/logout");
    },
    refreshToken: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(300);
        return createMockResponse({ token: 'new-mock-jwt-token' });
      }
      return axiosInstance.post("/auth/refresh");
    },
    resetPassword: (data: { email: string }) =>
      axiosInstance.post("/auth/forgot-password", data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      axiosInstance.put("/auth/change-password", data),
    verifyEmail: (data: { token: string }) =>
      axiosInstance.post("/auth/verify-email", data),
    resendVerification: (data: { email: string }) =>
      axiosInstance.post("/auth/resend-verification", data),
  },

  // User management endpoints
  users: {
    register: (data: any) => axiosInstance.post("/users/register", data),
    getProfile: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return createMockResponse(mockUser);
      }
      return axiosInstance.get("/users/profile");
    },
    updateProfile: (data: any) => axiosInstance.put("/users/profile", data),
    uploadAvatar: (formData: FormData) =>
      axiosInstance.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    getReferralStats: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return createMockResponse({
          referralCount: mockUser.referralCount,
          totalPoints: mockUser.points,
          pendingPoints: 150
        });
      }
      return axiosInstance.get("/users/referral-stats");
    },
    getPointHistory: () => axiosInstance.get("/users/point-history"),
    getCoupons: () => axiosInstance.get("/users/coupons"),
  },

  // Event endpoints
  events: {
    getAll: async (params?: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        let filteredEvents = [...mockEvents];
        
        // Apply filters if provided
        if (params?.category && params.category !== 'all') {
          filteredEvents = filteredEvents.filter(event => 
            event.category.toLowerCase() === params.category.toLowerCase()
          );
        }
        
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
          );
        }
        
        return createMockResponse({ events: filteredEvents });
      }
      return axiosInstance.get("/events", { params });
    },
    getById: async (id: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const event = getEventById(parseInt(id));
        if (!event) {
          throw new Error('Event not found');
        }
        return createMockResponse(event);
      }
      return axiosInstance.get(`/events/${id}`);
    },
    create: async (data: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay(1200);
        const newEvent: MockEvent = {
          id: mockEvents.length + 1,
          ...data,
          availableSeats: data.totalSeats || data.availableSeats,
          organizer: mockUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockEvents.push(newEvent);
        return createMockResponse({ event: newEvent });
      }
      return axiosInstance.post("/events", data);
    },
    update: (id: string, data: any) => axiosInstance.put(`/events/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/events/${id}`),
    uploadImage: async (id: string, formData: FormData) => {
      if (USE_MOCK_DATA) {
        await mockDelay(1500);
        // Simulate successful image upload
        return createMockResponse({ 
          imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop"
        });
      }
      return axiosInstance.post(`/events/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    getAnalytics: (id: string) => axiosInstance.get(`/events/${id}/analytics`),
    getAttendees: (id: string) => axiosInstance.get(`/events/${id}/attendees`),
  },

  // Ticket endpoints
  tickets: {
    getByEventId: async (eventId: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const tickets = getTicketsByEventId(parseInt(eventId));
        return createMockResponse(tickets);
      }
      return axiosInstance.get(`/events/${eventId}/tickets`);
    },
    create: async (eventId: string, data: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay(800);
        const newTicket: MockTicket = {
          id: mockTickets.length + 1,
          eventId: parseInt(eventId),
          ...data,
          totalSeats: data.availableSeats,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockTickets.push(newTicket);
        return createMockResponse({ ticket: newTicket });
      }
      return axiosInstance.post(`/events/${eventId}/tickets`, data);
    },
    update: (id: string, data: any) => axiosInstance.put(`/tickets/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/tickets/${id}`),
  },

  // Transaction endpoints
  transactions: {
    getAll: async (params?: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return createMockResponse({ transactions: mockTransactions });
      }
      return axiosInstance.get("/transactions", { params });
    },
    getById: async (id: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const transaction = getTransactionById(id);
        if (!transaction) {
          throw new Error('Transaction not found');
        }
        return createMockResponse(transaction);
      }
      return axiosInstance.get(`/transactions/${id}`);
    },
    create: async (data: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay(1000);
        const transactionId = generateTransactionId();
        const event = getEventById(data.eventId);
        
        if (!event) {
          throw new Error('Event not found');
        }

        const transactionTickets = data.tickets.map((item: any, index: number) => {
          const ticket = mockTickets.find(t => t.id === item.ticketId);
          return {
            id: mockTransactions.length + index + 1,
            ticketId: item.ticketId,
            quantity: item.quantity,
            unitPrice: ticket?.price || 0,
            totalPrice: (ticket?.price || 0) * item.quantity,
            ticket: ticket!
          };
        });

        const newTransaction: MockTransaction = {
          id: transactionId,
          eventId: data.eventId,
          userId: mockUser.id,
          totalAmount: data.totalAmount,
          status: 'pending',
          paymentMethod: 'BANK_TRANSFER',
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          event,
          user: {
            id: mockUser.id,
            firstName: data.userInfo.firstName,
            lastName: data.userInfo.lastName,
            email: data.userInfo.email,
            phoneNumber: data.userInfo.phoneNumber
          },
          tickets: transactionTickets
        };

        mockTransactions.push(newTransaction);
        return createMockResponse({ transaction: newTransaction });
      }
      return axiosInstance.post("/transactions", data);
    },
    updateStatus: (id: string, data: any) =>
      axiosInstance.put(`/transactions/${id}/status`, data),
    uploadPaymentProof: async (id: string, formData: FormData) => {
      if (USE_MOCK_DATA) {
        await mockDelay(2000);
        // Update transaction status
        const transaction = getTransactionById(id);
        if (transaction) {
          transaction.paymentProofUrl = "https://example.com/payment-proof-uploaded.jpg";
          transaction.updatedAt = new Date().toISOString();
        }
        return createMockResponse({ 
          message: "Payment proof uploaded successfully",
          transaction 
        });
      }
      return axiosInstance.post(`/transactions/${id}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    getMyTransactions: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const userTransactions = getUserTransactions(mockUser.id);
        return createMockResponse(userTransactions);
      }
      return axiosInstance.get("/transactions/my");
    },
    getOrganizerTransactions: () => axiosInstance.get("/transactions/organizer"),
  },

  // Bank accounts for payment
  banks: {
    getAccounts: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(500);
        return createMockResponse({ accounts: mockBankAccounts });
      }
      // This would be a real API endpoint in production
      return Promise.resolve(createMockResponse({ accounts: mockBankAccounts }));
    }
  },

  // Dashboard data
  dashboard: {
    getStats: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const stats = calculateUserStats(mockUser.id);
        return createMockResponse(stats);
      }
      return axiosInstance.get("/dashboard/stats");
    },
    getRevenue: (params?: any) => axiosInstance.get("/dashboard/revenue", { params }),
    getEventPerformance: () => axiosInstance.get("/dashboard/event-performance"),
  },

  // Promotion endpoints
  promotions: {
    getByEventId: (eventId: string) => axiosInstance.get(`/events/${eventId}/promotions`),
    create: (eventId: string, data: any) =>
      axiosInstance.post(`/events/${eventId}/promotions`, data),
    update: (id: string, data: any) => axiosInstance.put(`/promotions/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/promotions/${id}`),
    validate: (code: string, eventId?: string) =>
      axiosInstance.post("/promotions/validate", { code, eventId }),
  },

  // Review endpoints
  reviews: {
    getByEventId: (eventId: string) => axiosInstance.get(`/events/${eventId}/reviews`),
    create: (data: any) => axiosInstance.post("/reviews", data),
    update: (id: string, data: any) => axiosInstance.put(`/reviews/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/reviews/${id}`),
  },

  // Notification endpoints
  notifications: {
    getAll: () => axiosInstance.get("/notifications"),
    markAsRead: (id: string) => axiosInstance.put(`/notifications/${id}/read`),
    markAllAsRead: () => axiosInstance.put("/notifications/read-all"),
    delete: (id: string) => axiosInstance.delete(`/notifications/${id}`),
  },

  // Search endpoints
  search: {
    events: async (query: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay(400);
        const searchTerm = query.toLowerCase();
        const results = mockEvents.filter(event =>
          event.name.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.category.toLowerCase().includes(searchTerm)
        );
        return createMockResponse({ events: results });
      }
      return axiosInstance.get(`/search/events?q=${encodeURIComponent(query)}`);
    },
    suggestions: async (query: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay(200);
        const suggestions = mockEvents
          .filter(event => event.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map(event => ({ id: event.id, name: event.name, category: event.category }));
        return createMockResponse({ suggestions });
      }
      return axiosInstance.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    },
  },

  // Sample endpoints (for testing)
  samples: {
    getAll: () => axiosInstance.get("/samples"),
    create: (data: any) => axiosInstance.post("/samples", data),
    update: (id: string, data: any) => axiosInstance.put(`/samples/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/samples/${id}`),
  },
};

export default api;
