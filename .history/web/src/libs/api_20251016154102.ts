import { axiosInstance } from "./axios/axios.config";

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
    getAll: (params?: any) => axiosInstance.get("/events", { params }),
    getById: (id: string) => axiosInstance.get(`/events/${id}`),
    create: (data: any) => axiosInstance.post("/events", data),
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
