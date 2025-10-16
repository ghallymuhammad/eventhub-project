"use client";

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { toast } from 'sonner';
import { eventValidationSchema } from '@/validations/schemas';
import { 
  FormField, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormFile,
  FormButton, 
  FormGroup 
} from './FormComponents';
import { api } from '@/libs/api';

interface EventFormData {
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
}

interface CreateEventFormProps {
  onSuccess?: (eventData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const initialValues: EventFormData = {
    name: '',
    description: '',
    category: '',
    location: '',
    address: '',
    startDate: '',
    endDate: '',
    price: 0,
    availableSeats: 0,
    totalSeats: 0,
    isFree: true,
  };

  const categoryOptions = [
    { value: 'MUSIC', label: '🎵 Music & Concerts' },
    { value: 'TECHNOLOGY', label: '💻 Technology & Innovation' },
    { value: 'BUSINESS', label: '💼 Business & Networking' },
    { value: 'SPORTS', label: '⚽ Sports & Fitness' },
    { value: 'ARTS', label: '🎨 Arts & Culture' },
    { value: 'FOOD', label: '🍕 Food & Drink' },
    { value: 'EDUCATION', label: '📚 Education & Learning' },
    { value: 'HEALTH', label: '🏥 Health & Wellness' },
    { value: 'OTHER', label: '🎪 Other' },
  ];

  // Format date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  const handleSubmit = async (values: EventFormData) => {
    setIsLoading(true);
    
    try {
      // Create the event first
      const response = await api.events.create({
        ...values,
        price: values.isFree ? 0 : Math.round(values.price),
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });

      const eventId = response.data.event.id;

      // Upload image if selected
      if (selectedImage) {
        try {
          const formData = new FormData();
          formData.append('image', selectedImage);
          await api.events.uploadImage(eventId, formData);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Don't fail the entire process if image upload fails
          toast.warning('Event created successfully, but image upload failed');
        }
      }

      toast.success('Event created successfully! 🎉');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create event. Please try again.';
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Event
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share your amazing event with the world
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={eventValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-8">
            {/* Basic Information */}
            <FormGroup
              title="Event Information"
              description="Tell us about your event"
            >
              <FormField
                name="name"
                label="Event Name"
                placeholder="Enter an exciting event name"
                required
              />
              
              <FormTextarea
                name="description"
                label="Event Description"
                placeholder="Describe what makes your event special..."
                rows={4}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  name="category"
                  label="Event Category"
                  options={categoryOptions}
                  placeholder="Select a category"
                  required
                />
                
                <FormFile
                  name="eventImage"
                  label="Event Image"
                  accept="image/*"
                  onFileSelect={setSelectedImage}
                />
              </div>
            </FormGroup>

            {/* Location & Time */}
            <FormGroup
              title="When & Where"
              description="Set the time and location for your event"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="location"
                  label="City/Location"
                  placeholder="e.g., Jakarta, Bali, Surabaya"
                  required
                />
                
                <FormField
                  name="address"
                  label="Venue Address"
                  placeholder="Full venue address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="startDate"
                  label="Start Date & Time"
                  type="datetime-local"
                  required
                />
                
                <FormField
                  name="endDate"
                  label="End Date & Time"
                  type="datetime-local"
                  required
                />
              </div>
            </FormGroup>

            {/* Pricing & Capacity */}
            <FormGroup
              title="Pricing & Capacity"
              description="Set your event pricing and capacity"
            >
              <div className="space-y-4">
                <FormCheckbox
                  name="isFree"
                  label="This is a free event"
                />
                
                {!values.isFree && (
                  <FormField
                    name="price"
                    label="Ticket Price (IDR)"
                    type="number"
                    placeholder="e.g., 50000"
                    required={!values.isFree}
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="totalSeats"
                    label="Total Seats"
                    type="number"
                    placeholder="e.g., 100"
                    required
                  />
                  
                  <FormField
                    name="availableSeats"
                    label="Available Seats"
                    type="number"
                    placeholder="Should be ≤ total seats"
                    required
                  />
                </div>
              </div>
            </FormGroup>

            {/* Preview Section */}
            {values.name && (
              <FormGroup
                title="Event Preview"
                description="Here&apos;s how your event will look"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {values.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {values.description || 'Event description will appear here...'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">📍 Location:</span>{' '}
                      {values.location || 'TBD'}
                    </div>
                    <div>
                      <span className="font-medium">🎫 Price:</span>{' '}
                      {values.isFree ? 'FREE' : `IDR ${values.price?.toLocaleString('id-ID')}`}
                    </div>
                    <div>
                      <span className="font-medium">📅 Start:</span>{' '}
                      {values.startDate ? new Date(values.startDate).toLocaleString('id-ID') : 'TBD'}
                    </div>
                    <div>
                      <span className="font-medium">👥 Capacity:</span>{' '}
                      {values.totalSeats || 'TBD'} seats
                    </div>
                  </div>
                </div>
              </FormGroup>
            )}

            {/* Submit Buttons */}
            <FormGroup>
              <div className="flex flex-col sm:flex-row gap-4">
                <FormButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Event...' : 'Create Event'}
                </FormButton>
                
                <FormButton
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => window.history.back()}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </FormButton>
              </div>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </div>
  );
};
