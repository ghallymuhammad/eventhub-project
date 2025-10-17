"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ticket,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { ProtectedRoute } from '@/hooks/useAuth';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface Event {
  id: number;
  name: string;
  category: string;
  organizer: {
    firstName: string;
    lastName: string;
  };
  startDate: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  revenue: number;
}

interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    events: number;
    revenue: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getEvents()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users);
      if (eventsRes.data?.success) setEvents(eventsRes.data.events);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback mock data
      setStats({
        totalUsers: 1250,
        totalOrganizers: 85,
        totalEvents: 342,
        totalRevenue: 2500000,
        monthlyGrowth: {
          users: 12.5,
          events: 8.3,
          revenue: 15.7
        }
      });
      
      setUsers([
        {
          id: 1,
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          isVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2024-10-16T14:20:00Z'
        },
        {
          id: 2,
          email: 'organizer@events.com',
          firstName: 'Sarah',
          lastName: 'Wilson',
          role: 'ORGANIZER',
          isVerified: true,
          createdAt: '2024-02-20T09:15:00Z',
          lastLoginAt: '2024-10-16T16:45:00Z'
        }
      ]);
      
      setEvents([
        {
          id: 1,
          name: 'Tech Conference 2024',
          category: 'TECHNOLOGY',
          organizer: { firstName: 'Sarah', lastName: 'Wilson' },
          startDate: '2024-11-15T09:00:00Z',
          price: 500000,
          totalSeats: 200,
          availableSeats: 45,
          status: 'PUBLISHED',
          revenue: 77500000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'suspend' | 'activate' | 'delete') => {
    try {
      await api.admin.userAction(userId, action);
      toast.success(`User ${action}d successfully`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleEventAction = async (eventId: number, action: 'approve' | 'reject' | 'delete') => {
    try {
      await api.admin.eventAction(eventId, action);
      toast.success(`Event ${action}d successfully`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(`Failed to ${action} event`);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireRole="ADMIN">
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} requireRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Manage users, events, and platform analytics</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 glassmorphism rounded-2xl p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar },
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
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="text-blue-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{stats.monthlyGrowth.users}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</h3>
                  <p className="text-gray-300">Total Users</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="text-purple-400" size={32} />
                    <div className="text-gray-400">
                      <span className="text-sm">{stats.totalOrganizers} organizers</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{stats.totalOrganizers}</h3>
                  <p className="text-gray-300">Organizers</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="text-green-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{stats.monthlyGrowth.events}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{stats.totalEvents}</h3>
                  <p className="text-gray-300">Total Events</p>
                </div>

                <div className="glassmorphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="text-yellow-400" size={32} />
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{stats.monthlyGrowth.revenue}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</h3>
                  <p className="text-gray-300">Total Revenue</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glassmorphism rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">New event approved</p>
                        <p className="text-gray-400 text-sm">Tech Conference 2024 by Sarah Wilson</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Users className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">25 new user registrations</p>
                        <p className="text-gray-400 text-sm">Daily signup milestone reached</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">6 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="glassmorphism rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">Users</option>
                    <option value="ORGANIZER">Organizers</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                  
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg transition-all">
                    <Download size={20} className="inline mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="glassmorphism rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">User</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Last Login</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t border-white/10">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                              user.role === 'ORGANIZER' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.isVerified ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{formatDate(user.createdAt)}</td>
                          <td className="p-4 text-gray-300 text-sm">
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="glassmorphism rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Events Table */}
              <div className="glassmorphism rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">Event</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Organizer</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Date</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Tickets</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Revenue</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="border-t border-white/10">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{event.name}</p>
                              <p className="text-gray-400 text-sm">{event.category}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-gray-300">{event.organizer.firstName} {event.organizer.lastName}</p>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{formatDate(event.startDate)}</td>
                          <td className="p-4">
                            <p className="text-white">{event.totalSeats - event.availableSeats}/{event.totalSeats}</p>
                            <p className="text-gray-400 text-sm">sold/total</p>
                          </td>
                          <td className="p-4 text-green-400">{formatCurrency(event.revenue)}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300' :
                              event.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEventAction(event.id, 'approve')}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleEventAction(event.id, 'delete')}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="glassmorphism rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Platform Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">+12.5%</p>
                      <p className="text-gray-400">This month</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Growth</h3>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">+15.7%</p>
                      <p className="text-gray-400">This month</p>
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
                <h2 className="text-2xl font-bold text-white mb-6">Platform Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Platform Commission</h3>
                      <p className="text-gray-400 text-sm">Current rate: 5% per transaction</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                      Edit
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Auto-approve Events</h3>
                      <p className="text-gray-400 text-sm">Automatically approve events from verified organizers</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                      Enabled
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Send notifications to admins for important events</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                      Enabled
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
