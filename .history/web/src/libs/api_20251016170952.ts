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

// API utility functions for EventHub operations
export const api = {
  // Authentication endpoints
  auth: {
    login: (data: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", data),
    logout: () => axiosInstance.post("/auth/logout"),
    refreshToken: () => axiosInstance.post("/auth/refresh"),
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
    getProfile: () => axiosInstance.get("/users/profile"),
    updateProfile: (data: any) => axiosInstance.put("/users/profile", data),
    uploadAvatar: (formData: FormData) =>
      axiosInstance.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    getReferralStats: () => axiosInstance.get("/users/referral-stats"),
    getPointHistory: () => axiosInstance.get("/users/point-history"),
    getCoupons: () => axiosInstance.get("/users/coupons"),
  },

  // Event endpoints
  events: {
    getAll: async (params?: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay();
        let filteredEvents = [...mockEvents];
        
        if (params?.category && params.category !== 'all') {
          filteredEvents = filteredEvents.filter(event => 
            event.category.toLowerCase() === params.category.toLowerCase()
          );
        }
        
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
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
    uploadImage: (id: string, formData: FormData) =>
      axiosInstance.post(`/events/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    getAnalytics: (id: string) => axiosInstance.get(`/events/${id}/analytics`),
    getAttendees: (id: string) => axiosInstance.get(`/events/${id}/attendees`),
  },

  // Ticket endpoints
  tickets: {
    getByEventId: (eventId: string) => axiosInstance.get(`/events/${eventId}/tickets`),
    create: (eventId: string, data: any) =>
      axiosInstance.post(`/events/${eventId}/tickets`, data),
    update: (id: string, data: any) => axiosInstance.put(`/tickets/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/tickets/${id}`),
  },

  // Transaction endpoints
  transactions: {
    getAll: (params?: any) => axiosInstance.get("/transactions", { params }),
    getById: (id: string) => axiosInstance.get(`/transactions/${id}`),
    create: (data: any) => axiosInstance.post("/transactions", data),
    updateStatus: (id: string, data: any) =>
      axiosInstance.put(`/transactions/${id}/status`, data),
    uploadPaymentProof: (id: string, formData: FormData) =>
      axiosInstance.post(`/transactions/${id}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    getMyTransactions: () => axiosInstance.get("/transactions/my"),
    getOrganizerTransactions: () => axiosInstance.get("/transactions/organizer"),
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

  // Dashboard endpoints
  dashboard: {
    getStats: () => axiosInstance.get("/dashboard/stats"),
    getRevenue: (params?: any) => axiosInstance.get("/dashboard/revenue", { params }),
    getEventPerformance: () => axiosInstance.get("/dashboard/event-performance"),
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
    events: (query: string) => axiosInstance.get(`/search/events?q=${encodeURIComponent(query)}`),
    suggestions: (query: string) =>
      axiosInstance.get(`/search/suggestions?q=${encodeURIComponent(query)}`),
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
