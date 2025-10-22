"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart,
  Ticket as TicketIcon,
  Plus,
  Minus,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import { useYupValidation } from '@/hooks/useYupValidation';
import { checkoutValidationSchema } from '@/validations/schemas';

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  isFree: boolean;
  imageUrl?: string;
  organizer: {
    firstName: string;
    lastName: string;
  };
}

interface Ticket {
  id: number;
  type: string;
  name: string;
  description?: string;
  price: number;
  availableSeats: number;
}

interface CartItem {
  ticketId: number;
  ticketName: string;
  ticketType: string;
  price: number;
  quantity: number;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export default function CheckoutPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Yup validation hook
  const {
    values: userInfo,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    setValues
  } = useYupValidation(checkoutValidationSchema, {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  // Authentication check using AuthContext
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Please sign in to purchase tickets');
        router.push(`/login?returnTo=${encodeURIComponent(`/checkout/${params.eventId}`)}`);
        return;
      }

      // Pre-fill user data if available
      if (user) {
        setValues({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: '' // Phone number not available in user object
        });
      }
    }
  }, [isAuthenticated, authLoading, user, router, params.eventId, setValues]);

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventRes, ticketsRes] = await Promise.all([
        api.events.getById(params.eventId),
        api.tickets.getByEventId(params.eventId)
      ]);

      setEvent(eventRes.data);
      
      // Handle tickets response - it might be wrapped differently in mock vs real API
      let ticketsData = [];
      if (ticketsRes.data) {
        if (Array.isArray(ticketsRes.data)) {
          ticketsData = ticketsRes.data;
        } else if (ticketsRes.data.success && Array.isArray(ticketsRes.data.tickets)) {
          ticketsData = ticketsRes.data.tickets;
        } else if (Array.isArray(ticketsRes.data.data)) {
          ticketsData = ticketsRes.data.data;
        } else {
          ticketsData = ticketsRes.data;
        }
      }
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error: any) {
      console.error('Failed to fetch event data:', error);
      toast.error('Failed to load event details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [params.eventId, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchEventData();
    }
  }, [isAuthenticated, authLoading, fetchEventData]);

  const addToCart = (ticket: Ticket) => {
    const existingItem = cart.find(item => item.ticketId === ticket.id);
    if (existingItem) {
      if (existingItem.quantity < ticket.availableSeats) {
        updateQuantity(ticket.id, existingItem.quantity + 1);
      } else {
        toast.error('Maximum tickets available reached');
      }
    } else {
      const newItem: CartItem = {
        ticketId: ticket.id,
        ticketName: ticket.name,
        ticketType: ticket.type,
        price: ticket.price,
        quantity: 1
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (ticketId: number) => {
    setCart(cart.filter(item => item.ticketId !== ticketId));
  };

  const updateQuantity = (ticketId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(ticketId);
      return;
    }
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && quantity > ticket.availableSeats) {
      toast.error('Quantity exceeds available seats');
      return;
    }

    setCart(cart.map(item => 
      item.ticketId === ticketId 
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleProceedToPayment = async () => {
    // Validate form first
    const isFormValid = await validateAll();
    
    if (!isFormValid) {
      toast.error('Please fix the form errors before proceeding');
      return;
    }

    if (cart.length === 0 && !event?.isFree) {
      toast.error('Please select at least one ticket');
      return;
    }

    setSubmitting(true);
    
    try {
      const transactionData = {
        eventId: parseInt(params.eventId),
        tickets: cart.map(item => ({
          ticketId: item.ticketId,
          quantity: item.quantity,
          price: item.price
        })),
        userInfo,
        totalAmount: calculateTotal()
      };

      const response = await api.transactions.create(transactionData);
      
      if (response.data?.success) {
        const transactionId = response.data.transaction.id;
        toast.success('Order created successfully!');
        router.push(`/payment/${transactionId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to create transaction');
      }
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      toast.error(error.message || 'Failed to process order');
    } finally {
      setSubmitting(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please sign in to purchase tickets</p>
          <button 
            onClick={() => router.push(`/login?returnTo=${encodeURIComponent(`/checkout/${params.eventId}`)}`)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white">Checkout</h1>
            <p className="text-gray-300 mt-2">Complete your ticket purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Event Info and Tickets */}
          <div className="space-y-8">
            {/* Event Summary */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-purple-400" />
                Event Details
              </h2>

              <div className="flex gap-6">
                {event.imageUrl && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image 
                      src={event.imageUrl}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-purple-400" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-purple-400" />
                      <span>by {event.organizer.firstName} {event.organizer.lastName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Tickets */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TicketIcon className="text-purple-400" />
                Select Tickets
              </h2>

              {event.isFree ? (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto mb-4 text-green-400" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Free Event</h3>
                  <p className="text-gray-300">This is a free event. Please provide your information to register.</p>
                </div>
              ) : !tickets || tickets.length === 0 ? (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-400">No tickets available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(tickets || []).map((ticket) => {
                    const cartItem = cart.find(item => item.ticketId === ticket.id);
                    const quantity = cartItem?.quantity || 0;
                    
                    return (
                      <div key={ticket.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-semibold text-lg">{ticket.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                ticket.type === 'VIP' 
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : ticket.type === 'EARLY_BIRD'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {ticket.type.replace('_', ' ')}
                              </span>
                            </div>
                            {ticket.description && (
                              <p className="text-gray-400 text-sm mb-2">{ticket.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-purple-300 font-bold text-xl">
                                {formatCurrency(ticket.price)}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {ticket.availableSeats} seats available
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-6">
                            <button
                              onClick={() => updateQuantity(ticket.id, quantity - 1)}
                              disabled={quantity === 0}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} className="text-white" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(ticket)}
                              disabled={quantity >= ticket.availableSeats}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - User Info and Summary */}
          <div className="space-y-8">
            {/* User Information Form */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="text-purple-400" />
                Your Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">First Name *</label>
                  <input
                    type="text"
                    value={userInfo.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.firstName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-2">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={userInfo.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.lastName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-2">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={userInfo.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    onBlur={() => handleBlur('phoneNumber')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.phoneNumber ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="+62 812 3456 7890"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-400 text-sm mt-2">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="text-purple-400" />
                Order Summary
              </h2>

              {cart.length === 0 && !event.isFree ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-400">No tickets selected</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.ticketId} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-semibold">{item.ticketName}</p>
                          <p className="text-gray-400 text-sm">{item.ticketType} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-300 font-bold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.ticketId)}
                            className="text-red-400 hover:text-red-300 text-sm transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {event.isFree && (
                      <div className="text-center py-4">
                        <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
                        <p className="text-green-400 font-semibold">Free Registration</p>
                      </div>
                    )}
                  </div>

                  {!event.isFree && (
                    <div className="border-t border-white/10 pt-6 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Service Fee</span>
                        <span className="text-white">Free</span>
                      </div>
                      <div className="flex items-center justify-between text-xl font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-purple-300">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={handleProceedToPayment}
                      disabled={submitting || (cart.length === 0 && !event.isFree) || !isValid}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {event.isFree ? 'Register Now' : 'Proceed to Payment'}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>

                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Info className="text-blue-400 mt-0.5" size={16} />
                      <div className="text-sm text-blue-300">
                        <p className="font-semibold mb-1">Secure Payment</p>
                        <p>Your payment information is encrypted and secure. You&apos;ll have 2 hours to complete payment after placing your order.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
