"use client";

import { useState } from 'react';
import { X, Send, User, Mail, MessageSquare, FileText } from 'lucide-react';
import { useYupValidation } from '@/hooks/useYupValidation';
import { contactOrganizerValidationSchema } from '@/validations/schemas';
import { toast } from 'sonner';

interface ContactOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  eventName: string;
  eventId: string;
}

interface ContactOrganizerForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactOrganizerModal({
  isOpen,
  onClose,
  organizer,
  eventName,
  eventId,
}: ContactOrganizerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useYupValidation<ContactOrganizerForm>(
    contactOrganizerValidationSchema,
    {
      name: '',
      email: '',
      subject: `Inquiry about ${eventName}`,
      message: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateAll();
    if (!isFormValid) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the message to your API
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully! The organizer will get back to you soon.');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
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
            <h2 className="text-2xl font-bold text-white">Contact Organizer</h2>
            <p className="text-gray-400 mt-1">
              Send a message to {organizer.firstName} {organizer.lastName}
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
          {/* Organizer Info */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {organizer.firstName} {organizer.lastName}
                </p>
                <p className="text-gray-400 text-sm">{organizer.email}</p>
              </div>
            </div>
          </div>

          {/* Your Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={16} className="inline mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Your Email
                </label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Message Details</h3>
            
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText size={16} className="inline mr-1" />
                Subject
              </label>
              <input
                type="text"
                value={values.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-colors ${
                  errors.subject ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="What is this message about?"
              />
              {errors.subject && (
                <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MessageSquare size={16} className="inline mr-1" />
                Message
              </label>
              <textarea
                value={values.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                rows={6}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none transition-colors ${
                  errors.message ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="Write your message here... Ask questions about the event, request more information, or share your thoughts."
              />
              {errors.message && (
                <p className="text-red-400 text-sm mt-1">{errors.message}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {values.message.length}/1000 characters
              </p>
            </div>
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
              disabled={isSubmitting || !isValid}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
