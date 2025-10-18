'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { api } from '@/libs/api';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  Tag,
  Clock,
  FileText,
  Save,
  Eye
} from 'lucide-react';

interface EventFormData {
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  price: number;
  capacity: number;
  imageUrl: string;
}

const eventValidationSchema = Yup.object({
  name: Yup.string().required('Event name is required').min(3, 'Name must be at least 3 characters'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: Yup.string().required('Category is required'),
  location: Yup.string().required('Location is required'),
  startDate: Yup.date().required('Start date is required').min(new Date(), 'Start date must be in the future'),
  endDate: Yup.date().required('End date is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  capacity: Yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1'),
});

const categories = [
  'MUSIC',
  'TECHNOLOGY', 
  'ARTS',
  'FOOD',
  'BUSINESS',
  'SPORTS',
  'EDUCATION',
  'HEALTH',
  'FASHION',
  'TRAVEL',
  'PHOTOGRAPHY',
  'GAMING',
  'FITNESS',
  'OTHER'
];

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const initialValues: EventFormData = {
    name: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    price: 0,
    capacity: 100,
    imageUrl: ''
  };

  const handleSubmit = async (values: EventFormData) => {
    setIsLoading(true);
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
      const endDateTime = new Date(`${values.endDate}T${values.endTime}`);

      // Validate dates
      if (endDateTime <= startDateTime) {
        toast.error('End date/time must be after start date/time');
        return;
      }

      const eventData = {
        name: values.name,
        description: values.description,
        category: values.category,
        location: values.location,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        price: values.price,
        capacity: values.capacity,
        imageUrl: values.imageUrl || null
      };

      console.log('Creating event:', eventData);

      // Call the API to create the event
      const response = await api.events.create(eventData);
      
      console.log('Event created:', response.data);
      toast.success('🎉 Event created successfully!');
      
      // Redirect to dashboard
      router.push('/organizer/dashboard?eventCreated=true');
      
    } catch (error: any) {
      console.error('Event creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/organizer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBack}
              className="text-white hover:text-purple-200 mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Create New Event</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={eventValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                        Event Name *
                      </label>
                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter event name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="name" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                        Description *
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        rows={4}
                        placeholder="Describe your event in detail..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <ErrorMessage name="description" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                        Category *
                      </label>
                      <Field
                        as="select"
                        name="category"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="" className="bg-gray-800">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category} className="bg-gray-800">
                            {category}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Field
                          name="location"
                          type="text"
                          placeholder="Event location"
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <ErrorMessage name="location" component="div" className="mt-2 text-sm text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Date & Time
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-white mb-2">
                        Start Date *
                      </label>
                      <Field
                        name="startDate"
                        type="date"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="startDate" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-white mb-2">
                        Start Time *
                      </label>
                      <Field
                        name="startTime"
                        type="time"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="startTime" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                        End Date *
                      </label>
                      <Field
                        name="endDate"
                        type="date"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="endDate" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-white mb-2">
                        End Time *
                      </label>
                      <Field
                        name="endTime"
                        type="time"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="endTime" component="div" className="mt-2 text-sm text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Pricing & Capacity */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Pricing & Capacity
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
                        Ticket Price (Rp) *
                      </label>
                      <Field
                        name="price"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <ErrorMessage name="price" component="div" className="mt-2 text-sm text-red-400" />
                    </div>

                    <div>
                      <label htmlFor="capacity" className="block text-sm font-medium text-white mb-2">
                        Maximum Capacity *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Field
                          name="capacity"
                          type="number"
                          min="1"
                          placeholder="100"
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <ErrorMessage name="capacity" component="div" className="mt-2 text-sm text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Event Image */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Event Image (Optional)
                  </h2>
                  
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-white mb-2">
                      Image URL
                    </label>
                    <Field
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Provide a URL to an image for your event. This will be displayed on the event card.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Event...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Create Event
                      </div>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
