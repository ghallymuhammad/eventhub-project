"use client";

import { useState } from 'react';
import { X, Share2, Plus, Trash2, Copy, Send, Mail, MessageSquare, User } from 'lucide-react';
import { useYupValidation } from '@/hooks/useYupValidation';
import { shareEventValidationSchema } from '@/validations/schemas';
import { toast } from 'sonner';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    name: string;
    startDate: string;
    location: string;
    organizer: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ShareEventForm {
  recipientEmails: string[];
  personalMessage: string;
  senderName: string;
}

export default function ShareEventModal({
  isOpen,
  onClose,
  event,
}: ShareEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useYupValidation<ShareEventForm>(
    shareEventValidationSchema,
    {
      recipientEmails: [],
      personalMessage: '',
      senderName: '',
    }
  );

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.id}`;

  const addEmail = () => {
    if (newEmail.trim() && !values.recipientEmails.includes(newEmail.trim())) {
      const updatedEmails = [...values.recipientEmails, newEmail.trim()];
      handleChange('recipientEmails', updatedEmails);
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    const updatedEmails = values.recipientEmails.filter(email => email !== emailToRemove);
    handleChange('recipientEmails', updatedEmails);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const copyEventUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success('Event URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateAll();
    if (!isFormValid) {
      toast.error('Please fix the form errors before sending');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the emails via your API
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Event shared with ${values.recipientEmails.length} recipient(s) successfully!`);
      reset();
      setNewEmail('');
      onClose();
    } catch (error) {
      toast.error('Failed to send emails. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setNewEmail('');
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
              <Share2 className="text-purple-400" />
              Share Event
            </h2>
            <p className="text-gray-400 mt-1">
              Share &quot;{event.name}&quot; with friends and family
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
        <div className="p-6 space-y-6">
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
              <p>📍 {event.location}</p>
              <p>👤 Organized by {event.organizer.firstName} {event.organizer.lastName}</p>
            </div>
          </div>

          {/* Quick Share URL */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Share</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
              <button
                onClick={copyEventUrl}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>

          {/* Email Share Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={16} className="inline mr-1" />
                Your Name
              </label>
              <input
                type="text"
                value={values.senderName}
                onChange={(e) => handleChange('senderName', e.target.value)}
                onBlur={() => handleBlur('senderName')}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-colors ${
                  errors.senderName ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="Enter your name"
              />
              {errors.senderName && (
                <p className="text-red-400 text-sm mt-1">{errors.senderName}</p>
              )}
            </div>

            {/* Email Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail size={16} className="inline mr-1" />
                Recipients
              </label>
              
              {/* Add Email Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  placeholder="Enter email address"
                />
                <button
                  type="button"
                  onClick={addEmail}
                  disabled={!newEmail.trim()}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Email List */}
              {values.recipientEmails.length > 0 && (
                <div className="space-y-2 mb-3">
                  {values.recipientEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-white">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.recipientEmails && (
                <p className="text-red-400 text-sm">{errors.recipientEmails}</p>
              )}
              
              <p className="text-gray-500 text-sm">
                {values.recipientEmails.length}/10 recipients
              </p>
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MessageSquare size={16} className="inline mr-1" />
                Personal Message (Optional)
              </label>
              <textarea
                value={values.personalMessage}
                onChange={(e) => handleChange('personalMessage', e.target.value)}
                onBlur={() => handleBlur('personalMessage')}
                rows={4}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none transition-colors ${
                  errors.personalMessage ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="Add a personal message to include with the event invitation..."
              />
              {errors.personalMessage && (
                <p className="text-red-400 text-sm mt-1">{errors.personalMessage}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {values.personalMessage.length}/500 characters
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
                disabled={isSubmitting || !isValid || values.recipientEmails.length === 0}
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
                    Send Invitations
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
