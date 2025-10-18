"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'USER' | 'ORGANIZER' | 'ADMIN';
  redirectTo?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token && requireAuth) {
          const currentPath = window.location.pathname;
          router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`);
          return;
        }

        if (token) {
          // Verify token with API
          const response = await fetch('http://localhost:8000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.data);
            setIsAuthenticated(true);

            // Check role if required
            if (requireRole && userData.data.role !== requireRole) {
              toast.error(`Access denied. ${requireRole} role required.`);
              router.push('/');
              return;
            }
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            if (requireAuth) {
              const currentPath = window.location.pathname;
              router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          toast.error('Authentication failed. Please login again.');
          const currentPath = window.location.pathname;
          router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`);
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, requireRole, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.data);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
