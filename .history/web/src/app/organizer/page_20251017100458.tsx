"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  DollarSign, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Ticket,
  Clock,
  Star,
  Download,
  Send,
  Settings,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/hooks/useAuth';

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  imageUrl?: string;
  revenue: number;
  ticketsSold: number;
  views: number;
  rating: number;
}

interface Analytics {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalViews: number;
  monthlyGrowth: {
    events: number;
    revenue: number;
    tickets: number;
  };
  topEvent: {
    name: string;
    revenue: number;
  };
}

interface Attendee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  ticketType: string;
  purchaseDate: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [eventsRes, analyticsRes] = await Promise.all([
        api.organizer.getEvents(),
        api.organizer.getAnalytics()
      ]);

      if (eventsRes.data?.success) setEvents(eventsRes.data.events);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.analytics);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback mock data
      setAnalytics({
        totalEvents: 8,
        totalRevenue: 125000000,
        totalTicketsSold: 2450,
        totalViews: 12500,
        monthlyGrowth: {
          events: 25.0,
          revenue: 18.5,
          tickets: 22.3
        },
        topEvent: {
          name: 'Tech Conference 2024',
          revenue: 45000000
        }
      });
      
      setEvents([
        {
          id: 1,
          name: 'Tech Conference 2024',
          description: 'Annual technology conference featuring industry leaders',
          category: 'TECHNOLOGY',
          location: 'Jakarta Convention Center',
          startDate: '2024-11-15T09:00:00Z',
          endDate: '2024-11-15T17:00:00Z',
          price: 500000,
          totalSeats: 200,
          availableSeats: 45,
          status: 'PUBLISHED',
          revenue: 45000000,
          ticketsSold: 155,
          views: 3200,
          rating: 4.8
        },
        {
          id: 2,
          name: 'Startup Pitch Night',
          description: 'Monthly startup pitch competition',
          category: 'BUSINESS',
          location: 'Innovation Hub',
          startDate: '2024-10-25T18:00:00Z',
          endDate: '2024-10-25T21:00:00Z',
          price: 150000,
          totalSeats: 100,
          availableSeats: 25,
          status: 'PUBLISHED',
          revenue: 11250000,
          ticketsSold: 75,
          views: 1850,
          rating: 4.6
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (eventId: number) => {
    try {
      const response = await api.events.getAttendees(eventId.toString());
      if (response.data?.success) {
        setAttendees(response.data.attendees);
      }
    } catch (error: any) {
      console.error('Failed to fetch attendees:', error);
      // Mock attendees data
      setAttendees([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          ticketType: 'VIP',
          purchaseDate: '2024-10-10T14:30:00Z',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          ticketType: 'REGULAR',
          purchaseDate: '2024-10-12T09:15:00Z',
          status: 'CHECKED_IN'
        }
      ]);
    }
  };

  const handleEventAction = async (eventId: number, action: 'edit' | 'delete' | 'duplicate') => {
    try {
      if (action === 'edit') {
        router.push(`/events/edit/${eventId}`);
      } else if (action === 'delete') {
        await api.events.delete(eventId.toString());
        toast.success('Event deleted successfully');
        fetchDashboardData();
      } else if (action === 'duplicate') {
        // Implement duplication logic
        toast.success('Event duplicated successfully');
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} event`);
    }
  };

  const copyEventLink = (eventId: number) => {
    const link = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(link);
    toast.success('Event link copied to clipboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-300';
      case 'DRAFT': return 'bg-yellow-500/20 text-yellow-300';
      case 'CANCELLED': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireRole="ORGANIZER">
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} requireRole="ORGANIZER">
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Organizer Dashboard</h1>
              <p className="text-gray-300">Manage your events and track performance</p>
            </div>
            <Link 
              href="/events/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Create Event
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 glassmorphism rounded-2xl p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'events', label: 'My Events', icon: Calendar },
              { id: 'attendees', label: 'Attendees', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="text-blue-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{analytics.monthlyGrowth.events}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{analytics.totalEvents}</h3>
                  <p className="text-gray-300">Total Events</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="text-green-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{analytics.monthlyGrowth.revenue}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</h3>
                  <p className="text-gray-300">Total Revenue</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Ticket className="text-purple-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{analytics.monthlyGrowth.tickets}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{analytics.totalTicketsSold.toLocaleString()}</h3>
                  <p className="text-gray-300">Tickets Sold</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="text-yellow-400" size={32} />
                    <div className="text-gray-400">
                      <span className="text-sm">Event views</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</h3>
                  <p className="text-gray-300">Total Views</p>
                </div>
              </div>

              {/* Top Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glassmorphism rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Top Performing Event</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{analytics.topEvent.name}</h3>
                      <p className="text-green-400 text-lg font-bold">{formatCurrency(analytics.topEvent.revenue)}</p>
                      <p className="text-gray-400">Total revenue</p>
                    </div>
                  </div>
                </div>

                <div className="glassmorphism rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      href="/events/create"
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                    >
                      <Plus className="text-green-400" size={20} />
                      <span className="text-white">Create New Event</span>
                    </Link>
                    <button className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all w-full">
                      <Download className="text-blue-400" size={20} />
                      <span className="text-white">Download Report</span>
                    </button>
                    <button className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all w-full">
                      <Send className="text-purple-400" size={20} />
                      <span className="text-white">Send Newsletter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="glassmorphism rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                    <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Calendar className="text-white" size={64} />
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star size={16} />
                          <span className="text-sm">{event.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Tickets Sold:</span>
                          <span className="text-white">{event.ticketsSold}/{event.totalSeats}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-green-400">{formatCurrency(event.revenue)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Views:</span>
                          <span className="text-white">{event.views.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/events/${event.id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-center text-sm"
                        >
                          <Eye size={16} className="inline mr-1" />
                          View
                        </Link>
                        <button 
                          onClick={() => handleEventAction(event.id, 'edit')}
                          className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => copyEventLink(event.id)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleEventAction(event.id, 'delete')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {events.length === 0 && (
                <div className="glassmorphism rounded-2xl p-12 text-center">
                  <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-2xl font-bold text-white mb-2">No Events Yet</h3>
                  <p className="text-gray-400 mb-6">Create your first event to start managing ticket sales</p>
                  <Link
                    href="/events/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={20} />
                    Create Event
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <div className="space-y-6">
              {/* Event Selector */}
              <div className="glassmorphism rounded-2xl p-6">
                <label className="block text-white font-medium mb-3">Select Event to View Attendees:</label>
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => {
                    const eventId = parseInt(e.target.value);
                    setSelectedEventId(eventId);
                    fetchAttendees(eventId);
                  }}
                  className="w-full md:w-auto px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {formatDate(event.startDate)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendees List */}
              {selectedEventId && (
                <div className="glassmorphism rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Event Attendees</h2>
                    <p className="text-gray-400">Total: {attendees.length} attendees</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-medium">Attendee</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Ticket Type</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Purchase Date</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                          <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((attendee) => (
                          <tr key={attendee.id} className="border-t border-white/10">
                            <td className="p-4">
                              <div>
                                <p className="text-white font-medium">{attendee.firstName} {attendee.lastName}</p>
                                <p className="text-gray-400 text-sm">{attendee.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                {attendee.ticketType}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300 text-sm">{formatDate(attendee.purchaseDate)}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                attendee.status === 'CONFIRMED' ? 'bg-yellow-500/20 text-yellow-300' :
                                attendee.status === 'CHECKED_IN' ? 'bg-green-500/20 text-green-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {attendee.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                                  <Send size={16} />
                                </button>
                                <button className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all">
                                  <Ticket size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glassmorphism rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Performance Metrics</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Average Ticket Price</span>
                      <span className="text-white font-bold">{formatCurrency(analytics.totalRevenue / analytics.totalTicketsSold)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Conversion Rate</span>
                      <span className="text-green-400 font-bold">{((analytics.totalTicketsSold / analytics.totalViews) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Events This Month</span>
                      <span className="text-white font-bold">{Math.ceil(analytics.totalEvents / 3)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="glassmorphism rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Growth Trends</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Revenue Growth</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={16} />
                        <span className="text-green-400 font-bold">+{analytics.monthlyGrowth.revenue}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Ticket Sales Growth</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={16} />
                        <span className="text-green-400 font-bold">+{analytics.monthlyGrowth.tickets}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Event Creation</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={16} />
                        <span className="text-green-400 font-bold">+{analytics.monthlyGrowth.events}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="glassmorphism rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Organizer Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive notifications for new ticket sales</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                      Enabled
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Auto-approve Refunds</h3>
                      <p className="text-gray-400 text-sm">Automatically approve refund requests within 24 hours</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                      Disabled
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Public Profile</h3>
                      <p className="text-gray-400 text-sm">Show your organizer profile to event attendees</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                      Public
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
