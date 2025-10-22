'use client';

import { useState, useEffect } from 'react';
import { api } from '@/libs/api';

export default function Debug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        localStorage: {},
        apiTest: {},
        userInfo: {}
      };

      // Check localStorage
      try {
        info.localStorage.token = localStorage.getItem('token') ? 'Present' : 'Missing';
        info.localStorage.userData = localStorage.getItem('user_data') ? 'Present' : 'Missing';
        
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          info.userInfo = {
            id: parsed.id,
            email: parsed.email,
            role: parsed.role,
            firstName: parsed.firstName,
            lastName: parsed.lastName
          };
        }
      } catch (error) {
        info.localStorage.error = error;
      }

      // Test API connection
      try {
        const response = await api.events.getOrganizerEvents();
        info.apiTest.success = true;
        info.apiTest.response = response.data;
      } catch (error: any) {
        info.apiTest.success = false;
        info.apiTest.error = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
      }

      setDebugInfo(info);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white">Loading diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 EventHub Debug Information</h1>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">System Diagnostics</h2>
          
          <div className="space-y-6">
            {/* Timestamp */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">⏰ Timestamp</h3>
              <pre className="bg-black/20 p-3 rounded text-white text-sm overflow-auto">
                {debugInfo.timestamp}
              </pre>
            </div>

            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">👤 User Information</h3>
              <pre className="bg-black/20 p-3 rounded text-white text-sm overflow-auto">
                {JSON.stringify(debugInfo.userInfo, null, 2)}
              </pre>
            </div>

            {/* LocalStorage */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">💾 LocalStorage Status</h3>
              <pre className="bg-black/20 p-3 rounded text-white text-sm overflow-auto">
                {JSON.stringify(debugInfo.localStorage, null, 2)}
              </pre>
            </div>

            {/* API Test */}
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">🌐 API Connection Test</h3>
              <div className={`p-3 rounded ${debugInfo.apiTest.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <div className="text-white mb-2">
                  Status: {debugInfo.apiTest.success ? '✅ SUCCESS' : '❌ FAILED'}
                </div>
                <pre className="text-white text-sm overflow-auto">
                  {JSON.stringify(debugInfo.apiTest, null, 2)}
                </pre>
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-2">🛠️ Troubleshooting Tips</h3>
              <div className="bg-black/20 p-4 rounded text-white text-sm">
                <div className="space-y-2">
                  <div>1. <strong>No events showing?</strong> Check if you're logged in as an ORGANIZER</div>
                  <div>2. <strong>API errors?</strong> Make sure the backend server is running on port 8000</div>
                  <div>3. <strong>Authentication issues?</strong> Try logging out and logging back in</div>
                  <div>4. <strong>Events belong to different organizer?</strong> Events are filtered by organizer ID</div>
                  <div>5. <strong>Database empty?</strong> Create a new event to test the system</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">⚡ Quick Actions</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => window.location.href = '/organizer/dashboard'}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/organizer/create-event'}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Create Event
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
