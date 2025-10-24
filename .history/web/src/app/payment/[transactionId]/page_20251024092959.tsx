"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Building2,
  CreditCard,
  FileText,
  Upload,
  Camera,
  Info,
  Timer,
  CheckCircle2
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
    description: string;
    startDate: string;
    location: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
  tickets: Array<{
    id: number;
    type: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Bank transfer details
  const bankDetails = {
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '7751035199',
    accountHolder: 'Muhammad Ghally',
    bankCode: '014'
  };

  const fetchTransaction = useCallback(async () => {
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
  }, [params.transactionId, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.transactionId && isAuthenticated) {
      fetchTransaction();
    }
  }, [params.transactionId, isAuthenticated, authLoading, router, fetchTransaction]);

  useEffect(() => {
    if (transaction?.paymentDeadline) {
      const timer = setInterval(() => {
        const deadline = new Date(transaction.paymentDeadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Expired');
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [transaction?.paymentDeadline]);

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPaymentProof(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProof) {
      toast.error('Please select a payment proof image');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);
      
      const response = await apiService.post(`/transactions/${params.transactionId}/payment-proof`, formData);

      if (response.data?.success) {
        toast.success('Payment proof uploaded successfully!');
        router.push(`/payment/${params.transactionId}/pending`);
      } else {
        throw new Error(response.data?.message || 'Failed to upload payment proof');
      }
    } catch (error: any) {
      console.error('Error uploading payment proof:', error);
      toast.error(error.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Complete Payment</h1>
            <p className="text-gray-300">Transaction ID: #{transaction.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Timer */}
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Timer className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Payment Deadline</h2>
              </div>
              <div className="text-2xl font-mono text-red-300 mb-2">{timeRemaining}</div>
              <p className="text-red-200 text-sm">
                Complete payment before: {formatDate(transaction.paymentDeadline)}
              </p>
            </div>

            {/* Bank Transfer Instructions */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Bank Transfer Details</h2>
              </div>

              <div className="space-y-4">
                {/* Bank Name */}
                <div className="bg-black/30 rounded-xl p-4">
                  <label className="text-sm text-gray-400 block mb-2">Bank Name</label>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{bankDetails.bankName}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bankName, 'Bank Name')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedField === 'Bank Name' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="bg-black/30 rounded-xl p-4">
                  <label className="text-sm text-gray-400 block mb-2">Account Number</label>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-xl font-bold">{bankDetails.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account Number' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Holder */}
                <div className="bg-black/30 rounded-xl p-4">
                  <label className="text-sm text-gray-400 block mb-2">Account Holder</label>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{bankDetails.accountHolder}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountHolder, 'Account Holder')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account Holder' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount to Pay */}
                <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl p-4 border border-purple-500/30">
                  <label className="text-sm text-gray-300 block mb-2">Amount to Transfer</label>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-2xl">{formatCurrency(transaction.finalAmount)}</span>
                    <button
                      onClick={() => copyToClipboard(transaction.finalAmount.toString(), 'Amount')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedField === 'Amount' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transfer Instructions */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-2">How to transfer:</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Open your BCA mobile banking or visit BCA ATM</li>
                      <li>Select &quot;Transfer&quot; and choose &quot;To BCA Account&quot;</li>
                      <li>Enter the account number: <strong>{bankDetails.accountNumber}</strong></li>
                      <li>Enter the exact amount: <strong>{formatCurrency(transaction.finalAmount)}</strong></li>
                      <li>Verify the account holder name: <strong>{bankDetails.accountHolder}</strong></li>
                      <li>Complete the transfer and save the receipt</li>
                      <li>Upload the transfer receipt below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Payment Proof */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Upload Payment Proof</h2>
              </div>

              <div className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label
                    htmlFor="payment-proof"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="p-4 bg-gray-700 rounded-full">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">
                        Click to upload payment receipt
                      </p>
                      <p className="text-gray-400 text-sm">
                        JPG, PNG, WebP up to 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="bg-black/30 rounded-xl p-4">
                    <p className="text-white font-medium mb-3">Preview:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Payment proof preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      File: {paymentProof?.name}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitPaymentProof}
                  disabled={!paymentProof || uploading}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Submit Payment Proof
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                {/* Event Info */}
                <div>
                  <h4 className="text-white font-semibold">{transaction.event.name}</h4>
                  <p className="text-gray-400 text-sm">{formatDate(transaction.event.startDate)}</p>
                  <p className="text-gray-400 text-sm">{transaction.event.location}</p>
                </div>

                {/* Tickets */}
                <div className="space-y-2">
                  {transaction.tickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                      <div>
                        <p className="text-white text-sm">{ticket.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {ticket.quantity}</p>
                      </div>
                      <p className="text-white font-medium">
                        {formatCurrency(ticket.price * ticket.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-xl">
                      {formatCurrency(transaction.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Need Help?</h3>
              </div>
              <p className="text-yellow-200 text-sm mb-4">
                If you encounter any issues with the payment process, please contact our support team.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-yellow-200">
                  <strong>WhatsApp:</strong> +62 812-3456-7890
                </p>
                <p className="text-yellow-200">
                  <strong>Email:</strong> support@eventhub.com
                </p>
                <p className="text-yellow-200">
                  <strong>Hours:</strong> 24/7 Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
