"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Tag, 
  Image as ImageIcon, 
  Plus, 
  Minus, 
  Save, 
  Eye, 
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useYupValidation } from '@/hooks/useYupValidation';
import { createEventValidationSchema } from '@/validations/schemas';
import { ProtectedRoute } from '@/hooks/useAuth';
import Image from 'next/image';

interface EventFormData {
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  isFree: boolean;
  imageUrl?: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  type: 'REGULAR' | 'VIP' | 'EARLY_BIRD';
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([
    {
      id: '1',
      name: 'Regular Ticket',
      description: 'Standard access to the event',
      price: 0,
      quantity: 100,
      type: 'REGULAR'
    }
  ]);

  const categories = [
    'MUSIC', 'TECHNOLOGY', 'ARTS', 'SPORTS', 'FOOD', 'BUSINESS', 
    'EDUCATION', 'HEALTH', 'FASHION', 'TRAVEL', 'PHOTOGRAPHY', 
    'GAMING', 'FITNESS', 'OTHER'
  ];

  const ticketTypes = ['REGULAR', 'VIP', 'EARLY_BIRD'] as const;

  // Yup validation hook
  const {
    values: formData,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    setValues
  } = useYupValidation(createEventValidationSchema, {
    name: '',
    description: '',
    category: '',
    location: '',
    address: '',
    startDate: '',
    endDate: '',
    price: 0,
    totalSeats: 100,
    isFree: false,
    imageUrl: ''
  });

  // Update total seats when tickets change
  useEffect(() => {
    const totalSeats = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    handleChange('totalSeats', totalSeats);
  }, [tickets, handleChange]);

