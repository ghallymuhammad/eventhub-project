"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Clock,
  CreditCard,
  Building,
  Copy,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  Info,
  Banknote
} from 'lucide-react';

interface Transaction {
  id: string;
  eventId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  event: {
    name: string;
    startDate: string;
    location: string;
  };
  tickets: Array<{
    quantity: number;
    ticket: {
      name: string;
      type: string;
      price: number;
    };
  }>;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function PaymentPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showAccountNumber, setShowAccountNumber] = useState<{[key: string]: boolean}>({});

  // Bank account details (in real app, this would come from API)
  const bankAccounts: BankAccount[] = [
    {
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '1234567890',
      accountName: 'EventHub Indonesia'
    },
    {
      bankName: 'Bank Mandiri',
      accountNumber: '0987654321',
      accountName: 'EventHub Indonesia'
    },
    {
      bankName: 'Bank Negara Indonesia (BNI)',
      accountNumber: '5555666677',
      accountName: 'EventHub Indonesia'
    }
  ];

  useEffect(() => {
    fetchTransaction();
  }, [params.transactionId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && transaction) {
      // Payment expired
      toast.error('Payment time expired');
      router.push('/');
    }
  }, [timeLeft, transaction, router]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await api.transactions.getById(params.transactionId);
      
      if (response.data) {
        setTransaction(response.data);
        
        // Calculate remaining time
        const expiryTime = new Date(response.data.expiresAt).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          toast.error('Payment time has expired');
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch transaction:', error);
      toast.error('Failed to load payment details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const toggleAccountVisibility = (bankName: string) => {
    setShowAccountNumber(prev => ({
      ...prev,
      [bankName]: !prev[bankName]
    }));
  };

  const handleUploadProof = () => {
    router.push(`/payment/${params.transactionId}/upload`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Transaction Not Found</h2>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white">Complete Payment</h1>
            <p className="text-gray-300 mt-2">Transfer to one of the accounts below</p>
          </div>
        </div>

        {/* Payment Timer */}
        <div className="glassmorphism rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className={`${timeLeft < 600 ? 'text-red-400' : 'text-purple-400'}`} size={32} />
                <h2 className="text-2xl font-bold text-white">Time Remaining</h2>
              </div>
              <div className={`text-6xl font-mono font-bold mb-4 ${
                timeLeft < 600 ? 'text-red-400' : 'text-green-400'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-400">
                Complete your payment before the timer expires
              </p>
              {timeLeft < 600 && (
                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle className="text-red-400" size={16} />
                  <span className="text-red-400 text-sm font-semibold">
                    Less than 10 minutes remaining!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Instructions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bank Transfer Instructions */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Banknote className="text-purple-400" />
                Bank Transfer Details
              </h2>

              <div className="space-y-6">
                {bankAccounts.map((bank, index) => (
                  <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="text-purple-400" size={24} />
                      <h3 className="text-xl font-bold text-white">{bank.bankName}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Account Number</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20">
                            <span className="text-white font-mono text-lg">
                              {showAccountNumber[bank.bankName] 
                                ? bank.accountNumber 
                                : '••••••••••'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleAccountVisibility(bank.bankName)}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                          >
                            {showAccountNumber[bank.bankName] ? (
                              <EyeOff className="text-white" size={20} />
                            ) : (
                              <Eye className="text-white" size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(bank.accountNumber, 'Account number')}
                            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                          >
                            <Copy className="text-white" size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Account Name</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20">
                            <span className="text-white font-semibold">{bank.accountName}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bank.accountName, 'Account name')}
                            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                          >
                            <Copy className="text-white" size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="text-purple-400" />
                Payment Instructions
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Transfer the exact amount</h3>
                    <p className="text-gray-400 text-sm">
                      Transfer exactly <strong>{formatCurrency(transaction.totalAmount)}</strong> to one of the bank accounts above.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Save your transfer receipt</h3>
                    <p className="text-gray-400 text-sm">
                      Keep the transfer receipt or screenshot from your banking app.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Upload payment proof</h3>
                    <p className="text-gray-400 text-sm">
                      Upload your transfer receipt using the button on the right.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Wait for confirmation</h3>
                    <p className="text-gray-400 text-sm">
                      We'll verify your payment within 3 business days and send your tickets via email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex gap-3">
                  <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-1">Important Notes</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Transfer must be completed within the time limit</li>
                      <li>• Transfer the exact amount to avoid delays</li>
                      <li>• Upload clear photos of your transfer receipt</li>
                      <li>• Contact support if you need help</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <div className="glassmorphism rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-white font-semibold mb-1">{transaction.event.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(transaction.event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">{transaction.event.location}</p>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-white font-semibold mb-3">Tickets</h4>
                    {transaction.tickets.map((ticket, index) => (
                      <div key={index} className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white text-sm">{ticket.ticket.name}</p>
                          <p className="text-gray-400 text-xs">
                            {ticket.ticket.type.replace('_', ' ')} × {ticket.quantity}
                          </p>
                        </div>
                        <p className="text-purple-300 font-semibold">
                          {formatCurrency(ticket.ticket.price * ticket.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-purple-300">{formatCurrency(transaction.totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleUploadProof}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    Upload Payment Proof
                  </button>

                  <button
                    onClick={() => copyToClipboard(transaction.totalAmount.toString(), 'Total amount')}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Copy size={16} />
                    Copy Amount
                  </button>
                </div>
              </div>

              {/* Status Info */}
              <div className="glassmorphism rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-purple-400" size={24} />
                  <h3 className="text-white font-semibold">Payment Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Order ID</span>
                    <span className="text-white font-mono text-sm">{transaction.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold">
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Created</span>
                    <span className="text-white text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
