"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  CreditCard,
  Home,
  Headphones
} from 'lucide-react';
import apiService from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: number;
  amount: number;
  status: string;
  event: {
    id: number;
    name: string;
    startDate: string;
  };
}

export default function PaymentFailedPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    setRetryLoading(true);
    try {
      // Redirect back to payment page to retry
      router.push(`/payment/${params.transactionId}`);
    } catch (error) {
      console.error('Error retrying payment:', error);
      setRetryLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Main Failed Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
          {/* Failed Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-red-300 mb-6">
            Your payment could not be processed at this time
          </p>

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-black/30 rounded-2xl p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Event:</span>
                  <span className="text-white font-medium">{transaction.event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-red-400 font-medium capitalize">{transaction.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Transaction ID:</span>
                  <span className="text-white font-medium">#{transaction.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* Common Failure Reasons */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6">
            <h4 className="text-yellow-300 font-semibold mb-2">Common Issues:</h4>
            <ul className="text-yellow-200 text-sm space-y-1 text-left">
              <li>• Insufficient funds in your account</li>
              <li>• Expired or invalid card details</li>
              <li>• Network connectivity issues</li>
              <li>• Bank security restrictions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Retry Payment */}
            <button
              onClick={handleRetryPayment}
              disabled={retryLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {retryLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              {retryLoading ? 'Processing...' : 'Try Again'}
            </button>

            {/* Back to Event */}
            {transaction && (
              <Link
                href={`/events/${transaction.event.id}`}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Event
              </Link>
            )}

            {/* Home */}
            <Link
              href="/"
              className="w-full bg-transparent hover:bg-white/5 text-gray-300 hover:text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-gray-500/30 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-gray-400 text-sm mb-3">
              Still having issues? Our support team is here to help.
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>

        {/* Additional Tips */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h4 className="text-white font-semibold mb-3">💡 Tips for Successful Payment:</h4>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Ensure your internet connection is stable</li>
            <li>• Check that your card details are correct</li>
            <li>• Make sure your card has sufficient balance</li>
            <li>• Try using a different payment method</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
