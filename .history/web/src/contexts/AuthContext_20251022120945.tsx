'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookies';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'ORGANIZER';
  isVerified: boolean;
  pointBalance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check authentication on mount
  const checkAuth = () => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('eventhub_token');
      const userDataStr = localStorage.getItem('eventhub_user');

      if (token && userDataStr) {
        const user = JSON.parse(userDataStr);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear corrupted data
      localStorage.removeItem('eventhub_token');
      localStorage.removeItem('eventhub_user');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // Login function
  const login = (token: string, user: User) => {
    if (typeof window === 'undefined') return;

    try {
      // Store in localStorage
      localStorage.setItem('eventhub_token', token);
      localStorage.setItem('eventhub_user', JSON.stringify(user));
      
      // Also store token in cookie for middleware access
      setCookie('token', token, 7); // 7 days
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Welcome back, ${user.firstName}!`);
    } catch (error) {
      console.error('Error storing auth data:', error);
      toast.error('Failed to save authentication data');
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window === 'undefined') return;

    try {
      // Clear localStorage
      localStorage.removeItem('eventhub_token');
      localStorage.removeItem('eventhub_user');
      
      // Clear cookie
      deleteCookie('token');
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user data
  const updateUser = (user: User) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('eventhub_user', JSON.stringify(user));
      setState(prev => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User, AuthState, AuthContextType };
