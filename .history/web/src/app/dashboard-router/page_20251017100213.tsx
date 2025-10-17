"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/hooks/useAuth';

export default function DashboardRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = () => {
      try {
        const userData = localStorage.getItem('user_data');
        
        if (userData) {
          const user = JSON.parse(userData);
          const role = user.role;
          
          switch (role) {
            case 'ADMIN':
              router.replace('/admin');
              break;
            case 'ORGANIZER':
              router.replace('/organizer');
              break;
            case 'USER':
            default:
              router.replace('/dashboard');
              break;
          }
        } else {
          // If no user data, redirect to login
          router.replace('/login?returnTo=' + encodeURIComponent('/dashboard-router'));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.replace('/login?returnTo=' + encodeURIComponent('/dashboard-router'));
      } finally {
        setLoading(false);
      }
    };

    redirectToDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
