import { useState, useEffect } from 'react';

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

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
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
  }, []);

  return authState;
}

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
