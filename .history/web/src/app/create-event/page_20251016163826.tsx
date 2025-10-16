"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Tag, 
  DollarSign,
  Image as ImageIcon,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventCreationSchema, type EventCreationInput } from '@/validations/schemas';

interface TicketInput {
  type: 'REGULAR' | 'VIP' | 'EARLY_BIRD' | 'STUDENT';
  name: string;
  description: string;
  price: number;
  availableSeats: number;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [tickets, setTickets] = useState<TicketInput[]>([
    { type: 'REGULAR', name: 'Regular Ticket', description: '', price: 0, availableSeats: 100 }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<EventCreationInput>({
    resolver: zodResolver(eventCreationSchema),
    defaultValues: {
      isFree: false,
      price: 0,
      availableSeats: 100,
      totalSeats: 100,
    }
  });

  const isFree = watch('isFree');
  const availableSeats = watch('availableSeats');

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Add new ticket type
  const addTicket = () => {
    setTickets([...tickets, { 
      type: 'REGULAR', 
      name: '', 
      description: '', 
      price: 0, 
      availableSeats: 50 
    }]);
  };

  // Remove ticket type
  const removeTicket = (index: number) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((_, i) => i !== index));
    }
  };

  // Update ticket
  const updateTicket = (index: number, field: keyof TicketInput, value: any) => {
    const updatedTickets = [...tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setTickets(updatedTickets);
  };

  // Calculate total seats from tickets
  const calculateTotalSeats = () => {
    const total = tickets.reduce((sum, ticket) => sum + ticket.availableSeats, 0);
    setValue('totalSeats', total);
    setValue('availableSeats', total);
  };

  // Handle form submission
  const onSubmit = async (data: EventCreationInput) => {
    try {
      setLoading(true);

      // Create event
      const eventResponse = await api.events.create({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        price: data.isFree ? 0 : data.price * 100, // Convert to cents
      });

      if (!eventResponse.data?.success) {
        throw new Error(eventResponse.data?.message || 'Failed to create event');
      }

      const eventId = eventResponse.data.event.id;

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        try {
          await api.events.uploadImage(eventId.toString(), formData);
        } catch (error) {
          console.warn('Failed to upload image, but event was created:', error);
        }
      }

      // Create tickets
      if (!data.isFree) {
        for (const ticket of tickets) {
          if (ticket.name.trim()) {
            try {
              await api.tickets.create(eventId.toString(), {
                ...ticket,
                price: ticket.price * 100, // Convert to cents
              });
            } catch (error) {
              console.warn('Failed to create ticket:', ticket.name, error);
            }
          }
        }
      }

      toast.success('Event created successfully! 🎉');
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-4xl font-bold text-white">Create New Event</h1>
            <p className="text-gray-300 mt-2">Share your amazing event with the world</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Tag className="text-purple-400" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">Event Name *</label>
                <input
                  {...register('name')}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your event name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-semibold mb-2">Category *</label>
                <select
                  {...register('category')}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Select Category</option>
                  <option value="MUSIC">🎵 Music</option>
                  <option value="TECHNOLOGY">💻 Technology</option>
                  <option value="BUSINESS">💼 Business</option>
                  <option value="SPORTS">⚽ Sports</option>
                  <option value="ARTS">🎨 Arts</option>
                  <option value="FOOD">🍕 Food</option>
                  <option value="EDUCATION">📚 Education</option>
                  <option value="HEALTH">🏥 Health</option>
                  <option value="OTHER">🎪 Other</option>
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-2">{errors.category.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-white font-semibold mb-2">Location *</label>
                <input
                  {...register('location')}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Jakarta, Bandung"
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-2">{errors.location.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">Full Address *</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter complete venue address"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-2">{errors.address.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">Description *</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your event in detail..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-2">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-purple-400" />
              Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Start Date & Time *</label>
                <input
                  {...register('startDate')}
                  type="datetime-local"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.startDate && (
                  <p className="text-red-400 text-sm mt-2">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">End Date & Time *</label>
                <input
                  {...register('endDate')}
                  type="datetime-local"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {errors.endDate && (
                  <p className="text-red-400 text-sm mt-2">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Seats */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="text-purple-400" />
              Pricing & Capacity
            </h2>

            {/* Free Event Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('isFree')}
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 bg-transparent border-2 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-white font-semibold">This is a free event</span>
              </label>
            </div>

            {!isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Base Price (IDR) *</label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="1000"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="50000"
                  />
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-2">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Available Seats *</label>
                  <input
                    {...register('availableSeats', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="100"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setValue('availableSeats', value);
                      setValue('totalSeats', value);
                    }}
                  />
                  {errors.availableSeats && (
                    <p className="text-red-400 text-sm mt-2">{errors.availableSeats.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Types (for paid events) */}
            {!isFree && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Ticket Types</h3>
                  <button
                    type="button"
                    onClick={addTicket}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                  >
                    <Plus size={16} />
                    Add Ticket Type
                  </button>
                </div>

                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Ticket Type {index + 1}</h4>
                        {tickets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicket(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-white text-sm mb-2">Type</label>
                          <select
                            value={ticket.type}
                            onChange={(e) => updateTicket(index, 'type', e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                          >
                            <option value="REGULAR">Regular</option>
                            <option value="VIP">VIP</option>
                            <option value="EARLY_BIRD">Early Bird</option>
                            <option value="STUDENT">Student</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Name</label>
                          <input
                            value={ticket.name}
                            onChange={(e) => updateTicket(index, 'name', e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ticket name"
                          />
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Price (IDR)</label>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => updateTicket(index, 'price', parseInt(e.target.value) || 0)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="50000"
                          />
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Seats</label>
                          <input
                            type="number"
                            value={ticket.availableSeats}
                            onChange={(e) => {
                              updateTicket(index, 'availableSeats', parseInt(e.target.value) || 0);
                              calculateTotalSeats();
                            }}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="50"
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="block text-white text-sm mb-2">Description</label>
                          <input
                            value={ticket.description}
                            onChange={(e) => updateTicket(index, 'description', e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Brief ticket description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event Image */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-purple-400" />
              Event Image
            </h2>

            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-400 mb-4">Upload an image to make your event more appealing</p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-all">
                    <Upload size={16} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
