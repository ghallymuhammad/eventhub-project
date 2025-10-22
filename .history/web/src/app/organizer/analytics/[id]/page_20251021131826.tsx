'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/libs/api';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Star,
  Download,
  Share2
} from 'lucide-react';

interface EventAnalytics {
  event: {
    id: number;
    name: string;
    totalSeats: number;
    availableSeats: number;
  };
  stats: {
    totalTransactions: number;
    totalRevenue: number;
    totalAttendees: number;
    totalReviews: number;
    occupancyRate: number;
  };
}

interface Attendee {
  id: number;
  quantity: number;
  totalPaid: number;
  ticketType: string;
  attendedAt: string | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  transaction: {
    id: number;
    status: string;
    createdAt: string;
  };
}

export default function EventAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (eventId) {
      loadAnalytics();
    }
  }, [eventId]);

  const loadAnalytics = async () => {
    try {
      const [analyticsResponse, attendeesResponse] = await Promise.all([
        api.events.getAnalytics(eventId),
        api.events.getAttendees(eventId)
      ]);

      setAnalytics(analyticsResponse.data.data);
      setAttendees(attendeesResponse.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load event analytics');
      router.push('/organizer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!attendees.length) {
      toast.info('No data to export');
      return;
    }

    const csvData = [
      ['Name', 'Email', 'Phone', 'Ticket Type', 'Quantity', 'Amount Paid', 'Purchase Date', 'Status'],
      ...attendees.map(attendee => [
        `${attendee.user.firstName} ${attendee.user.lastName}`,
        attendee.user.email,
        attendee.user.phoneNumber || '',
        attendee.ticketType,
        attendee.quantity.toString(),
        `IDR ${attendee.totalPaid.toLocaleString()}`,
        new Date(attendee.createdAt).toLocaleDateString(),
        attendee.transaction.status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analytics?.event.name.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Analytics not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/organizer/dashboard')}
                className="text-white hover:text-purple-200 mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Event Analytics</h1>
                <p className="text-gray-300 text-sm">{analytics.event.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => window.open(`/events/${eventId}`, '_blank')}
                className="bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Attendees</p>
                <p className="text-2xl font-bold text-white">{analytics.stats.totalAttendees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  IDR {analytics.stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Occupancy Rate</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.stats.occupancyRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Reviews</p>
                <p className="text-2xl font-bold text-white">{analytics.stats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-xl rounded-xl p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attendees', label: 'Attendees' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Event Overview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Capacity Chart */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Seat Capacity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Total Seats</span>
                      <span className="text-white">{analytics.event.totalSeats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Sold</span>
                      <span className="text-white">
                        {analytics.event.totalSeats - analytics.event.availableSeats}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Available</span>
                      <span className="text-white">{analytics.event.availableSeats}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.stats.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Total Transactions</span>
                      <span className="text-white">{analytics.stats.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Average per Transaction</span>
                      <span className="text-white">
                        IDR {analytics.stats.totalTransactions > 0 
                          ? Math.round(analytics.stats.totalRevenue / analytics.stats.totalTransactions).toLocaleString()
                          : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Revenue per Attendee</span>
                      <span className="text-white">
                        IDR {analytics.stats.totalAttendees > 0 
                          ? Math.round(analytics.stats.totalRevenue / analytics.stats.totalAttendees).toLocaleString()
                          : '0'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendees' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Attendee List</h2>
                <p className="text-gray-400 text-sm">{attendees.length} attendees</p>
              </div>

              {attendees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No attendees yet</h3>
                  <p className="text-gray-400">
                    Attendees will appear here once tickets are purchased
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Ticket Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quantity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee) => (
                        <tr key={attendee.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-white">
                            {attendee.user.firstName} {attendee.user.lastName}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-300">{attendee.user.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{attendee.ticketType}</td>
                          <td className="py-3 px-4 text-sm text-white">{attendee.quantity}</td>
                          <td className="py-3 px-4 text-sm text-white">
                            IDR {attendee.totalPaid.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              attendee.transaction.status === 'DONE' 
                                ? 'bg-green-100 text-green-800'
                                : attendee.transaction.status === 'WAITING_FOR_PAYMENT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attendee.transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
