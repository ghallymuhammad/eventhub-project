'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Users, 
  Mail,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'event' | 'ticket' | 'system' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ticket',
      title: 'New Ticket Sale',
      message: 'Someone just purchased a ticket for "Bandung Pop Festival"',
      timestamp: '2025-10-20T10:30:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/organizer/dashboard'
    },
    {
      id: '2',
      type: 'event',
      title: 'Event Reminder',
      message: 'Your event "Bandung Pop Festival" starts in 3 days',
      timestamp: '2025-10-20T08:00:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/events/1'
    },
    {
      id: '3',
      type: 'system',
      title: 'Profile Update',
      message: 'Your organizer profile has been successfully updated',
      timestamp: '2025-10-19T15:45:00Z',
      read: true,
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'ticket': return <Users className="w-5 h-5 text-green-400" />;
      case 'system': return <Bell className="w-5 h-5 text-purple-400" />;
      case 'payment': return <Mail className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'important': return notification.priority === 'high';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              className="bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-xl rounded-xl p-1 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'important', label: 'Important' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'important'
                  ? "No important notifications at this time."
                  : "You have no notifications yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white/10 backdrop-blur-xl rounded-xl border-l-4 ${getPriorityColor(notification.priority)} border-r border-t border-b border-white/20 transition-all hover:bg-white/20 cursor-pointer`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    router.push(notification.actionUrl);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium ${
                            notification.read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${
                          notification.read ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {notification.priority === 'high' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      {notification.read && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="text-white mb-2">
            🚀 <strong>Coming Soon</strong>
          </div>
          <p className="text-gray-400 text-sm">
            Real-time notifications, email alerts, and push notifications are currently in development.
            For now, this is a preview of how your notifications will look.
          </p>
        </div>
      </div>
    </div>
  );
}
