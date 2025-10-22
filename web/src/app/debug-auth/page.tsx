'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/utils/cookies';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    // Check cookies and localStorage
    setCookieToken(getCookie('token'));
    setLocalStorageToken(localStorage.getItem('eventhub_token'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
          
          <div className="space-y-6">
            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Auth Context State</h2>
              <div className="text-white/80 space-y-2">
                <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
                <p><strong>Token (Context):</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Storage State</h2>
              <div className="text-white/80 space-y-2">
                <p><strong>Cookie Token:</strong> {cookieToken ? `${cookieToken.substring(0, 20)}...` : 'null'}</p>
                <p><strong>LocalStorage Token:</strong> {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'null'}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Test Navigation</h2>
              <div className="space-y-3">
                <a href="/dashboard" className="block text-blue-400 hover:text-blue-300">Go to Dashboard</a>
                <a href="/tickets" className="block text-blue-400 hover:text-blue-300">Go to My Tickets</a>
                <a href="/profile" className="block text-blue-400 hover:text-blue-300">Go to Profile</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
