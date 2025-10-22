"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Star,
  Gift
} from 'lucide-react';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  pointBalance: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && user) {
      // For now, we'll use the user data from context
      // In a real app, you might fetch additional profile data
      const userProfile: UserProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: '', // Would be fetched from API
        dateOfBirth: '', // Would be fetched from API
        address: '', // Would be fetched from API
        pointBalance: user.pointBalance || 0,
        createdAt: new Date().toISOString() // Would be fetched from API
      };
      setProfile(userProfile);
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        address: userProfile.address || ''
      });
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, router, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call to update the profile
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setEditing(false);
      
      // Update profile state with form data
      if (profile) {
        setProfile({
          ...profile,
          ...formData
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || ''
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-white/70">Manage your account settings and preferences</p>
          </div>
          <div className="flex gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-white/70">{profile.email}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Reward Points</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{profile.pointBalance}</p>
                </div>

                <div className="bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Member Since</span>
                  </div>
                  <p className="text-white/80">{formatDate(profile.createdAt)}</p>
                </div>

                <div className="bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Account Status</span>
                  </div>
                  <p className="text-green-400 font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="bg-black/20 rounded-xl px-4 py-3 text-white">
                      {profile.firstName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="bg-black/20 rounded-xl px-4 py-3 text-white">
                      {profile.lastName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="bg-black/20 rounded-xl px-4 py-3 text-white/60 flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    {profile.email}
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="bg-black/20 rounded-xl px-4 py-3 text-white flex items-center gap-3">
                      <Phone className="w-5 h-5" />
                      {profile.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="bg-black/20 rounded-xl px-4 py-3 text-white">
                      {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Address
                  </label>
                  {editing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows={3}
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                    />
                  ) : (
                    <div className="bg-black/20 rounded-xl px-4 py-3 text-white flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5" />
                      {profile.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
