'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/libs/api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Bell,
  Shield,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import Image from 'next/image';

interface OrganizerProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    eventReminders: boolean;
  };
}

export default function OrganizerSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const [profile, setProfile] = useState<OrganizerProfile>({
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    avatar: '',
    organizationName: '',
    organizationDescription: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      eventReminders: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get user data from localStorage first
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        toast.error('Please log in to access settings.');
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'ORGANIZER') {
        toast.error('Access denied. Organizer account required.');
        router.push('/');
        return;
      }

      // Try to load from API, fallback to localStorage data
      try {
        const response = await api.users.getProfile();
        const profileData = response.data.data;
        
        setProfile({
          ...profile,
          ...profileData,
          socialMedia: profileData.socialMedia || profile.socialMedia,
          preferences: profileData.preferences || profile.preferences
        });
      } catch (error) {
        // Fallback to localStorage data
        setProfile(prev => ({
          ...prev,
          id: parsedUser.id,
          email: parsedUser.email,
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || ''
        }));
        console.warn('Could not load profile from API, using localStorage data');
      }

      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile
      await api.users.updateProfile(profile);

      // Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.users.uploadAvatar(formData);
      }

      // Update localStorage
      const currentUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const updatedUserData = {
        ...currentUserData,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      };
      localStorage.setItem('user_data', JSON.stringify(updatedUserData));

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading settings...</p>
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
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                  
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar"
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar"
                        className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer hover:bg-purple-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{profile.firstName} {profile.lastName}</h3>
                      <p className="text-gray-400">{profile.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phoneNumber || ''}
                        onChange={(e) => handleProfileUpdate('phoneNumber', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profile.address || ''}
                        onChange={(e) => handleProfileUpdate('address', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Organization Tab */}
              {activeTab === 'organization' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">Organization Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={profile.organizationName || ''}
                        onChange={(e) => handleProfileUpdate('organizationName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter organization name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Description
                      </label>
                      <textarea
                        value={profile.organizationDescription || ''}
                        onChange={(e) => handleProfileUpdate('organizationDescription', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Describe your organization"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website || ''}
                        onChange={(e) => handleProfileUpdate('website', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        placeholder="https://your-website.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={profile.socialMedia?.facebook || ''}
                          onChange={(e) => handleProfileUpdate('socialMedia.facebook', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                          placeholder="Facebook URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={profile.socialMedia?.instagram || ''}
                          onChange={(e) => handleProfileUpdate('socialMedia.instagram', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                          placeholder="Instagram URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={profile.socialMedia?.twitter || ''}
                          onChange={(e) => handleProfileUpdate('socialMedia.twitter', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                          placeholder="Twitter URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={profile.socialMedia?.linkedin || ''}
                          onChange={(e) => handleProfileUpdate('socialMedia.linkedin', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                          placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive marketing and promotional emails' },
                      { key: 'eventReminders', label: 'Event Reminders', description: 'Receive reminders about your events' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <h3 className="text-white font-medium">{item.label}</h3>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.preferences[item.key as keyof typeof profile.preferences]}
                          onChange={(e) => handleProfileUpdate(`preferences.${item.key}`, e.target.checked)}
                          className="w-5 h-5 text-purple-600 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Change Password</h3>
                          <p className="text-gray-400 text-sm">Update your account password</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordFields(!showPasswordFields)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                        >
                          {showPasswordFields ? 'Cancel' : 'Change Password'}
                        </button>
                      </div>

                      {showPasswordFields && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                              placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                              placeholder="Confirm new password"
                            />
                          </div>

                          <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
