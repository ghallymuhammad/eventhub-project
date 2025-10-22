'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  const refreshAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user_data');
      
      let user = null;
      if (userDataStr) {
        try {
          user = JSON.parse(userDataStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user_data');
        }
      }

      setAuthState({
        isAuthenticated: !!(token && user),
        user,
        token,
        loading: false,
      });
    }
  };

  const login = (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=strict`;
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
      });
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Legacy functions for backward compatibility
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}

export function setAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=strict`;
  }
}
