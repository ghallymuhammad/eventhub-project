"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/libs/api';
import { toast } from 'sonner';
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
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';
import ContactOrganizerModal from '@/components/modals/ContactOrganizerModal';
import ShareEventModal from '@/components/modals/ShareEventModal';
import AddToFavoritesModal from '@/components/modals/AddToFavoritesModal';

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

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  // Helper functions for authentication checks
  const checkAuthenticationForAction = (action: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(`Please sign in to ${action}`);
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    return true;
  };

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      const eventRes = await api.events.getById(params.id);
      
      console.log('Event response:', eventRes.data);
      
      // Handle the API response structure
      if (eventRes.data.success) {
        const eventData = eventRes.data.data;
        setEvent(eventData);
        
        // Use tickets from event data or create a default ticket
        if (eventData.tickets && eventData.tickets.length > 0) {
          setTickets(eventData.tickets);
        } else {
          // Create a simple ticket from event data
          const simpleTicket: Ticket = {
            id: 1,
            type: 'GENERAL',
            name: eventData.isFree ? 'Free Entry' : 'General Admission',
            description: `Admission to ${eventData.name}`,
            price: eventData.price || 0,
            availableSeats: eventData.availableSeats
          };
          setTickets([simpleTicket]);
        }
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error: any) {
      console.error('Failed to fetch event data:', error);
      toast.error('Failed to load event details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-lg transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white">{event.name}</h1>
            <p className="text-gray-300 mt-2">Event Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image and Basic Info */}
            <div className="glassmorphism rounded-3xl p-8">
              {event.imageUrl && (
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
                  <Image 
                    src={event.imageUrl}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-purple-400" size={20} />
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                  {event.category}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">{event.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="text-purple-400" size={20} />
                  <div>
                    <p className="font-semibold">{formatDate(event.startDate)}</p>
                    <p className="text-sm">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="text-purple-400" size={20} />
                  <div>
                    <p className="font-semibold">{event.location}</p>
                    <p className="text-sm">{event.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Users className="text-purple-400" size={20} />
                  <div>
                    <p className="font-semibold">{event.availableSeats} seats available</p>
                    <p className="text-sm">of {event.totalSeats} total seats</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <User className="text-purple-400" size={20} />
                  <div>
                    <p className="font-semibold">Organized by</p>
                    <p className="text-sm">{event.organizer.firstName} {event.organizer.lastName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glassmorphism rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">About This Event</h3>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {/* Available Tickets */}
            <div className="glassmorphism rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TicketIcon className="text-purple-400" />
                Available Tickets
              </h3>

              {event.isFree ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                  <h4 className="text-xl font-bold text-white mb-2">Free Event</h4>
                  <p className="text-gray-300 mb-6">This event is free to attend. Just register to secure your spot!</p>
                  <Link 
                    href={`/checkout/${event.id}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all"
                  >
                    <CheckCircle size={20} />
                    Register Now
                  </Link>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
                  <h4 className="text-xl font-bold text-white mb-2">No Tickets Available</h4>
                  <p className="text-gray-300">Tickets are not currently available for this event.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-bold text-xl">{ticket.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              ticket.type === 'VIP' 
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : ticket.type === 'EARLY_BIRD'
                                ? 'bg-green-500/20 text-green-300'
                                : ticket.type === 'STUDENT'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {ticket.type.replace('_', ' ')}
                            </span>
                          </div>
                          {ticket.description && (
                            <p className="text-gray-400 mb-3">{ticket.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-purple-300 font-bold text-2xl">
                              {formatCurrency(ticket.price)}
                            </p>
                            <p className="text-gray-400">
                              {ticket.availableSeats} seats left
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Link 
                      href={`/checkout/${event.id}`}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                      <ShoppingCart size={20} />
                      Buy Tickets
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="glassmorphism rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Date & Time</p>
                  <p className="text-white font-semibold">{formatDate(event.startDate)}</p>
                  <p className="text-gray-300 text-sm">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{event.location}</p>
                  <p className="text-gray-300 text-sm">{event.address}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Availability</p>
                  <p className="text-white font-semibold">{event.availableSeats} / {event.totalSeats} seats</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {!event.isFree && (
                  <div>
                    <p className="text-gray-400 text-sm">Starting Price</p>
                    <p className="text-purple-300 font-bold text-xl">
                      {tickets.length > 0 
                        ? formatCurrency(Math.min(...tickets.map(t => t.price)))
                        : formatCurrency(event.price)
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="glassmorphism rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Link 
                  href={`/checkout/${event.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all"
                >
                  <ShoppingCart size={16} />
                  {event.isFree ? 'Register Now' : 'Buy Tickets'}
                </Link>
                
                <button 
                  onClick={() => {
                    if (checkAuthenticationForAction('add to favorites')) {
                      setIsFavoritesModalOpen(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  <Heart size={16} />
                  Add to Favorites
                </button>
                
                <button 
                  onClick={() => {
                    if (checkAuthenticationForAction('share this event')) {
                      setIsShareModalOpen(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  <Share2 size={16} />
                  Share Event
                </button>
              </div>
            </div>

            {/* Organizer */}
            <div className="glassmorphism rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Event Organizer</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold">{event.organizer.firstName} {event.organizer.lastName}</p>
                  <p className="text-gray-400 text-sm">{event.organizer.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (checkAuthenticationForAction('contact the organizer')) {
                    setIsContactModalOpen(true);
                  }
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                Contact Organizer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {event && (
        <>
          <ContactOrganizerModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            organizer={event.organizer}
            eventName={event.name}
            eventId={params.id}
          />
          
          <ShareEventModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            event={event}
          />
          
          <AddToFavoritesModal
            isOpen={isFavoritesModalOpen}
            onClose={() => setIsFavoritesModalOpen(false)}
            event={event}
          />
        </>
      )}
    </div>
  );
}
