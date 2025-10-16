"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  mockEvents, 
  mockTickets, 
  mockTransactions, 
  mockUser,
  getTicketsByEventId,
  calculateUserStats 
} from '@/data/mockData';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  CreditCard, 
  Eye,
  ShoppingCart,
  User,
  TrendingUp
} from 'lucide-react';

export default function MockDataTestPage() {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]);
  const eventTickets = getTicketsByEventId(selectedEvent.id);
  const userStats = calculateUserStats(mockUser.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🎪 EventHub Mock Data Showcase
            </h1>
            <p className="text-gray-300 text-xl">
              Complete ticket purchase flow with realistic mock data
            </p>
            <div className="mt-6 p-4 glassmorphism rounded-2xl inline-block">
              <p className="text-green-400 font-semibold">
                ✅ Mock Data Mode Enabled - All features working with sample data
              </p>
            </div>
          </div>

          {/* User Stats */}
          <div className="glassmorphism rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="text-purple-400" />
              Mock User Profile: {mockUser.firstName} {mockUser.lastName}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-2xl">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{userStats.totalEvents}</p>
                <p className="text-gray-400 text-sm">Events Attended</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-2xl">
                <Ticket className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{userStats.totalTickets}</p>
                <p className="text-gray-400 text-sm">Total Tickets</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-2xl">
                <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatCurrency(userStats.totalSpent)}</p>
                <p className="text-gray-400 text-sm">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{userStats.upcomingEvents}</p>
                <p className="text-gray-400 text-sm">Upcoming</p>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="glassmorphism rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              🎫 Available Events ({mockEvents.length} events)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {mockEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedEvent.id === event.id 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex gap-4">
                    {event.imageUrl && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image 
                          src={event.imageUrl}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-2 truncate">
                        {event.name}
                      </h3>
                      <div className="space-y-1 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.availableSeats} seats available</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          event.isFree 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {event.isFree ? 'FREE' : 'PAID'}
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Selected Event Details */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                🎯 Selected Event: {selectedEvent.name}
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-300">{selectedEvent.description}</p>
                
                <div className="p-4 bg-white/10 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Available Tickets ({eventTickets.length})</h4>
                  <div className="space-y-3">
                    {eventTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{ticket.name}</p>
                          <p className="text-gray-400 text-sm">{ticket.type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-300 font-bold">
                            {formatCurrency(ticket.price)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {ticket.availableSeats} left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={`/checkout/${selectedEvent.id}`}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-center transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Tickets
                  </Link>
                  <Link 
                    href={`/events/${selectedEvent.id}`}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Sample Transactions */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                📊 Sample Transactions ({mockTransactions.length})
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold truncate">
                        {transaction.event.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-300'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-gray-400 text-sm space-y-1">
                      <p>ID: {transaction.id}</p>
                      <p>Total: {formatCurrency(transaction.totalAmount)}</p>
                      <p>Tickets: {transaction.tickets.reduce((sum, t) => sum + t.quantity, 0)}</p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Link 
                        href={`/payment/${transaction.id}`}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg text-center transition-all"
                      >
                        View Payment
                      </Link>
                      {transaction.status === 'confirmed' && (
                        <Link 
                          href={`/payment/${transaction.id}/success`}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg text-center transition-all"
                        >
                          View Success
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flow Demo */}
          <div className="glassmorphism rounded-3xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              🚀 Complete Flow Demo - Test the Full Journey
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link 
                href={`/checkout/${selectedEvent.id}`}
                className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-center transition-all"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">1. Checkout</p>
                <p className="text-sm opacity-90">Select tickets</p>
              </Link>
              
              <Link 
                href={`/payment/${mockTransactions[1].id}`}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center transition-all"
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">2. Payment</p>
                <p className="text-sm opacity-90">See countdown</p>
              </Link>
              
              <Link 
                href={`/payment/${mockTransactions[1].id}/upload`}
                className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-center transition-all"
              >
                <Ticket className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">3. Upload</p>
                <p className="text-sm opacity-90">Payment proof</p>
              </Link>
              
              <Link 
                href={`/payment/${mockTransactions[0].id}/success`}
                className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-center transition-all"
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">4. Success</p>
                <p className="text-sm opacity-90">Confirmation</p>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                🏠 Homepage
              </Link>
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                📊 Dashboard
              </Link>
              <Link 
                href="/create-event"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                ➕ Create Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
