'use client';

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Tag, 
  Star, 
  Ticket as TicketIcon,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Countdown from './Countdown';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ShareModal from './ShareModal';
import EventDetailSkeleton from './EventDetailSkeleton';

interface EventData {
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
    id: number;
    firstName: string;
    lastName: string;
    email: string;
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

interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

interface TicketSelection {
  ticketId: number;
  quantity: number;
  price: number;
}

export default function EventDetailPage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      
      // Fetch event details, tickets, and reviews in parallel
      const [eventRes, ticketsRes, reviewsRes] = await Promise.all([
        api.events.getById(eventId),
        api.tickets.getByEventId(eventId),
        api.reviews.getByEventId(eventId),
      ]);

      setEvent(eventRes.data);
      setTickets(ticketsRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error: any) {
      console.error('Failed to fetch event data:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketQuantityChange = (ticketId: number, quantity: number, price: number) => {
    if (quantity === 0) {
      setSelectedTickets(prev => prev.filter(t => t.ticketId !== ticketId));
    } else {
      setSelectedTickets(prev => {
        const existing = prev.find(t => t.ticketId === ticketId);
        if (existing) {
          return prev.map(t => 
            t.ticketId === ticketId ? { ...t, quantity } : t
          );
        }
        return [...prev, { ticketId, quantity, price }];
      });
    }
  };

  const calculateTotal = () => {
    return selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  };

  const handlePurchase = () => {
    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    // Wait for auth loading to complete
    if (authLoading) {
      toast.info('Please wait...');
      return;
    }

    // Check authentication after loading is complete
    if (!isAuthenticated) {
      toast.error('Please log in to purchase tickets');
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    // Navigate to checkout with selected tickets - use eventId directly
    router.push(`/checkout/${event!.id}`);
  };

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-4">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        eventName={event.name}
        eventUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Hero Section with Gradient Background */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80 z-10" />
        
        {/* Optional: Event Image as overlay with reduced opacity */}
        {event.imageUrl && (
          <div className="absolute inset-0 z-5">
            <Image 
              src={event.imageUrl} 
              alt={event.name}
              fill
              className="object-cover opacity-20 mix-blend-overlay"
              priority
            />
          </div>
        )}
        
        {/* Floating Action Buttons */}
        <div className="absolute top-24 right-6 z-20 flex gap-3">
          <button 
            onClick={handleShare}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <Share2 size={24} className="text-white" />
          </button>
          <button 
            onClick={toggleFavorite}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <Heart 
              size={24} 
              className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
            />
          </button>
        </div>

        {/* Event Header Info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-4 py-2 glassmorphism rounded-full mb-4">
              <span className="text-purple-300 font-semibold">{event.category}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-purple-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-purple-400" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
                <span>{event.availableSeats} / {event.totalSeats} seats available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown Timer */}
            <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="text-purple-400" />
                Event Starts In
              </h2>
              <Countdown targetDate={event.startDate} />
            </div>

            {/* About Event */}
            <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl h-fit">
                    <Calendar className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                    <p className="text-white font-semibold">{formatDate(event.startDate)}</p>
                    <p className="text-purple-300">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl h-fit">
                    <MapPin className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-white font-semibold">{event.location}</p>
                    <p className="text-purple-300">{event.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl h-fit">
                    <Tag className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Category</p>
                    <p className="text-white font-semibold">{event.category}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl h-fit">
                    <Users className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Available Seats</p>
                    <p className="text-white font-semibold">{event.availableSeats} of {event.totalSeats}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-6">Organizer</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                  <p className="text-gray-400">{event.organizer.email}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <span className="text-2xl font-bold text-white">{calculateAverageRating()}</span>
                    <span className="text-gray-400">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="text-gray-600 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {displayedReviews.map((review) => (
                      <div key={review.id} className="border-b border-white/10 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            {review.user.avatar ? (
                              <Image 
                                src={review.user.avatar} 
                                alt={review.user.firstName}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            ) : (
                              <User size={24} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white font-semibold">
                                {review.user.firstName} {review.user.lastName}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={`${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="mt-6 w-full py-3 glassmorphism rounded-xl text-purple-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      {showAllReviews ? (
                        <>
                          Show Less <ChevronUp size={20} />
                        </>
                      ) : (
                        <>
                          Show All Reviews ({reviews.length}) <ChevronDown size={20} />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Ticket Selection */}
              <div className="glassmorphism rounded-3xl p-8 animate-fadeIn">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TicketIcon className="text-purple-400" />
                  Select Tickets
                </h2>

                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <TicketIcon className="text-gray-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-400">No tickets available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold text-lg">{ticket.name}</p>
                            <p className="text-gray-400 text-sm">{ticket.description}</p>
                            <p className="text-purple-300 font-bold text-xl mt-2">
                              {formatCurrency(ticket.price)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.type === 'VIP' 
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : ticket.type === 'EARLY_BIRD'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {ticket.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            {ticket.availableSeats} seats left
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                const current = selectedTickets.find(t => t.ticketId === ticket.id);
                                const currentQty = current?.quantity || 0;
                                if (currentQty > 0) {
                                  handleTicketQuantityChange(ticket.id, currentQty - 1, ticket.price);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                              disabled={!selectedTickets.find(t => t.ticketId === ticket.id)}
                            >
                              -
                            </button>
                            <span className="text-white font-semibold w-8 text-center">
                              {selectedTickets.find(t => t.ticketId === ticket.id)?.quantity || 0}
                            </span>
                            <button
                              onClick={() => {
                                const current = selectedTickets.find(t => t.ticketId === ticket.id);
                                const currentQty = current?.quantity || 0;
                                if (currentQty < ticket.availableSeats) {
                                  handleTicketQuantityChange(ticket.id, currentQty + 1, ticket.price);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                              disabled={
                                (selectedTickets.find(t => t.ticketId === ticket.id)?.quantity || 0) >= ticket.availableSeats
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total & Purchase Button */}
                {tickets.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">Total</span>
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                    <button
                      onClick={handlePurchase}
                      disabled={selectedTickets.length === 0 || authLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Purchase Tickets
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Event Status */}
              <div className="glassmorphism rounded-3xl p-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <span className="text-white font-semibold">Event Guaranteed</span>
                </div>
                <p className="text-gray-400 text-sm">
                  This event will definitely happen. Your tickets are protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
