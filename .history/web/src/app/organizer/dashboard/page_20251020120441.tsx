'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/libs/api';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Star,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  ticketsSold: number;
  imageUrl?: string;
}

interface Stats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  upcomingEvents: number;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadDashboardData = useCallback(async () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        toast.error('Please log in to access the organizer dashboard.');
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is organizer
      if (parsedUser.role !== 'ORGANIZER') {
        toast.error('Access denied. Organizer account required.');
        router.push('/');
        return;
      }

      // Load events from API
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.events.getOrganizerEvents();
          const { events: apiEvents, stats: apiStats } = response.data.data;
          
          // Transform API events to match component interface
          const transformedEvents = apiEvents.map((event: any) => ({
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            price: event.price,
            capacity: event.totalSeats,
            category: event.category,
            status: event.isActive ? 'PUBLISHED' : 'DRAFT',
            ticketsSold: event._count?.tickets || 0,
            imageUrl: event.imageUrl
          }));

          setEvents(transformedEvents);
          setStats({
            totalEvents: apiStats.totalEvents,
            totalTicketsSold: apiStats.totalTicketsSold,
            totalRevenue: apiStats.totalRevenue,
            upcomingEvents: transformedEvents.filter((event: any) => new Date(event.startDate) > new Date()).length
          });
        }
      } catch (error) {
        console.error('Failed to load events from API:', error);
        // Fallback to empty events
        setEvents([]);
        setStats({
          totalEvents: 0,
          totalTicketsSold: 0,
          totalRevenue: 0,
          upcomingEvents: 0
        });
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    // Check if user just verified their account
    if (searchParams?.get('verified') === 'true') {
      toast.success('🎉 Account verified successfully! Welcome to EventHub!');
    }

    // Load user data and events
    loadDashboardData();
  }, [searchParams, loadDashboardData]);

  const handleCreateEvent = () => {
    router.push('/organizer/create-event');
  };

  const handleViewEvent = (eventId: number) => {
    // Open event detail page in new tab
    window.open(`/events/${eventId}`, '_blank');
  };

  const handleEditEvent = (eventId: number) => {
    router.push(`/organizer/edit-event/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: number, eventName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await api.events.delete(eventId.toString());
      toast.success('Event deleted successfully');
      
      // Reload dashboard data to reflect changes
      loadDashboardData();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4" />;
      case 'DRAFT': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
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
              <h1 className="text-2xl font-bold text-white">Organizer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-purple-200">
                <Bell className="w-6 h-6" />
              </button>
              <button className="text-white hover:text-purple-200">
                <Settings className="w-6 h-6" />
              </button>
              <div className="text-white">
                <span className="text-sm">Welcome back, </span>
                <span className="font-semibold">{user?.firstName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message for New Organizers */}
        {events.length === 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 Welcome to EventHub!
            </h2>
            <p className="text-white text-lg mb-6">
              You&apos;re all set to start creating amazing events. Let&apos;s get your first event published!
            </p>
            <button
              onClick={handleCreateEvent}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Event
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">{stats.totalTicketsSold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Upcoming Events</p>
                <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Events</h2>
              <button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Event
              </button>
            </div>
            
            {/* Search and Filter Controls */}
            {events.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL" className="bg-gray-800">All Status</option>
                    <option value="PUBLISHED" className="bg-gray-800">Published</option>
                    <option value="DRAFT" className="bg-gray-800">Draft</option>
                    <option value="CANCELLED" className="bg-gray-800">Cancelled</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">
                  Start by creating your first event to engage your audience
                </p>
                <button
                  onClick={handleCreateEvent}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center mx-auto"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1">{event.status}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleViewEvent(event.id)}
                          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEvent(event.id)}
                          className="text-gray-400 hover:text-blue-400 p-1 rounded transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-semibold mb-2">{event.name}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Date:</span>
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Tickets Sold:</span>
                        <span>{event.ticketsSold}/{event.capacity}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Revenue:</span>
                        <span>Rp {(event.ticketsSold * event.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
