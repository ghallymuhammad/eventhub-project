"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Download,
  Share2,
  ArrowRight,
  TicketIcon,
  Bell,
  Eye,
  Copy,
  ExternalLink,
  Smartphone,
  Home
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
    address: string;
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
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function PaymentSuccessPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchTransaction = useCallback(async () => {
    try {
      const response = await api.transactions.getById(params.transactionId);
      setTransaction(response.data);
    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load payment information');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [params.transactionId, router]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Transaction ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: transaction?.event.name,
          text: `Check out this event: ${transaction?.event.name}`,
          url: `${window.location.origin}/events/${transaction?.event.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(`${window.location.origin}/events/${transaction?.event.id}`);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="glassmorphism rounded-3xl p-8 animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-4"></div>
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Payment Not Found</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Proof Uploaded!</h1>
            <p className="text-gray-300 text-lg">
              Your payment is being reviewed. We&apos;ll notify you once it&apos;s confirmed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Card */}
              <div className="glassmorphism rounded-3xl p-6">
                <div className="flex gap-4">
                  {transaction.event.imageUrl && (
                    <img 
                      src={transaction.event.imageUrl} 
                      alt={transaction.event.name}
                      className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{transaction.event.name}</h2>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(transaction.event.startDate)} - {formatTime(transaction.event.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{transaction.event.location}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={shareEvent}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Transaction Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{transaction.id}</span>
                      <button
                        onClick={() => copyToClipboard(transaction.id)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                      Under Review
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-white font-bold">{formatCurrency(transaction.totalAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payment Method</span>
                    <span className="text-white">Bank Transfer</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Submitted</span>
                    <span className="text-white">{formatDate(transaction.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Tickets Summary */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Ticket Summary</h3>
                
                <div className="space-y-3">
                  {transaction.tickets.map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <TicketIcon className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-semibold">{ticket.ticket.name}</p>
                          <p className="text-gray-400 text-sm">{ticket.ticket.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">×{ticket.quantity}</p>
                        <p className="text-gray-400 text-sm">{formatCurrency(ticket.ticket.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Tickets</span>
                    <span className="text-white font-bold">
                      {transaction.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Steps */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">What&apos;s Next?</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Payment Proof Uploaded</p>
                      <p className="text-gray-400 text-xs">Successfully submitted</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      2
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Payment Verification</p>
                      <p className="text-gray-400 text-xs">Usually takes 1-3 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      3
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Receive Tickets</p>
                      <p className="text-gray-400 text-xs">Sent to {transaction.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Notification */}
              <div className="glassmorphism rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Email Notifications</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  We&apos;ll send updates about your payment and tickets to:
                </p>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm">{transaction.user.email}</span>
                </div>
              </div>

              {/* Support */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Have questions about your order? Our support team is ready to help.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all mb-3">
                  Contact Support
                </button>
                <button 
                  onClick={() => router.push('/faq')}
                  className="w-full py-3 bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all"
                >
                  View FAQ
                </button>
              </div>

              {/* Quick Actions */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">Browse More Events</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/events/${transaction.event.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">View Event Details</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Download App Prompt */}
          <div className="mt-8 glassmorphism rounded-3xl p-6 lg:hidden">
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Get the EventHub App</h3>
              <p className="text-gray-400 text-sm mb-4">
                Download our mobile app for easier ticket management and event updates.
              </p>
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all">
                  Download App
                </button>
                <button className="flex-1 py-3 bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
