import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { deleteCookie } from '@/utils/cookies';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  referralCode?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN' | 'ORGANIZER';
    isVerified: boolean;
    pointBalance: number;
  };
  token: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('eventhub_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('eventhub_token');
            localStorage.removeItem('eventhub_user');
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          }
        } else {
          console.error('API Error:', error);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(data: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
    return this.client.post('/auth/login', data);
  }

  async register(data: RegisterRequest): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.post('/auth/register', data);
  }

  async logout(): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.post('/auth/logout');
  }

  // User methods
  async getProfile(): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.get('/users/profile');
  }

  async updateProfile(data: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.put('/users/profile', data);
  }

  // Events methods
  async getEvents(params?: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.get('/events', { params });
  }

  async getEvent(id: string): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.get(`/events/${id}`);
  }

  async createEvent(data: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.post('/events', data);
  }

  // Transactions methods
  async getTransactions(): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.get('/transactions');
  }

  async createTransaction(data: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.post('/transactions', data);
  }

  // Checkout methods
  async checkout(data: any): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.client.post('/checkout', data);
  }

  // Generic GET request
  async get<T>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, { params });
  }

  // Generic POST request
  async post<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data);
  }

  // Generic PUT request
  async put<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data);
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
};
