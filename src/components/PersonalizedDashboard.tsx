"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  HeartIcon, 
  MapPinIcon, 
  StarIcon, 
  ClockIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton, DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Tooltip, HelpIcon } from '@/components/ui/Tooltip';
import Image from 'next/image';

interface PersonalizedDashboardProps {
  className?: string;
}

interface UserStats {
  totalBookings: number;
  totalSpent: number;
  favoriteDestinations: string[];
  averageRating: number;
  memberSince: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'wishlist';
  title: string;
  date: string;
  status?: string;
}

export function PersonalizedDashboard({ className = '' }: PersonalizedDashboardProps) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', user?.id);

      const { data: reviews } = await supabase
        .from('tales')
        .select('*')
        .eq('guest_id', user?.id);

      const { data: wishlist } = await supabase
        .from('bucketlist')
        .select('*')
        .eq('user_id', user?.id);

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const averageRating = reviews?.length ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

      setStats({
        totalBookings,
        totalSpent,
        favoriteDestinations: ['Goa', 'Himachal Pradesh', 'Kerala'],
        averageRating,
        memberSince: user?.created_at || new Date().toISOString()
      });

      // Fetch recent activity
      const activities: RecentActivity[] = [];
      
      if (bookings) {
        bookings.slice(0, 3).forEach(booking => {
          activities.push({
            id: booking.id,
            type: 'booking',
            title: `Booked ${booking.property_title || 'Property'}`,
            date: booking.created_at,
            status: booking.status
          });
        });
      }

      if (reviews) {
        reviews.slice(0, 2).forEach(review => {
          activities.push({
            id: review.id,
            type: 'review',
            title: `Reviewed ${review.item_title || 'Property'}`,
            date: review.created_at
          });
        });
      }

      setRecentActivity(activities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 5));

      // Mock recommendations (in real app, this would be AI-powered)
      setRecommendations([
        {
          id: '1',
          title: 'Mountain Retreat in Himachal',
          location: 'Manali, Himachal Pradesh',
          price: 2500,
          rating: 4.8,
          image: '',
          reason: 'Based on your love for mountains'
        },
        {
          id: '2',
          title: 'Beach House in Goa',
          location: 'Calangute, Goa',
          price: 3200,
          rating: 4.6,
          image: '',
          reason: 'Perfect for your next beach vacation'
        }
      ]);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personalized Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {profile?.display_name || profile?.first_name || 'Traveler'}! 👋
              </h1>
              <p className="text-blue-100">
                Ready for your next adventure? Let's explore amazing homestays together.
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-blue-100">
            <SparklesIcon className="w-5 h-5" />
            <span className="text-sm">Member since {formatDate(stats?.memberSince || '')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalSpent || 0)}</p>
                <p className="text-xs text-gray-500">On homestays</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">₹</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center space-x-1">
                  <StarSolid className="w-5 h-5 text-yellow-400" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageRating.toFixed(1) || '0.0'}</p>
                </div>
                <p className="text-xs text-gray-500">Your reviews</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Tooltip content="Your latest bookings, reviews, and saved items">
              <HelpIcon content="Your latest bookings, reviews, and saved items" />
            </Tooltip>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'booking' ? 'bg-blue-100' :
                    activity.type === 'review' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {activity.type === 'booking' ? (
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                    ) : activity.type === 'review' ? (
                      <StarIcon className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                  {activity.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Start exploring to see your activity here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
            <Tooltip content="Properties we think you'll love based on your preferences">
              <HelpIcon content="Properties we think you'll love based on your preferences" />
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    <Image
                      src={rec.image}
                      alt={rec.title}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{rec.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{rec.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <StarSolid className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">{rec.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs font-medium text-gray-900">{formatCurrency(rec.price)}/night</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">{rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          Explore Properties
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
          <HeartIcon className="w-5 h-5" />
          My Bucket List
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          My Bookings
        </Button>
      </div>
    </div>
  );
}
