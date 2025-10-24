'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/utils/cookies';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const { user, token, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [allCookies, setAllCookies] = useState<string>('');
  const router = useRouter();

  const refreshData = () => {
    setCookieToken(getCookie('token'));
    setLocalStorageToken(localStorage.getItem('eventhub_token'));
    setAllCookies(document.cookie);
    checkAuth(); // Refresh auth context
  };

  useEffect(() => {
    refreshData();
  }, []);

  const testCheckout = () => {
    router.push('/checkout/1'); // Test with event ID 1
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Authentication Debug</h1>
            <button 
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Auth Context State</h2>
              <div className="text-white/80 space-y-2 text-sm font-mono">
                <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
                <p><strong>Token (Context):</strong> {token ? `${token.substring(0, 30)}...` : 'null'}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Storage State</h2>
              <div className="text-white/80 space-y-2 text-sm font-mono">
                <p><strong>Cookie Token:</strong> {cookieToken ? `${cookieToken.substring(0, 30)}...` : 'null'}</p>
                <p><strong>LocalStorage Token:</strong> {localStorageToken ? `${localStorageToken.substring(0, 30)}...` : 'null'}</p>
                <p><strong>Tokens Match:</strong> {cookieToken && localStorageToken ? (cookieToken === localStorageToken ? 'Yes' : 'No') : 'N/A'}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">All Cookies</h2>
              <div className="text-white/80 text-sm font-mono bg-black/30 p-3 rounded overflow-auto">
                {allCookies || 'No cookies found'}
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Test Navigation</h2>
              <div className="grid grid-cols-2 gap-3">
                <a href="/dashboard" className="block text-blue-400 hover:text-blue-300 p-2 bg-black/20 rounded">Go to Dashboard</a>
                <a href="/tickets" className="block text-blue-400 hover:text-blue-300 p-2 bg-black/20 rounded">Go to My Tickets</a>
                <a href="/profile" className="block text-blue-400 hover:text-blue-300 p-2 bg-black/20 rounded">Go to Profile</a>
                <button 
                  onClick={testCheckout}
                  className="text-orange-400 hover:text-orange-300 p-2 bg-black/20 rounded text-left"
                >
                  Test Checkout (Event 1)
                </button>
              </div>
            </div>

            <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
              <h2 className="text-xl font-semibold text-red-400 mb-3">Troubleshooting</h2>
              <div className="text-white/80 space-y-2 text-sm">
                <p><strong>Expected Behavior:</strong> If authenticated, you should be able to access protected routes without redirect to login</p>
                <p><strong>Issue:</strong> If you're logged in but still redirected to login on protected routes, check browser console for middleware logs</p>
                <p><strong>Check:</strong> Look for 🔒 Middleware logs in the browser's Network tab or server console</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
