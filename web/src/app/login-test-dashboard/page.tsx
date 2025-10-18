'use client';

import { useState } from 'react';
import { api } from '@/libs/api';
import { useRouter } from 'next/navigation';

interface TestAccount {
  name: string;
  email: string;
  password: string;
  description: string;
}

const testAccounts: TestAccount[] = [
  {
    name: "Real User",
    email: "realuser@test.com",
    password: "MyPassword123!",
    description: "Recently created test account with strong password"
  },
  {
    name: "Simple Test",
    email: "login.test@example.com", 
    password: "password123",
    description: "Simple test account for debugging"
  }
];

export default function LoginTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const testLoginWithAccount = async (account: TestAccount) => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log(`Testing login with ${account.name}...`);
      
      // Clear any existing auth
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      
      const response = await api.auth.login({
        email: account.email,
        password: account.password,
      });
      
      console.log('Login response:', response.data);
      
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      setResult({
        success: true,
        account: account.name,
        user: response.data.user,
        token: response.data.token.substring(0, 50) + '...',
        message: 'Login successful! Auth data stored in localStorage.'
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      setResult({
        success: false,
        account: account.name,
        error: error.message,
        details: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    
    setResult({
      success: true,
      type: 'auth_check',
      hasToken: !!token,
      hasUserData: !!userData,
      token: token ? token.substring(0, 50) + '...' : null,
      userData: userData ? JSON.parse(userData) : null
    });
  };

  const goToHomepage = () => {
    router.push('/');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setResult({
      success: true,
      type: 'clear_auth',
      message: 'Authentication data cleared'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 Login Testing Dashboard</h1>
        
        {/* Test Accounts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {testAccounts.map((account, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">{account.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{account.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2 font-mono">{account.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Password:</span>
                  <span className="text-white ml-2 font-mono">{account.password}</span>
                </div>
              </div>
              
              <button
                onClick={() => testLoginWithAccount(account)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition-all"
              >
                {loading ? '🔄 Testing...' : '🚀 Test Login'}
              </button>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">🛠️ Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={checkAuthStatus}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ Check Auth
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Clear Auth
            </button>
            
            <button
              onClick={goToLogin}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔑 Go to Login
            </button>
            
            <button
              onClick={goToHomepage}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🏠 Go to Homepage
            </button>
          </div>
        </div>
        
        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-black/20 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
