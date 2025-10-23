'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/utils/cookies';
import apiService from '@/services/api.service';

export default function TestAuthFlow() {
  const { login, logout, isAuthenticated, isLoading, user, token } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addResult = (message: string, isError = false) => {
    setTestResults(prev => [...prev, `${isError ? '❌' : '✅'} ${message}`]);
  };

  const runAuthTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);

    try {
      addResult('Starting authentication flow test...');

      // Step 1: Logout first to ensure clean state
      logout();
      addResult('Logged out to ensure clean state');

      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: Check initial state
      const initialToken = localStorage.getItem('eventhub_token');
      const initialCookie = getCookie('token');
      
      if (!initialToken && !initialCookie) {
        addResult('Initial state clean - no tokens in localStorage or cookies');
      } else {
        addResult('WARNING: Found existing tokens after logout', true);
      }

      // Step 3: Test login with valid credentials
      addResult('Attempting login...');
      const loginResponse = await apiService.login({
        email: 'testuser@example.com', // Replace with valid test credentials
        password: 'password123'
      });

      if (loginResponse.data.success) {
        const { token: loginToken, user: loginUser } = loginResponse.data.data;
        
        // Step 4: Call login function
        login(loginToken, loginUser);
        addResult('Login function called successfully');

        // Step 5: Check if tokens are properly set
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for state update
        
        const storedToken = localStorage.getItem('eventhub_token');
        const cookieToken = getCookie('token');
        
        if (storedToken === loginToken) {
          addResult('Token correctly stored in localStorage');
        } else {
          addResult('Token NOT properly stored in localStorage', true);
        }

        if (cookieToken === loginToken) {
          addResult('Token correctly stored in cookie');
        } else {
          addResult('Token NOT properly stored in cookie', true);
        }

        // Step 6: Check authentication state
        if (isAuthenticated) {
          addResult('Authentication state is TRUE');
        } else {
          addResult('Authentication state is FALSE (should be TRUE)', true);
        }

        if (user) {
          addResult(`User data loaded: ${user.firstName} ${user.lastName}`);
        } else {
          addResult('User data NOT loaded', true);
        }

        addResult('✨ Authentication test completed successfully!');

      } else {
        addResult('Login API call failed', true);
      }

    } catch (error: any) {
      addResult(`Test failed: ${error.message}`, true);
    } finally {
      setIsRunningTest(false);
    }
  };

  const checkCurrentState = () => {
    const storedToken = localStorage.getItem('eventhub_token');
    const cookieToken = getCookie('token');
    const storedUser = localStorage.getItem('eventhub_user');

    setTestResults([
      `Current Authentication State:`,
      `- isAuthenticated: ${isAuthenticated}`,
      `- isLoading: ${isLoading}`,
      `- User: ${user ? `${user.firstName} ${user.lastName} (${user.email})` : 'None'}`,
      `- Token (context): ${token ? token.substring(0, 20) + '...' : 'None'}`,
      `- Token (localStorage): ${storedToken ? storedToken.substring(0, 20) + '...' : 'None'}`,
      `- Token (cookie): ${cookieToken ? cookieToken.substring(0, 20) + '...' : 'None'}`,
      `- User data (localStorage): ${storedUser ? 'Present' : 'None'}`,
    ]);
  };

  useEffect(() => {
    checkCurrentState();
  }, [isAuthenticated, isLoading, user, token]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Authentication Flow Test
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              
              <div className="space-y-3">
                <button
                  onClick={runAuthTest}
                  disabled={isRunningTest}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunningTest ? 'Running Test...' : 'Run Login Flow Test'}
                </button>

                <button
                  onClick={checkCurrentState}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Check Current State
                </button>

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Results */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 italic">No results yet...</p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`text-sm font-mono ${
                          result.startsWith('❌') 
                            ? 'text-red-600' 
                            : result.startsWith('✅')
                            ? 'text-green-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to use this test:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Run Login Flow Test" to test complete authentication</li>
              <li>2. Update the test credentials in the code if needed</li>
              <li>3. Check that both localStorage and cookies are properly set</li>
              <li>4. Use "Check Current State" to inspect current auth state</li>
              <li>5. Use "Logout" to clean state and test again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
