"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  User,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CreditCard,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Settings,
  Bell,
  Star,
  Trophy,
  Gift,
  Users,
  TrendingUp
} from 'lucide-react';

interface Transaction {
  id: string;
  eventId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  event: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl?: string;
  };
  tickets: Array<{
    id: number;
    quantity: number;
    ticket: {
      name: string;
      type: string;
      price: number;
    };
  }>;
}

interface UserStats {
  totalEvents: number;
  totalSpent: number;
  totalTickets: number;
  upcomingEvents: number;
  points: number;
  referralCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [transactionsResponse, profileResponse] = await Promise.all([
        api.transactions.getMyTransactions(),
        api.users.getProfile()
      ]);
      
      setTransactions(transactionsResponse.data);
      
      // Calculate stats from transactions
      const userTransactions = transactionsResponse.data;
      const confirmedTransactions = userTransactions.filter((t: Transaction) => t.status === 'confirmed');
      const upcomingEvents = userTransactions.filter((t: Transaction) => 
        new Date(t.event.startDate) > new Date() && t.status === 'confirmed'
      );
      
      setStats({
        totalEvents: confirmedTransactions.length,
        totalSpent: confirmedTransactions.reduce((sum: number, t: Transaction) => sum + t.totalAmount, 0),
        totalTickets: confirmedTransactions.reduce((sum: number, t: Transaction) => 
          sum + t.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0), 0
        ),
        upcomingEvents: upcomingEvents.length,
        points: profileResponse.data.points || 0,
        referralCount: profileResponse.data.referralCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Loader className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch = searchQuery === '' || 
      transaction.event.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glassmorphism rounded-3xl p-8 text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
              <p className="text-gray-300">Manage your events, tickets, and account</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => router.push('/create-event')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stats.totalEvents}</p>
                <p className="text-gray-400 text-sm">Events Attended</p>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <Ticket className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stats.totalTickets}</p>
                <p className="text-gray-400 text-sm">Total Tickets</p>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-gray-400 text-sm">Total Spent</p>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stats.upcomingEvents}</p>
                <p className="text-gray-400 text-sm">Upcoming</p>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stats.points}</p>
                <p className="text-gray-400 text-sm">Points</p>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stats.referralCount}</p>
                <p className="text-gray-400 text-sm">Referrals</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glassmorphism rounded-3xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Search className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Browse Events</span>
              </button>
              
              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Account Settings</span>
              </button>
              
              <button 
                onClick={() => router.push('/notifications')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Notifications</span>
              </button>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="glassmorphism rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">My Transactions</h2>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start by purchasing tickets to your favorite events'
                  }
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Event Image */}
                      {transaction.event.imageUrl && (
                        <div className="relative w-full lg:w-32 h-32 lg:h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <Image 
                            src={transaction.event.imageUrl}
                            alt={transaction.event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1 truncate">
                              {transaction.event.name}
                            </h3>
                            <div className="flex items-center gap-4 text-gray-400 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(transaction.event.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{transaction.event.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Tickets and Total */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex flex-wrap gap-2">
                            {transaction.tickets.map((ticket, index) => (
                              <span key={index} className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg">
                                {ticket.quantity}× {ticket.ticket.name}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold">
                              {formatCurrency(transaction.totalAmount)}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => router.push(`/events/${transaction.event.id}`)}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                title="View Event"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {transaction.status === 'confirmed' && (
                                <button 
                                  onClick={() => {/* TODO: Implement ticket download */}}
                                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                                  title="Download Tickets"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-400">
                          Transaction ID: {transaction.id} • {formatDate(transaction.createdAt)}
                        </div>
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
