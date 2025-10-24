"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock,
  CheckCircle,
  ArrowLeft,
  Home,
  FileText,
  Phone,
  Mail,
  MessageCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import apiService from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentDeadline: string;
  createdAt: string;
  event: {
    id: number;
    name: string;
    startDate: string;
    location: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function PaymentPendingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

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
        setTransaction(response.data.data as Transaction);
      } else {
        throw new Error('Transaction not found');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load transaction details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-800 to-black flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-800 to-black flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Payment Submitted</h1>
            <p className="text-gray-300">Transaction ID: #{transaction.id}</p>
          </div>
        </div>

        {/* Pending Animation */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-16 h-16 text-orange-400" />
            </div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Payment Under Review 🔍
          </h2>
          <p className="text-xl text-orange-300 mb-2">
            We&apos;re verifying your payment
          </p>
          <p className="text-yellow-200">
            You&apos;ll receive confirmation within 1-24 hours
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {transaction.event.name}
            </h3>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full border border-orange-500/30">
              <Clock className="w-4 h-4" />
              Payment Verification Pending
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-black/30 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Transaction Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Event:</span>
                <span className="text-white font-medium">{transaction.event.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Date:</span>
                <span className="text-white font-medium">{formatDate(transaction.event.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="text-white font-medium">{transaction.event.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Amount Paid:</span>
                <span className="text-white font-semibold text-xl">{formatCurrency(transaction.finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className="text-orange-400 font-medium capitalize">{transaction.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">🎯 What Happens Next?</h4>
            <div className="space-y-3 text-white/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Our team reviews your payment proof</p>
                  <p className="text-sm text-white/60">Usually takes 1-6 hours during business hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">You&apos;ll receive email confirmation</p>
                  <p className="text-sm text-white/60">Sent to {user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Your e-ticket will be generated</p>
                  <p className="text-sm text-white/60">Available for download and email delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium">Enjoy your event!</p>
                  <p className="text-sm text-white/60">Show your QR code at the venue entrance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/tickets"
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              My Tickets
            </Link>
            
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Browse Events
            </Link>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Important Notice</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• Payment verification is done manually during business hours (9 AM - 6 PM)</li>
                <li>• If payment is submitted after hours, it will be processed the next business day</li>
                <li>• Please keep your payment receipt for reference</li>
                <li>• Contact support if you don&apos;t hear back within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-bold text-white mb-4">💬 Need Help?</h4>
          <p className="text-green-200 text-sm mb-4">
            Our support team is here to help if you have any questions about your payment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            
            <a
              href="mailto:support@eventhub.com"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            
            <a
              href="tel:+6281234567890"
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
