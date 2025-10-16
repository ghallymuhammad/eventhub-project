"use client";

import { useState } from 'react';
import { X, Heart, Calendar, Tag, StickyNote } from 'lucide-react';
import { useYupValidation } from '@/hooks/useYupValidation';
import { eventFavoriteValidationSchema } from '@/validations/schemas';
import { toast } from 'sonner';

interface AddToFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    name: string;
    startDate: string;
    category: string;
  };
}

interface EventFavoriteForm {
  notes: string;
  reminderDate?: Date | null;
  categories: string[];
}

const availableCategories = [
  'Want to Attend',
  'Maybe Later',
  'Recommended',
  'Work Related',
  'Personal Interest',
  'Family & Friends',
  'Entertainment',
  'Learning',
];

export default function AddToFavoritesModal({
  isOpen,
  onClose,
  event,
}: AddToFavoritesModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useYupValidation<EventFavoriteForm>(
    eventFavoriteValidationSchema,
    {
      notes: '',
      reminderDate: null,
      categories: [],
    }
  );

  const toggleCategory = (category: string) => {
    const currentCategories = values.categories || [];
    let updatedCategories;
    
    if (currentCategories.includes(category)) {
      updatedCategories = currentCategories.filter(c => c !== category);
    } else {
      updatedCategories = [...currentCategories, category];
    }
    
    handleChange('categories', updatedCategories);
  };

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  const handleDateChange = (dateString: string) => {
    if (dateString) {
      handleChange('reminderDate', new Date(dateString));
    } else {
      handleChange('reminderDate', null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateAll();
    if (!isFormValid) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically save to your API
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Event added to favorites successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to add to favorites. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-red-400" />
              Add to Favorites
            </h2>
            <p className="text-gray-400 mt-1">
              Save &quot;{event.name}&quot; to your favorites
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Preview */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-white font-semibold mb-2">{event.name}</h3>
            <div className="text-gray-400 text-sm space-y-1">
              <p>📅 {new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p>🏷️ {event.category}</p>
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <StickyNote size={16} className="inline mr-1" />
              Personal Notes (Optional)
            </label>
            <textarea
              value={values.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              rows={4}
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none transition-colors ${
                errors.notes ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="Add any personal notes about this event... Why are you interested? What to remember? etc."
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {values.notes.length}/300 characters
            </p>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Set Reminder (Optional)
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(values.reminderDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              onBlur={() => handleBlur('reminderDate')}
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-colors ${
                errors.reminderDate ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.reminderDate && (
              <p className="text-red-400 text-sm mt-1">{errors.reminderDate}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Get notified before the event starts
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Tag size={16} className="inline mr-1" />
              Categories (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    values.categories?.includes(category)
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-400 text-sm mt-2">{errors.categories}</p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              {values.categories?.length || 0}/5 categories selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Heart size={16} />
                  Add to Favorites
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
