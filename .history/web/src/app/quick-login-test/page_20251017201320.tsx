'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickLoginTest() {
  const [status, setStatus] = useState('');
  const router = useRouter();

  const doQuickLogin = async () => {
    setStatus('Starting login test...');
    
    try {
      // Step 1: Clear any existing auth
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      setStatus('✅ Cleared existing auth');

      // Step 2: Make login request
      setStatus('🚀 Making login request...');
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'login.test@example.com',
          password: 'password123'
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      setStatus('✅ Login response received: ' + JSON.stringify(data.data.user));

      // Step 3: Store auth data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
      setStatus('✅ Auth data stored in localStorage');

      // Step 4: Verify token works
      setStatus('🔍 Verifying token...');
      const profileResponse = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${data.data.token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile check failed: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      setStatus('✅ Token verified, profile: ' + JSON.stringify(profileData.data));

      // Step 5: Redirect to homepage
      setStatus('🏠 Redirecting to homepage...');
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error: any) {
      setStatus('❌ Error: ' + error.message);
      console.error('Login test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quick Login Test</h1>
        
        <button
          onClick={doQuickLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mb-6"
        >
          🚀 Test Complete Login Flow
        </button>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Status:</h2>
          <pre className="text-sm text-green-400">{status}</pre>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p><strong>Test Credentials:</strong></p>
          <p>Email: login.test@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}
