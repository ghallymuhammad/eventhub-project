'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyTestPage() {
  const [email, setEmail] = useState('verify.test@example.com');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const testVerification = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // First, login to get a token (we'll use it as verification token for testing)
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: 'VerifyTest123!'
        })
      });
      
      if (!loginResponse.ok) {
        throw new Error('Login failed - user may not exist');
      }
      
      const loginData = await loginResponse.json();
      const testToken = loginData.data.token;
      
      // Now test the verification endpoint
      const verifyResponse = await fetch('http://localhost:8000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: testToken })
      });
      
      const verifyData = await verifyResponse.json();
      
      setResult({
        success: verifyResponse.ok,
        status: verifyResponse.status,
        data: verifyData,
        verificationUrl: `http://localhost:3010/verify-email?token=${testToken}`,
        message: verifyResponse.ok ? 'Verification successful!' : 'Verification failed'
      });
      
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testVerificationUrl = () => {
    // Generate a test URL and navigate to it
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAsImVtYWlsIjoidmVyaWZ5LnRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc2MDcxNzY5MCwiZXhwIjoxNzYwODA0MDkwfQ.8IxbJr6KAQx4bEzJq3Hou4akQJkdN6BQ1BlUO8KZF-8';
    const verificationUrl = `/verify-email?token=${testToken}`;
    router.push(verificationUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔐 Email Verification Test</h1>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Test Email Verification</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email to test:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testVerification}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '🔄 Testing...' : '🧪 Test Verification API'}
              </button>
              
              <button
                onClick={testVerificationUrl}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                🔗 Test Verification Page
              </button>
            </div>
          </div>
        </div>
        
        {/* Current Configuration */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">📧 Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="text-gray-300">
              <span className="text-white">Frontend URL:</span> http://localhost:3010
            </div>
            <div className="text-gray-300">
              <span className="text-white">API URL:</span> http://localhost:8000
            </div>
            <div className="text-gray-300">
              <span className="text-white">Verification URL Pattern:</span> http://localhost:3010/verify-email?token=[JWT_TOKEN]
            </div>
            <div className="text-gray-300">
              <span className="text-white">Expected Redirect:</span> Homepage (/) for USER, Dashboard for ORGANIZER/ADMIN
            </div>
          </div>
        </div>
        
        {result && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {result.success ? '✅ Result' : '❌ Error'}
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
