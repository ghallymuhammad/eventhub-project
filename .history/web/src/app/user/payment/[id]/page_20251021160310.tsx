'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/libs/api';

interface Transaction {
  id: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentDeadline: string;
  event: {
    id: number;
    name: string;
    startDate: string;
    location: string;
  };
  tickets: Array<{
    quantity: number;
    price: number;
    ticket: {
      type: string;
    };
  }>;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState('');

  useEffect(() => {
    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      if (response.data.success) {
        setTransaction(response.data.data);
      } else {
        setError('Transaction not found');
      }
    } catch (err: any) {
      console.error('Error fetching transaction:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load transaction details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async () => {
    if (!paymentProof.trim()) {
      setError('Please provide payment proof details');
      return;
    }

    setUploading(true);
    try {
      const response = await api.checkout.uploadPayment(transactionId, {
        paymentProof: paymentProof.trim()
      });
      
      if (response.data.success) {
        router.push('/user/dashboard?tab=tickets&success=payment-uploaded');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const timeLeft = deadlineTime - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Transaction not found'}</p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(transaction.paymentDeadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
            <p className="text-indigo-100 mt-1">Transaction #{transaction.id}</p>
          </div>

          {/* Payment Status */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                transaction.status === 'WAITING_FOR_PAYMENT' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : transaction.status === 'WAITING_FOR_ADMIN_CONFIRMATION'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {transaction.status.replace('_', ' ')}
              </span>
            </div>
            
            {!isExpired ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 font-medium">Payment Deadline</p>
                    <p className="text-yellow-700 text-sm">{getTimeRemaining(transaction.paymentDeadline)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-800 font-medium">Payment Expired</p>
                    <p className="text-red-700 text-sm">This payment window has closed</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Event</span>
                <span className="font-medium">{transaction.event.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span>{formatDate(transaction.event.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span>{transaction.event.location}</span>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets</h3>
            <div className="space-y-2">
              {transaction.tickets.map((ticket, index) => (
                <div key={index} className="flex justify-between">
                  <span>{ticket.ticket.type} x {ticket.quantity}</span>
                  <span>{formatCurrency(ticket.price * ticket.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(transaction.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Instructions</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Bank Transfer:</strong>
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Bank: BCA</p>
                <p>Account Number: 1234567890</p>
                <p>Account Name: EventHub Indonesia</p>
                <p className="font-medium text-gray-800">Amount: {formatCurrency(transaction.finalAmount)}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Please transfer the exact amount and upload your payment proof below.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Proof Upload */}
          {!isExpired && transaction.status === 'WAITING_FOR_PAYMENT' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Payment Proof</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Details / Transfer Reference
                  </label>
                  <textarea
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                    rows={4}
                    placeholder="Please provide payment details such as:&#10;- Transfer reference number&#10;- Transfer date and time&#10;- Transfer amount&#10;- Bank name&#10;- Or upload screenshot link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                
                <button
                  onClick={handlePaymentUpload}
                  disabled={uploading || !paymentProof.trim()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
              </div>
            </div>
          )}

          {transaction.status === 'WAITING_FOR_ADMIN_CONFIRMATION' && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-blue-800 font-medium">Payment Under Review</p>
                    <p className="text-blue-700 text-sm">Your payment proof has been submitted and is being reviewed by our team.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/user/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
