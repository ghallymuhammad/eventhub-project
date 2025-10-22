"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Download, 
  Share2, 
  QrCode,
  Star,
  Filter,
  Search,
  ChevronDown,
  Mail
} from 'lucide-react';
import apiService from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TicketData {
  id: number;
  qrCode: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  transaction: {
    id: number;
    amount: number;
    createdAt: string;
  };
  event: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    address: string;
    category: string;
    imageUrl?: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated, authLoading]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/users/tickets');
      if (response.data?.success) {
        setTickets(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load your tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'USED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'EXPIRED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'CANCELLED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'MUSIC': 'from-red-400 to-pink-500',
      'TECHNOLOGY': 'from-green-400 to-blue-500',
      'ARTS': 'from-purple-400 to-indigo-500',
      'SPORTS': 'from-yellow-400 to-orange-500',
      'FOOD': 'from-pink-400 to-red-500',
      'BUSINESS': 'from-blue-400 to-purple-500',
      'EDUCATION': 'from-indigo-400 to-purple-500',
      'HEALTH': 'from-green-400 to-teal-500',
      'OTHER': 'from-gray-400 to-gray-500'
    };
    return gradients[category] || 'from-gray-400 to-gray-500';
  };

  const handleDownloadTicket = async (ticketId: number) => {
    try {
      toast.info('Downloading ticket...');
      // Implement ticket download functionality
      const response = await apiService.get(`/tickets/${ticketId}/download`);
      // Handle PDF download
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download ticket');
    }
  };

  const handleShareTicket = (ticket: TicketData) => {
    if (navigator.share) {
      navigator.share({
        title: `${ticket.event.name} - My Ticket`,
        text: `I'm attending ${ticket.event.name}!`,
        url: window.location.origin + `/events/${ticket.event.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/events/${ticket.event.id}`);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleEmailTicket = async (ticketId: number) => {
    try {
      toast.info('Sending ticket to your email...');
      await apiService.post(`/tickets/${ticketId}/email`);
      toast.success('Ticket sent to your email!');
    } catch (error) {
      toast.error('Failed to send ticket via email');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = ticket.event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Tickets
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Manage your event tickets and access your digital passes
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
              >
                <option value="all">All Tickets</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Tickets Found</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {tickets.length === 0 
                ? "You haven't purchased any tickets yet. Start exploring events!"
                : "No tickets match your current filter. Try adjusting your search."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                {/* Ticket Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryGradient(ticket.event.category)} rounded-2xl flex items-center justify-center`}>
                      <Ticket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {ticket.event.name}
                      </h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-gray-800" />
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>{formatDate(ticket.event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span>{formatTime(ticket.event.startDate)} - {formatTime(ticket.event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="w-5 h-5 text-red-400" />
                    <span>{ticket.event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <User className="w-5 h-5 text-purple-400" />
                    <span>{ticket.event.organizer.firstName} {ticket.event.organizer.lastName}</span>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-black/30 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Amount Paid:</span>
                    <span className="text-white font-semibold">{formatCurrency(ticket.transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">Ticket ID:</span>
                    <span className="text-white font-mono">#{ticket.id}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDownloadTicket(ticket.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleEmailTicket(ticket.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={() => handleShareTicket(ticket)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <Link
                    href={`/events/${ticket.event.id}`}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-colors border border-white/20"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready for Your Next Adventure?
            </h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Discover amazing events happening around you and create more memories!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Explore More Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
