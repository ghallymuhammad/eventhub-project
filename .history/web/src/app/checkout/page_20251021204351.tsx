'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/libs/api';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  category: string;
  price: number;
  tickets: Ticket[];
}

interface Ticket {
  id: number;
  type: string;
  price: number;
  availableSeats: number;
  description: string;
}

interface CartItem {
  ticketId: number;
  quantity: number;
}

interface CheckoutPreview {
  event: {
    id: number;
    name: string;
    startDate: string;
    location: string;
  };
  ticketDetails: any[];
  pricing: {
    totalAmount: number;
    discounts: any[];
    pointsUsed: number;
    maxPointsAvailable: number;
    finalAmount: number;
  };
  validPromotionApplied: boolean;
  validCouponApplied: boolean;
  allTicketsAvailable: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const eventId = searchParams.get('eventId');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  
  // Form state
  const [promotionCode, setPromotionCode] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      if (response.data.success) {
        setEvent(response.data.data);
      }
    } catch (err) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchUserData = useCallback(async () => {
    try {
      const [couponsResponse, dashboardResponse] = await Promise.all([
        api.user.getCoupons(),
        api.user.getDashboard()
      ]);
      
      if (couponsResponse.data.success) {
        setUserCoupons(couponsResponse.data.data);
      }
      
      if (dashboardResponse.data.success) {
        setUserPoints(dashboardResponse.data.data.profile.pointBalance);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  const calculatePreview = useCallback(async () => {
    if (cart.length === 0) return;

    try {
      const previewData = {
        eventId: parseInt(eventId!),
        tickets: cart,
        promotionCode: promotionCode || undefined,
        couponId: selectedCoupon || undefined,
        pointsToUse
      };

      const response = await api.checkout.getPreview(previewData);
      if (response.data.success) {
        setPreview(response.data.data);
      }
    } catch (err) {
      console.error('Error calculating preview:', err);
    }
  }, [cart, promotionCode, selectedCoupon, pointsToUse, eventId]);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
  }, [router]);

  // Event and cart loading
  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchUserData();
      
      // Load selected tickets from localStorage
      const savedTickets = localStorage.getItem('selectedTickets');
      if (savedTickets) {
        try {
          const tickets = JSON.parse(savedTickets);
          setCart(tickets.map((ticket: any) => ({
            ticketId: ticket.ticketId,
            quantity: ticket.quantity
          })));
          // Clear from localStorage after loading
          localStorage.removeItem('selectedTickets');
        } catch (err) {
          console.error('Error loading saved tickets:', err);
        }
      }
    }
  }, [eventId, fetchEvent, fetchUserData]);

  useEffect(() => {
    if (cart.length > 0) {
      calculatePreview();
    }
  }, [cart, calculatePreview]);

  const updateCart = (ticketId: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.ticketId !== ticketId));
    } else {
      const existingItem = cart.find(item => item.ticketId === ticketId);
      if (existingItem) {
        setCart(cart.map(item => 
          item.ticketId === ticketId ? { ...item, quantity } : item
        ));
      } else {
        setCart([...cart, { ticketId, quantity }]);
      }
    }
  };

  const handleCheckout = async () => {
    if (!preview?.allTicketsAvailable) {
      setError('Some tickets are no longer available');
      return;
    }

    setProcessing(true);
    try {
      const checkoutData = {
        eventId: parseInt(eventId!),
        tickets: cart,
        promotionCode: promotionCode || undefined,
        couponId: selectedCoupon || undefined,
        pointsToUse
      };

      const response = await api.checkout.createTransaction(checkoutData);
      if (response.data.success) {
        const transaction = response.data.data;
        if (transaction.status === 'DONE') {
          // Free ticket or fully paid with points
          router.push(`/user/tickets?success=true`);
        } else {
          // Needs payment
          router.push(`/user/payment/${transaction.id}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Event Header */}
          <div className="p-6 border-b">
            <div className="flex items-start space-x-4">
              {event.imageUrl && (
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                <p className="text-gray-600 mt-1">{formatDate(event.startDate)}</p>
                <p className="text-gray-600">{event.location}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  {event.category}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tickets</h2>
            <div className="space-y-4">
              {event.tickets.map((ticket) => {
                const cartItem = cart.find(item => item.ticketId === ticket.id);
                const quantity = cartItem?.quantity || 0;
                
                return (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{ticket.type}</h3>
                      <p className="text-sm text-gray-600">{ticket.description}</p>
                      <p className="text-lg font-semibold text-indigo-600 mt-1">
                        {formatCurrency(ticket.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.availableSeats} seats available
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateCart(ticket.id, Math.max(0, quantity - 1))}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => updateCart(ticket.id, Math.min(ticket.availableSeats, quantity + 1))}
                        disabled={quantity >= ticket.availableSeats}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {cart.length > 0 && (
            <>
              {/* Discounts & Points */}
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Discounts & Points</h2>
                
                {/* Promotion Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Code
                  </label>
                  <input
                    type="text"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                    placeholder="Enter promotion code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Coupon Selection */}
                {userCoupons.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Coupons
                    </label>
                    <select
                      value={selectedCoupon || ''}
                      onChange={(e) => setSelectedCoupon(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a coupon</option>
                      {userCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.name} - {coupon.isPercentage ? `${coupon.discount}%` : formatCurrency(coupon.discount)} OFF
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Points Usage */}
                {userPoints > 0 && preview && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use Points (Available: {userPoints.toLocaleString()})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={preview.pricing.maxPointsAvailable}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                      placeholder={`Max: ${preview.pricing.maxPointsAvailable}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum {preview.pricing.maxPointsAvailable.toLocaleString()} points (50% of total)
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {preview && (
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-2">
                    {preview.ticketDetails.map((detail, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{detail.ticketType} x {detail.quantity}</span>
                        <span>{formatCurrency(detail.subtotal)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>{formatCurrency(preview.pricing.totalAmount)}</span>
                      </div>
                      
                      {preview.pricing.discounts.map((discount, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span>{discount.name}</span>
                          <span>-{formatCurrency(discount.amount)}</span>
                        </div>
                      ))}
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(preview.pricing.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!preview.allTicketsAvailable && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                      <p className="text-red-800 text-sm">
                        Some tickets are no longer available. Please adjust your selection.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <div className="p-6">
                <button
                  onClick={handleCheckout}
                  disabled={processing || !preview?.allTicketsAvailable}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : preview?.pricing.finalAmount === 0 ? 'Get Free Tickets' : 'Proceed to Payment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
