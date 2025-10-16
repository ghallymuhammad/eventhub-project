'use client';

import { useState } from 'react';
import { X, Facebook, Twitter, Link2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  eventUrl: string;
}

export default function ShareModal({ isOpen, onClose, eventName, eventUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareVia = (platform: string) => {
    const encodedUrl = encodeURIComponent(eventUrl);
    const encodedText = encodeURIComponent(`Check out this event: ${eventName}`);
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(eventName)}&body=${encodedText}%0A%0A${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glassmorphism rounded-3xl p-8 max-w-md w-full animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Share Event</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => shareVia('facebook')}
              className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all text-white font-semibold"
            >
              <Facebook size={20} />
              Facebook
            </button>
            <button
              onClick={() => shareVia('twitter')}
              className="flex items-center gap-3 p-4 bg-sky-500 hover:bg-sky-600 rounded-xl transition-all text-white font-semibold"
            >
              <Twitter size={20} />
              Twitter
            </button>
            <button
              onClick={() => shareVia('email')}
              className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all text-white font-semibold col-span-2"
            >
              <Mail size={20} />
              Email
            </button>
          </div>

          {/* Copy Link */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-gray-300 text-sm mb-3">Or copy link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <span>✓</span> Copied
                  </span>
                ) : (
                  <Link2 size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