  // Update price when isFree changes
  useEffect(() => {
    if (formData.isFree) {
      handleChange('price', 0);
      setTickets(prev => prev.map(ticket => ({ ...ticket, price: 0 })));
    }
  }, [formData.isFree, handleChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleChange('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    handleChange('imageUrl', '');
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: 'New Ticket',
      description: '',
      price: formData.isFree ? 0 : 100000,
      quantity: 50,
      type: 'REGULAR'
    };
    setTickets([...tickets, newTicket]);
  };

  const updateTicket = (id: string, updates: Partial<TicketType>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ));
  };

  const removeTicket = (id: string) => {
    if (tickets.length > 1) {
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
    } else {
      toast.error('At least one ticket type is required');
    }
  };

  const handleSubmit = async (isDraft = false) => {
    const isFormValid = await validateAll();
    
    if (!isFormValid) {
      toast.error('Please fix the form errors before proceeding');
      setCurrentStep(1); // Go back to first step to show errors
      return;
    }

    if (tickets.length === 0) {
      toast.error('At least one ticket type is required');
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    
    try {
      const eventData = {
        ...formData,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        tickets: tickets.map(ticket => ({
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity: ticket.quantity,
          type: ticket.type
        }))
      };

      const response = await api.events.create(eventData);
      
      if (response.data?.success) {
        const eventId = response.data.event.id;
        
        // Upload image if exists
        if (imageFile && eventId) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await api.events.uploadImage(eventId.toString(), formData);
        }
        
        toast.success(isDraft ? 'Event saved as draft!' : 'Event created successfully!');
        router.push(`/organizer`);
      } else {
        throw new Error(response.data?.message || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'MUSIC': '🎵', 'TECHNOLOGY': '💻', 'ARTS': '🎨', 'SPORTS': '⚽',
      'FOOD': '🍕', 'BUSINESS': '💼', 'EDUCATION': '📚', 'HEALTH': '🏥',
      'FASHION': '👗', 'TRAVEL': '✈️', 'PHOTOGRAPHY': '📷', 'GAMING': '🎮',
      'FITNESS': '💪', 'OTHER': '🎪'
    };
    return icons[category] || '📅';
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate basic info before proceeding
      const stepOneFields = ['name', 'description', 'category', 'location', 'startDate', 'endDate'];
      const hasErrors = stepOneFields.some(field => {
        const error = errors[field as keyof typeof errors];
        return error;
      });
      
      if (hasErrors || !formData.name || !formData.category || !formData.location) {
        toast.error('Please complete all required fields');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requireRole="ORGANIZER">
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
              <h1 className="text-4xl font-bold text-white">Create New Event</h1>
              <p className="text-gray-300 mt-2">Share your amazing event with the world</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="glassmorphism rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: 'Event Details', icon: Calendar },
                { step: 2, title: 'Tickets & Pricing', icon: Tag },
                { step: 3, title: 'Review & Publish', icon: Eye }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center flex-1">
                  <div className={`flex items-center gap-3 ${
                    currentStep >= item.step ? 'text-white' : 'text-gray-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= item.step 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                        : 'bg-gray-600'
                    }`}>
                      {currentStep > item.step ? (
                        <CheckCircle size={20} />
                      ) : (
                        <item.icon size={20} />
                      )}
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > item.step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="glassmorphism rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-purple-400" />
                Event Details
              </h2>

              {/* Event Name */}
              <div>
                <label className="block text-white font-semibold mb-2">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter an engaging event name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Describe what makes your event special..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-semibold mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  onBlur={() => handleBlur('category')}
                  className={`w-full p-4 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.category ? 'border-red-500' : 'border-white/20'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-gray-800">
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-2">{errors.category}</p>}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    onBlur={() => handleBlur('location')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.location ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="e.g., Jakarta Convention Center"
                  />
                  {errors.location && <p className="text-red-400 text-sm mt-2">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Full Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Complete address for attendees"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    onBlur={() => handleBlur('startDate')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.startDate ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-400 text-sm mt-2">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    onBlur={() => handleBlur('endDate')}
                    className={`w-full p-4 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.endDate ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-400 text-sm mt-2">{errors.endDate}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white font-semibold mb-2">Event Image</label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Event preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-gray-300 mb-4">Upload an image to make your event stand out</p>
                      <label className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                        <Upload size={20} />
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-gray-400 text-sm mt-2">Max size: 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tickets & Pricing */}
          {currentStep === 2 && (
            <div className="glassmorphism rounded-2xl p-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tag className="text-purple-400" />
                  Tickets & Pricing
                </h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => handleChange('isFree', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    Free Event
                  </label>
                  <button
                    onClick={addTicketType}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus size={16} />
                    Add Ticket Type
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Ticket Type {index + 1}</h3>
                      {tickets.length > 1 && (
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Ticket Name</label>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., VIP Pass"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Ticket Type</label>
                        <select
                          value={ticket.type}
                          onChange={(e) => updateTicket(ticket.id, { type: e.target.value as any })}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {ticketTypes.map((type) => (
                            <option key={type} value={type} className="bg-gray-800">
                              {type.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">
                          Price {formData.isFree && '(Free Event)'}
                        </label>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicket(ticket.id, { price: formData.isFree ? 0 : parseInt(e.target.value) || 0 })}
                          disabled={formData.isFree}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Quantity</label>
                        <input
                          type="number"
                          value={ticket.quantity}
                          onChange={(e) => updateTicket(ticket.id, { quantity: parseInt(e.target.value) || 0 })}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-white font-medium mb-2">Description</label>
                        <input
                          type="text"
                          value={ticket.description}
                          onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="What's included with this ticket?"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Info size={20} className="text-blue-400" />
                  Ticket Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Seats</p>
                    <p className="text-white font-bold text-lg">{formData.totalSeats}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ticket Types</p>
                    <p className="text-white font-bold text-lg">{tickets.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price Range</p>
                    <p className="text-white font-bold text-lg">
                      {formData.isFree ? 'Free' : 
                        tickets.length > 1 ? 
                          `${formatCurrency(Math.min(...tickets.map(t => t.price)))} - ${formatCurrency(Math.max(...tickets.map(t => t.price)))}` :
                          formatCurrency(tickets[0]?.price || 0)
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {currentStep === 3 && (
            <div className="glassmorphism rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Eye className="text-purple-400" />
                Review & Publish
              </h2>

              {/* Event Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Card Preview */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 relative">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt={formData.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Calendar className="text-white" size={64} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                        {getCategoryIcon(formData.category)} {formData.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{formData.name || 'Event Name'}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{formData.description || 'Event description'}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-purple-500" />
                        <span className="text-sm">
                          {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'Start date'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-purple-500" />
                        <span className="text-sm">{formData.location || 'Location'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className="text-purple-500" />
                        <span className="text-sm">{formData.totalSeats} total seats</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {formData.isFree ? 'Free' : formatCurrency(tickets[0]?.price || 0)}
                        </p>
                        {tickets.length > 1 && !formData.isFree && (
                          <p className="text-sm text-gray-500">Starting from</p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                        Get Tickets
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Event Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{formData.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{formData.category || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">{formData.location || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Seats:</span>
                        <span className="text-white">{formData.totalSeats}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Ticket Types ({tickets.length})</h4>
                    <div className="space-y-2">
                      {tickets.map((ticket, index) => (
                        <div key={ticket.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white text-sm font-medium">{ticket.name}</p>
                            <p className="text-gray-400 text-xs">{ticket.type.replace('_', ' ')} • {ticket.quantity} seats</p>
                          </div>
                          <p className="text-purple-300 font-bold">
                            {formData.isFree ? 'Free' : formatCurrency(ticket.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className={`p-4 rounded-xl border ${
                    isValid ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isValid ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : (
                        <AlertCircle className="text-red-400" size={20} />
                      )}
                      <h4 className={`font-semibold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {isValid ? 'Ready to Publish' : 'Action Required'}
                      </h4>
                    </div>
                    <p className={`text-sm ${isValid ? 'text-green-300' : 'text-red-300'}`}>
                      {isValid ? 
                        'Your event is complete and ready to be published.' :
                        'Please go back and fix the required fields before publishing.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep === 3 && (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  Save as Draft
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Next
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !isValid}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Publish Event
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
