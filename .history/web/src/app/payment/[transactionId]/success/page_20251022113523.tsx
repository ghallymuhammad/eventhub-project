"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock, 
  User,
  Ticket,
  Home,
  Share2,
  Sparkles
} from 'lucide-react';
import apiService from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  event: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    address: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
  tickets: Array<{
    id: number;
    qrCode: string;
    status: string;
  }>;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.transactionId && isAuthenticated) {
      fetchTransaction();
    }
  }, [params.transactionId, isAuthenticated, authLoading]);

  const fetchTransaction = async () => {
    try {
      const response = await apiService.get(`/transactions/${params.transactionId}`);
      if (response.data?.success) {
        setTransaction(response.data.data);
        // Auto-send email ticket
        sendEmailTicket();
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailTicket = async () => {
    try {
      await apiService.post(`/transactions/${params.transactionId}/send-email`);
      setEmailSent(true);
      toast.success('E-ticket sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send e-ticket via email');
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

  const handleDownloadTicket = async () => {
    try {
      toast.info('Downloading your e-ticket...');
      const response = await apiService.get(`/transactions/${params.transactionId}/download`);
      // Handle PDF download
      toast.success('E-ticket downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download e-ticket');
    }
  };

  const handleShareEvent = () => {
    if (!transaction) return;
    
    if (navigator.share) {
      navigator.share({
        title: `${transaction.event.name} - I'm going!`,
        text: `Just got my ticket for ${transaction.event.name}! 🎉`,
        url: `${window.location.origin}/events/${transaction.event.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/events/${transaction.event.id}`);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Transaction Not Found</h2>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-black flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-green-300 mb-2">
            Your ticket has been confirmed
          </p>
          {emailSent && (
            <p className="text-emerald-300 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              E-ticket sent to {user?.email}
            </p>
          )}
        </div>

        {/* Transaction Details Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {transaction.event.name}
            </h2>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
              <Ticket className="w-4 h-4" />
              Ticket Confirmed
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{formatDate(transaction.event.startDate)}</p>
                <p className="text-sm text-white/60">
                  {formatTime(transaction.event.startDate)} - {formatTime(transaction.event.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium">{transaction.event.location}</p>
                <p className="text-sm text-white/60">{transaction.event.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">
                  {transaction.event.organizer.firstName} {transaction.event.organizer.lastName}
                </p>
                <p className="text-sm text-white/60">Event Organizer</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-black/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-white font-semibold text-xl">{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Transaction ID:</span>
                <span className="text-white font-mono">#{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className="text-green-400 font-medium capitalize">{transaction.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Number of Tickets:</span>
                <span className="text-white font-medium">{transaction.tickets?.length || 1}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download E-Ticket
            </button>
            
            <Link
              href="/tickets"
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              View My Tickets
            </Link>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleShareEvent}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Event
          </button>
          
          <Link
            href={`/events/${transaction.event.id}`}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Event Details
          </Link>
          
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">🎯 What's Next?</h3>
          <div className="space-y-3 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <span>Check your email for the e-ticket confirmation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span>Download and save your e-ticket to your phone</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span>Arrive at the venue and show your QR code for entry</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <span>Enjoy the event and share your experience!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}