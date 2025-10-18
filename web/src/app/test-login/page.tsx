'use client';

import { useState } from 'react';
import { api } from '@/libs/api';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing login...');
      const response = await api.auth.login({
        email: 'login.test@example.com',
        password: 'password123',
      });
      
      console.log('Login response:', response.data);
      setResult({
        success: true,
        data: response.data
      });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
    } catch (error: any) {
      console.error('Login error:', error);
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token);
      
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Auth check response:', data);
      
      setResult({
        success: response.ok,
        data: data
      });
    } catch (error: any) {
      console.error('Auth check error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login Test Page</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
          
          <button
            onClick={checkAuth}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            {loading ? 'Checking...' : 'Check Auth'}
          </button>
          
          <button
            onClick={clearAuth}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Auth
          </button>
        </div>
        
        {result && (
          <div className="bg-white p-4 rounded border">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
