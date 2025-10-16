"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import Countdown from "./Countdown";
import Footer from "./Footer";
import Accordion from "./Accordion";
import { api } from "@/libs/api";

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

interface Event {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  datetime: string;
  price: string;
  priceValue: number;
  image: string;
  featured: boolean;
  organizer: string;
}

function EventHomepage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 12;

  // Format price in IDR
  const formatIDR = (amount: number) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get gradient for category
  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'MUSIC': 'from-red-400 to-pink-500',
      'TECHNOLOGY': 'from-green-400 to-blue-500',
      'ARTS': 'from-purple-400 to-indigo-500',
      'SPORTS': 'from-yellow-400 to-orange-500',
      'FOOD': 'from-pink-400 to-red-500',
      'BUSINESS': 'from-blue-400 to-purple-500',
      'EDUCATION': 'from-indigo-400 to-purple-500',
      'HEALTH': 'from-green-400 to-teal-500',
      'OTHER': 'from-gray-400 to-gray-500'
    };
    return gradients[category] || 'from-gray-400 to-gray-500';
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: eventsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await api.events.getAll(params);
      
      if (response.data?.success) {
        // Transform API data to match component interface
        const transformedEvents = response.data.events.map((event: any) => ({
          id: event.id.toString(),
          title: event.name,
          category: event.category,
          location: event.location,
          date: new Date(event.startDate).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          datetime: event.startDate,
          price: formatIDR(event.price),
          priceValue: event.price,
          image: getCategoryGradient(event.category),
          featured: event.availableSeats > event.totalSeats * 0.8, // Featured if high availability
          organizer: `${event.organizer?.firstName} ${event.organizer?.lastName}` || 'EventHub'
        }));
        
        if (currentPage === 1) {
          setAllEvents(transformedEvents);
        } else {
          setAllEvents(prev => [...prev, ...transformedEvents]);
        }
        setTotalPages(Math.ceil((response.data.total || 0) / eventsPerPage));
        return;
      }
      
      // Fallback to mock data
      console.log('API response not successful, falling back to mock data');
      const mockEvents = getMockEvents();
      setAllEvents(mockEvents);
      setTotalPages(1);
      
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to mock data if API fails
      const mockEvents = getMockEvents();
      setAllEvents(mockEvents);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data
  const getMockEvents = (): Event[] => [
    {
      id: '1',
      title: 'Rock Concert 2025: Night of Legends',
      category: 'MUSIC',
      location: 'Jakarta',
      date: 'Oct 15, 2025',
      datetime: '2025-10-15T19:00:00',
      price: 'Rp 250.000',
      priceValue: 250000,
      image: 'from-red-400 to-pink-500',
      featured: true,
      organizer: 'Jakarta Music Hall'
    },
    {
      id: '2',
      title: 'Tech Workshop: AI Fundamentals',
      category: 'TECHNOLOGY',
      location: 'Bandung',
      date: 'Oct 20, 2025',
      datetime: '2025-10-20T09:00:00',
      price: 'FREE',
      priceValue: 0,
      image: 'from-green-400 to-blue-500',
      featured: true,
      organizer: 'TechHub Bandung'
    },
    {
      id: '3',
      title: 'Art Exhibition: Modern Indonesia',
      category: 'ARTS',
      location: 'Yogyakarta',
      date: 'Oct 25, 2025',
      datetime: '2025-10-25T10:00:00',
      price: 'Rp 50.000',
      priceValue: 50000,
      image: 'from-purple-400 to-indigo-500',
      featured: false,
      organizer: 'Yogya Art Gallery'
    },
    {
      id: '4',
      title: 'Food Festival: Taste of Indonesia',
      category: 'FOOD',
      location: 'Surabaya',
      date: 'Nov 1, 2025',
      datetime: '2025-11-01T12:00:00',
      price: 'Rp 75.000',
      priceValue: 75000,
      image: 'from-pink-400 to-red-500',
      featured: true,
      organizer: 'Culinary Association'
    },
    {
      id: '5',
      title: 'Business Summit 2025',
      category: 'BUSINESS',
      location: 'Jakarta',
      date: 'Nov 5, 2025',
      datetime: '2025-11-05T08:00:00',
      price: 'Rp 500.000',
      priceValue: 500000,
      image: 'from-blue-400 to-purple-500',
      featured: false,
      organizer: 'Jakarta Business Center'
    },
    {
      id: '6',
      title: 'Marathon Jakarta 2025',
      category: 'SPORTS',
      location: 'Jakarta',
      date: 'Nov 10, 2025',
      datetime: '2025-11-10T06:00:00',
      price: 'Rp 150.000',
      priceValue: 150000,
      image: 'from-yellow-400 to-orange-500',
      featured: true,
      organizer: 'Jakarta Sports Club'
    },
    {
      id: '7',
      title: 'Health & Wellness Expo',
      category: 'HEALTH',
      location: 'Bandung',
      date: 'Nov 15, 2025',
      datetime: '2025-11-15T19:30:00',
      price: 'Rp 100.000',
      priceValue: 100000,
      image: 'from-green-400 to-teal-500',
      featured: false,
      organizer: 'Bandung Health Center'
    },
    {
      id: '8',
      title: 'Photography Workshop',
      category: 'ARTS',
      location: 'Yogyakarta',
      date: 'Nov 20, 2025',
      datetime: '2025-11-20T14:00:00',
      price: 'Rp 200.000',
      priceValue: 200000,
      image: 'from-purple-400 to-indigo-500',
      featured: false,
      organizer: 'Photo Society Jogja'
    }
  ];

  const categories = ['all', 'MUSIC', 'TECHNOLOGY', 'ARTS', 'FOOD', 'BUSINESS', 'SPORTS', 'EDUCATION', 'HEALTH', 'OTHER'];
  const locations = ['all', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];

  useEffect(() => {
    // Check for authenticated user
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({
            email: parsedUser.email,
            role: parsedUser.role,
            name: `${parsedUser.firstName} ${parsedUser.lastName}`,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  // Fetch events from API or use mock data
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, currentPage]);

  // Filter and sort events
  useEffect(() => {
    let events = [...allEvents];
    
    // Filter by location
    if (selectedLocation !== 'all') {
      events = events.filter(event => 
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Sort events
    events.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceValue - b.priceValue;
        case 'price-high':
          return b.priceValue - a.priceValue;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      }
    });

    setFilteredEvents(events);
  }, [allEvents, selectedLocation, sortBy]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'MUSIC': '🎵',
      'TECHNOLOGY': '💻',
      'ARTS': '🎨',
      'FOOD': '🍕',
      'BUSINESS': '💼',
      'SPORTS': '⚽',
      'EDUCATION': '📚',
      'HEALTH': '🏥',
      'OTHER': '🎪'
    };
    return icons[category] || '📅';
  };

  return (
    <>
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden py-16 lg:py-24 pt-24 lg:pt-32">{/* Added pt-24 for navbar spacing */}
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
                style={{
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 11) % 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>
          
          {/* Floating shapes */}
          <div className="absolute inset-0">
            <div className="absolute w-10 h-10 bg-white/20 rounded-full animate-pulse" 
                 style={{top: '10%', left: '5%', animationDelay: '0s'}} />
            <div className="absolute w-8 h-8 bg-yellow-300/30 rotate-45 animate-spin" 
                 style={{top: '20%', left: '90%', animationDelay: '2s', animationDuration: '8s'}} />
            <div className="absolute w-6 h-6 bg-white/25 rounded-full animate-bounce" 
                 style={{top: '80%', left: '10%', animationDelay: '4s'}} />
            <div className="absolute w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-pink-300/40 animate-pulse" 
                 style={{top: '70%', left: '85%', animationDelay: '6s'}} />
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
              Discover Amazing
              <span className="text-yellow-300 block">Events Near You</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
              From concerts and workshops to exhibitions and festivals - find and book events that match your interests.
            </p>
          </div>

          {/* Search and Filters with Modern Glassmorphism */}
          <div className="relative max-w-4xl mx-auto">
            {/* Main Container */}
            <div className="glassmorphism rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
              
              {/* Search Bar */}
              <div className="relative mb-8">
                <label htmlFor="search" className="block text-sm font-medium text-white mb-3">
                  🔍 Search Events
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search events, categories, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-all duration-200"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-white mb-3">
                  🏷️ Categories
                </label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105 border border-white/30'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105'
                      }`}
                    >
                      {category === 'all' ? '🔥 All Events' : `${getCategoryIcon(category)} ${category}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Filter */}
                <div className="relative">
                  <label htmlFor="location" className="block text-sm font-medium text-white mb-3">
                    📍 Location
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <select
                      id="location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none"
                    >
                      {locations.map(location => (
                        <option key={location} value={location} className="bg-gray-800 text-white">
                          {location === 'all' ? 'All Locations' : location}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <label htmlFor="sort" className="block text-sm font-medium text-white mb-3">
                    🔄 Sort By
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none"
                    >
                      <option value="date" className="bg-gray-800 text-white">📅 Sort by Date</option>
                      <option value="price-low" className="bg-gray-800 text-white">💰 Price: Low to High</option>
                      <option value="price-high" className="bg-gray-800 text-white">💎 Price: High to Low</option>
                      <option value="title" className="bg-gray-800 text-white">🔤 Alphabetical</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all' || sortBy !== 'date') && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Active filters:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-200 text-sm rounded-full border border-purple-500/30">
                        Search: "{searchQuery}"
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="ml-2 hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-full border border-blue-500/30">
                        {getCategoryIcon(selectedCategory)} {selectedCategory}
                        <button 
                          onClick={() => handleCategoryChange('all')}
                          className="ml-2 hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedLocation !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-200 text-sm rounded-full border border-green-500/30">
                        📍 {selectedLocation}
                        <button 
                          onClick={() => setSelectedLocation('all')}
                          className="ml-2 hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {sortBy !== 'date' && (
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-500/20 text-yellow-200 text-sm rounded-full border border-yellow-500/30">
                        Sort: {sortBy === 'price-low' ? 'Price ↑' : sortBy === 'price-high' ? 'Price ↓' : 'A-Z'}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedLocation('all');
                        setSortBy('date');
                      }}
                      className="text-sm text-gray-400 hover:text-white transition-colors ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Events</h2>
            <p className="text-xl text-gray-600">Don&apos;t miss out on these amazing experiences</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  {/* Event Image with Gradient */}
                  <div className={`h-48 bg-gradient-to-br ${event.image} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                        {event.category}
                      </span>
                    </div>
                    {event.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-400 px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <Countdown targetDate={event.datetime} />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {event.organizer}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {event.price}
                        </span>
                      </div>
                      <Link 
                        href={`/events/${event.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredEvents.length > 0 && currentPage < totalPages && (
            <div className="text-center mt-12">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Load More Events
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Own Event?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of organizers and start hosting amazing events today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.isAuthenticated ? (
              <Link
                href="/create-event"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Create Event
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            )}
            {user?.isAuthenticated && (
              <Link
                href="/transactions"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                View My Tickets
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How EventHub Works</h2>
            <p className="text-xl text-gray-600">Simple steps to discover and enjoy amazing events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Browse Events</h3>
                <p className="text-gray-600 text-center">
                  Discover thousands of events across various categories. Use our smart filters to find exactly what you&apos;re looking for.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Choose Tickets</h3>
                <p className="text-gray-600 text-center">
                  Select your preferred ticket type and quantity. Apply discount coupons or use your points for savings!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Secure Payment</h3>
                <p className="text-gray-600 text-center">
                  Complete your purchase securely. Upload payment proof and get confirmation within 3 days.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Enjoy Event</h3>
                <p className="text-gray-600 text-center">
                  Show your ticket and enjoy the event! Share your experience by leaving a review afterwards.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    10K+
                  </p>
                  <p className="text-gray-600 font-medium">Events Hosted</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40">
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    50K+
                  </p>
                  <p className="text-gray-600 font-medium">Happy Customers</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40">
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                    500+
                  </p>
                  <p className="text-gray-600 font-medium">Organizers</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40">
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    4.8★
                  </p>
                  <p className="text-gray-600 font-medium">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about EventHub
            </p>
          </div>

          <Accordion
            items={[
              {
                id: 'faq-1',
                question: 'How do I create an event on EventHub?',
                answer: 'Creating an event is easy! Simply sign up for an Organizer account, click on "Create Event" in the navigation menu, fill in your event details including name, date, location, and pricing, then publish it. Your event will be visible to thousands of potential attendees immediately.'
              },
              {
                id: 'faq-2',
                question: 'What payment methods are accepted?',
                answer: 'EventHub accepts various payment methods including bank transfers, credit/debit cards, and popular Indonesian e-wallets. All transactions are secure and encrypted. After purchasing a ticket, you can upload your payment proof for verification by the event organizer.'
              },
              {
                id: 'faq-3',
                question: 'How does the referral system work?',
                answer: 'When you refer a friend using your unique referral code, they get a 10% discount coupon valid for 3 months, and you earn 10,000 points! Points can be used to reduce ticket prices. Your referral code is available in your profile after registration.'
              },
              {
                id: 'faq-4',
                question: 'Can I get a refund if I can\'t attend an event?',
                answer: 'Refund policies are set by individual event organizers. Some events offer full refunds, partial refunds, or no refunds. Please check the specific event\'s terms and conditions before purchasing. If eligible, you can request a refund through your transaction history.'
              },
              {
                id: 'faq-5',
                question: 'How do I use my discount coupons and points?',
                answer: 'During checkout, you\'ll see options to apply coupon codes and use your accumulated points. Coupons provide percentage or fixed discounts, while points directly reduce the ticket price (1 point = IDR 1). You can combine coupons with points for maximum savings!'
              },
              {
                id: 'faq-6',
                question: 'What happens after I purchase a ticket?',
                answer: 'After purchasing, you\'ll have 2 hours to upload payment proof. Once the organizer confirms your payment (within 3 days), your ticket status changes to "Done" and you\'ll receive a confirmation email. You can view and download your tickets from "My Tickets" section anytime.'
              },
              {
                id: 'faq-7',
                question: 'Can I review an event?',
                answer: 'Yes! After attending an event, you can leave a rating (1-5 stars) and write a review. Your feedback helps other users make informed decisions and helps organizers improve their events. Reviews are visible on the event organizer\'s profile.'
              },
              {
                id: 'faq-8',
                question: 'How do I become an event organizer?',
                answer: 'Simply register and select "Event Organizer" as your account type. As an organizer, you\'ll get access to powerful tools including event creation, ticket management, analytics dashboard, promotion codes, and attendee management. Start hosting events today!'
              }
            ]}
          />

          {/* Still have questions? */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 px-8 py-6">
              <p className="text-lg text-gray-700 mb-4">
                Still have questions? We&apos;re here to help!
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default EventHomepage;
