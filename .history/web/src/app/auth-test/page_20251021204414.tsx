'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthTestPage() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();

  const handleTestLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ghallymuhammad2@gmail.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        login(data.data.token, data.data.user);
      }
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  const handleTestLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="p-8">Loading auth state...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth State</h2>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          {user && (
            <div className="mt-2">
              <p><strong>User:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestLogin}
              disabled={isAuthenticated}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              Test Login
            </button>
            <button
              onClick={handleTestLogout}
              disabled={!isAuthenticated}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
            >
              Test Logout
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Local Storage</h2>
          <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Not found'}</p>
          <p><strong>User Data:</strong> {localStorage.getItem('user_data') ? 'Present' : 'Not found'}</p>
        </div>
      </div>
    </div>
  );
}
