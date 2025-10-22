'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/libs/api';

interface DashboardData {
  profile: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    avatar: string;
    pointBalance: number;
    referralCode: string;
    isVerified: boolean;
    createdAt: string;
  };
  statistics: {
    totalEvents: number;
    totalSpent: number;
    pointBalance: number;
    upcomingEventsCount: number;
    pastEventsCount: number;
    availableCoupons: number;
  };
  transactions: any[];
  pointHistory: any[];
  coupons: any[];
  upcomingEvents: any[];
  pastEvents: any[];
}

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { profile, statistics } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center mt-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {profile.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Member since {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Points Balance</p>
              <p className="text-2xl font-bold text-indigo-600">{statistics.pointBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Referral Code: {profile.referralCode}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(statistics.totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.upcomingEventsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Coupons</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.availableCoupons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'points'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Points History
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'coupons'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Coupons
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Upcoming Events */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                  {dashboardData.upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dashboardData.upcomingEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">{event.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{formatDate(event.startDate)}</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {event.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No upcoming events</p>
                  )}
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                  {dashboardData.transactions.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{transaction.event.name}</h4>
                            <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(transaction.finalAmount)}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              transaction.status === 'DONE' 
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'WAITING_FOR_PAYMENT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No transactions yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">My Tickets</h3>
                {dashboardData.transactions.filter(t => t.status === 'DONE').length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.transactions.filter(t => t.status === 'DONE').map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-lg">{transaction.event.name}</h4>
                            <p className="text-gray-600 mt-1">{formatDate(transaction.event.startDate)}</p>
                            <p className="text-gray-600">{transaction.event.location}</p>
                            
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-700 mb-2">Tickets:</h5>
                              {transaction.tickets.map((ticket: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{ticket.ticket.type} x {ticket.quantity}</span>
                                  <span>{formatCurrency(ticket.price * ticket.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Confirmed
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                              Total: {formatCurrency(transaction.finalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No confirmed tickets yet</p>
                )}
              </div>
            )}

            {activeTab === 'points' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Points History</h3>
                {dashboardData.pointHistory.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.pointHistory.map((point) => (
                      <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{point.description}</p>
                          <p className="text-sm text-gray-600">{formatDate(point.createdAt)}</p>
                        </div>
                        <div className={`font-medium ${point.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {point.points > 0 ? '+' : ''}{point.points.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No point history yet</p>
                )}
              </div>
            )}

            {activeTab === 'coupons' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Coupons</h3>
                {dashboardData.coupons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.coupons.map((coupon) => (
                      <div key={coupon.id} className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{coupon.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                            {coupon.event && (
                              <p className="text-sm text-indigo-600 mt-1">For: {coupon.event.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                              {coupon.code}
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {coupon.isPercentage ? `${coupon.discount}%` : formatCurrency(coupon.discount)} OFF
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Expires: {formatDate(coupon.expiryDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available coupons</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
