'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/libs/api';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Image as ImageIcon,
  Save,
  Eye
} from 'lucide-react';
import Image from 'next/image';

interface EventFormData {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventFormData>({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    price: 0,
    totalSeats: 0,
    category: '',
    imageUrl: '',
    isActive: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    'Music',
    'Technology',
    'Business',
    'Arts',
    'Sports',
    'Food',
    'Education',
    'Health'
  ];

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEventData = async () => {
    try {
      const response = await api.events.getById(eventId);
      const eventData = response.data.data;
      
      // Format dates for datetime-local input
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);
      
      const formatDateForInput = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };

      setEvent({
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        price: eventData.price,
        totalSeats: eventData.totalSeats,
        category: eventData.category,
        imageUrl: eventData.imageUrl || '',
        isActive: eventData.isActive
      });

      if (eventData.imageUrl) {
        setImagePreview(eventData.imageUrl);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      toast.error('Failed to load event data');
      router.push('/organizer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!event.name || !event.description || !event.location || !event.startDate || !event.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(event.startDate) >= new Date(event.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setSaving(true);
    try {
      // Update event data
      await api.events.update(eventId, {
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString()
      });

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.events.uploadImage(eventId, formData);
      }

      toast.success('Event updated successfully!');
      router.push('/organizer/dashboard');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/events/${eventId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/organizer/dashboard')}
                className="text-white hover:text-purple-200 mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">Edit Event</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreview}
                className="bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={event.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter event name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={event.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="Describe your event"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={event.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Location */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Date & Location</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location *
                  </label>
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter event location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={event.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={event.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Pricing & Capacity</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Ticket Price (IDR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={event.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={event.totalSeats}
                    onChange={(e) => handleInputChange('totalSeats', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Event Status</h2>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={event.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-300">
                  Event is published and active
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Inactive events will not be visible to users
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Event Image</h2>
              
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Event preview"
                      width={500}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        handleInputChange('imageUrl', '');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Upload an event image</p>
                  </div>
                )}

                <input
                  type="file"
                  id="eventImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="eventImage"
                  className="block w-full bg-white/10 text-white py-3 rounded-xl text-center hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Choose New Image
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
