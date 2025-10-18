"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for authenticated user
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navbar on authentication pages
  const authPages = ['/login', '/register', '/forgot-password', '/verify-email'];
  const shouldHideNavbar = authPages.includes(pathname);

  if (shouldHideNavbar) {
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsUserMenuOpen(false);
      router.push('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              🏠 Home
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              🎪 Browse Events
            </Link>
            {user?.role === 'ORGANIZER' && (
              <Link
                href="/create-event"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                ✨ Create Event
              </Link>
            )}
            {user && (
              <>
                {user.role !== 'ORGANIZER' && (
                  <Link
                    href="/my-tickets"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    🎫 My Tickets
                  </Link>
                )}
                {user.role === 'ORGANIZER' && (
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    📊 Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-2 pr-4 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">
                    {user.firstName}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      href="/my-tickets"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      🎫 My Tickets
                    </Link>
                    <Link
                      href="/transactions"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      💳 Transaction History
                    </Link>
                    {/* Role-based Dashboard Links */}
                    {user.role === 'ADMIN' && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          🛡️ Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          � Manage Users
                        </Link>
                        <Link
                          href="/admin/events"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📅 Manage Events
                        </Link>
                      </>
                    )}
                    {user.role === 'ORGANIZER' && (
                      <>
                        <Link
                          href="/organizer"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📊 Organizer Dashboard
                        </Link>
                        <Link
                          href="/events/create"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ➕ Create Event
                        </Link>
                        <Link
                          href="/my-events"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📅 My Events
                        </Link>
                      </>
                    )}
                    {user.role === 'USER' && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        📊 My Dashboard
                      </Link>
                    )}
                    <Link
                      href="/referrals"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      🎁 Referral Rewards
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎪 Browse Events
              </Link>
              {user?.role === 'ORGANIZER' && (
                <Link
                  href="/create-event"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✨ Create Event
                </Link>
              )}
              {user && (
                <>
                  <Link
                    href="/my-tickets"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🎫 My Tickets
                  </Link>
                  <Link
                    href="/transactions"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💳 Transactions
                  </Link>
                  {user.role === 'ORGANIZER' && (
                    <>
                      <Link
                        href="/my-events"
                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📅 My Events
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                    </>
                  )}
                  <Link
                    href="/referrals"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🎁 Referral Rewards
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                </>
              )}

              <div className="border-t border-gray-200 pt-4 px-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      className="w-full px-6 py-3 text-center bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="w-full px-6 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
