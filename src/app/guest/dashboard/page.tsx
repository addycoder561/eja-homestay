'use client';

import { useEffect, useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PersonalizedDashboard } from '@/components/PersonalizedDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { showToast } from '@/lib/toast-config';
import jsPDF from 'jspdf';
import { updateBookingStatus } from '@/lib/database';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  StarIcon,
  HeartIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Experience and trip data for lookup (should be fetched from DB in real app)
const experiences = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-111111111111",
    title: "Sunrise Mountain Hike",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    location: "Manali, Himachal Pradesh",
    duration: "4 hours",
    rating: 4.8,
    price: 2500
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-222222222222",
    title: "Local Food Tasting Tour",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80",
    location: "Mumbai, Maharashtra",
    duration: "3 hours",
    rating: 4.6,
    price: 1800
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-333333333333",
    title: "Pottery Workshop",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    location: "Jaipur, Rajasthan",
    duration: "2 hours",
    rating: 4.9,
    price: 1200
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-444444444444",
    title: "Old City Heritage Walk",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    location: "Delhi, NCR",
    duration: "3 hours",
    rating: 4.7,
    price: 1500
  },
];

const trips = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-aaaaaaaabbbb",
    title: "Golden Triangle Tour",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    location: "Delhi, Agra, Jaipur",
    duration: "7 days",
    rating: 4.8,
    price: 45000
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-bbbbbbbbcccc",
    title: "Goa Beach Getaway",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    location: "Goa",
    duration: "5 days",
    rating: 4.9,
    price: 35000
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ccccccccdddd",
    title: "Kerala Backwaters",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    location: "Kerala",
    duration: "6 days",
    rating: 4.7,
    price: 38000
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ddddddddaaaa",
    title: "Himalayan Adventure",
    image: "https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80",
    location: "Himachal Pradesh",
    duration: "8 days",
    rating: 4.6,
    price: 52000
  },
];

export default function GuestDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }
    
    const fetchBookings = async () => {
      // If no profile, silently set loading to false (user might not be logged in)
      if (!profile?.id) {
        setLoading(false);
        setBookings([]);
        setIsInitialLoad(false);
        return;
      }
      
      setLoading(true);
      try {
        // Try new schema first (user_id), fallback to old schema (guest_id) for backward compatibility
        let { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        
        // If no results and error suggests column doesn't exist, try old schema
        if ((!data || data.length === 0) && error && (error.message?.includes('column') || error.code === '42703')) {
          console.log('🔍 Trying old schema (guest_id) for backward compatibility...');
          const oldSchemaQuery = await supabase
            .from('bookings')
            .select('*')
            .eq('guest_id', profile.id)
            .order('created_at', { ascending: false });
          data = oldSchemaQuery.data;
          error = oldSchemaQuery.error;
        }
        if (error) {
          // Only show error toast if it's not the initial load and it's a real error
          const isRealError = error.code !== 'PGRST116' && 
                             error.message && 
                             !error.message.includes('No rows') &&
                             !error.message.includes('permission') &&
                             !error.message.includes('JWT') &&
                             !error.message.includes('JWTExpired');
          
          if (isRealError && !isInitialLoad) {
            console.error('Error fetching bookings:', error);
            showToast.error('Failed to fetch bookings');
          } else {
            // Log silently for initial load or expected errors
            if (process.env.NODE_ENV !== 'production') {
              console.error('Error fetching bookings:', error);
            }
          }
          setBookings([]);
        } else {
          setBookings(data || []);
        }
        setIsInitialLoad(false);
      } catch (err) {
        // Only show error for unexpected errors and if it's not initial load
        console.error('Error fetching bookings:', err);
        setBookings([]);
        if (!isInitialLoad) {
          // Only show toast after initial load
          showToast.error('Failed to fetch bookings');
        }
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, authLoading]);

  const getBookingDetails = (booking: any) => {
    // Support both old and new schema
    const bookingType = booking.booking_type || (booking.property_id ? 'property' : booking.experience_id ? 'experience' : booking.trip_id || booking.retreat_id ? 'retreat' : 'property');
    const itemId = booking.item_id || booking.property_id || booking.experience_id || booking.trip_id || booking.retreat_id;
    
    if (bookingType === 'property' || booking.property_id) {
      return {
        type: 'Homestay',
        title: booking.property?.title || 'Homestay',
        image: booking.property?.cover_image || '/globe.svg',
        location: booking.property?.location || 'Location not specified',
        duration: '1 night',
        rating: 4.5,
        price: booking.total_price || booking.total_amount
      };
    }
    if (bookingType === 'experience' || booking.experience_id) {
      const exp = experiences.find(e => e.id === itemId || e.id === booking.experience_id);
      return {
        type: 'Experience',
        title: booking.experience?.title || exp?.title || 'Experience',
        image: booking.experience?.cover_image || exp?.image || '/globe.svg',
        location: booking.experience?.location || exp?.location || 'Location not specified',
        duration: booking.experience?.duration || exp?.duration || 'Duration not specified',
        rating: booking.experience?.rating || exp?.rating || 4.5,
        price: booking.experience?.price || exp?.price || booking.total_price || booking.total_amount
      };
    }
    if (bookingType === 'retreat' || booking.trip_id || booking.retreat_id) {
      const trip = trips.find(t => t.id === itemId || t.id === booking.trip_id || t.id === booking.retreat_id);
      return {
        type: 'Retreat',
        title: booking.retreat?.title || trip?.title || 'Retreat',
        image: booking.retreat?.cover_image || trip?.image || '/globe.svg',
        location: booking.retreat?.location || trip?.location || 'Location not specified',
        duration: booking.retreat?.duration || trip?.duration || 'Duration not specified',
        rating: booking.retreat?.rating || trip?.rating || 4.5,
        price: booking.retreat?.price || trip?.price || booking.total_price || booking.total_amount
      };
    }
    return { 
      type: 'Booking', 
      title: 'Booking', 
      image: '/globe.svg',
      location: 'Location not specified',
      duration: 'Duration not specified',
      rating: 4.5,
      price: booking.total_price || booking.total_amount
    };
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <XMarkIcon className="w-4 h-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'paid').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalSpent = bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalSpent
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Type filter - support both old and new schema
    if (typeFilter !== 'all') {
      filtered = filtered.filter(b => {
        if (typeFilter === 'properties') {
          return b.booking_type === 'property' || b.property_id;
        }
        if (typeFilter === 'experiences') {
          return b.booking_type === 'experience' || b.experience_id;
        }
        if (typeFilter === 'retreats') {
          return b.booking_type === 'retreat' || b.trip_id || b.retreat_id;
        }
        return true;
      });
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b => {
        const details = getBookingDetails(b);
        return details.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               details.location.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return filtered;
  }, [bookings, statusFilter, typeFilter, searchQuery]);

  const generateReceipt = (booking: any, details: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
            doc.text('EJA', 20, 20);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text('Booking Receipt', 20, 50);
    
    // Booking Details
    doc.setFontSize(12);
    doc.text(`Booking ID: ${booking.id}`, 20, 70);
    doc.text(`Type: ${details.type}`, 20, 80);
    doc.text(`Title: ${details.title}`, 20, 90);
    doc.text(`Location: ${details.location}`, 20, 100);
    doc.text(`Date: ${booking.check_in_date}`, 20, 110);
    doc.text(`Guests: ${booking.guests_count}`, 20, 120);
    doc.text(`Status: ${booking.status}`, 20, 130);
    doc.text(`Total Price: ₹${booking.total_price}`, 20, 140);
    
    // Note: payment_ref field removed from new schema
    // Payment reference can be stored elsewhere if needed
    
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 170);
    
    doc.save(`receipt_${booking.id}.pdf`);
    showToast.success('Receipt downloaded successfully!');
  };

  const canCancel = (booking: any) => {
    const isPaid = booking.status === 'paid';
    const isFuture = new Date(booking.check_in_date) > new Date();
    const notCancelled = booking.status !== 'cancelled';
    return isPaid && isFuture && notCancelled;
  };

  const handleCancel = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await updateBookingStatus(bookingId, 'cancelled');
      showToast.success('Booking cancelled successfully.');
      // Refresh bookings - try new schema first, fallback to old schema
      let { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false });
      
      // If no results and error suggests column doesn't exist, try old schema
      if ((!data || data.length === 0) && error && (error.message?.includes('column') || error.code === '42703')) {
        const oldSchemaQuery = await supabase
          .from('bookings')
          .select('*')
          .eq('guest_id', profile!.id)
          .order('created_at', { ascending: false });
        data = oldSchemaQuery.data;
        error = oldSchemaQuery.error;
      }
      
      setBookings(data || []);
    }
  };

  const getUpcomingBookings = () => {
    return bookings.filter(b => {
      const isPaid = b.status === 'paid';
      const isFuture = new Date(b.check_in_date) > new Date();
      return isPaid && isFuture;
    }).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Personalized Dashboard */}
          <PersonalizedDashboard />
          
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-900 font-medium"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
              </button>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'paid', 'pending', 'failed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      statusFilter === status 
                        ? 'bg-yellow-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-sm font-semibold text-gray-700">Type:</span>
                  {['all', 'properties', 'experiences', 'retreats'].map((type) => (
                    <button
                      key={type}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        typeFilter === type 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTypeFilter(type)}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Bookings Section */}
          {getUpcomingBookings().length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CalendarIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Upcoming Trips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getUpcomingBookings().map((booking) => {
                  const details = getBookingDetails(booking);
                  return (
                    <Card key={`upcoming-${booking.id}`} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            {details.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{details.title}</h3>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">{details.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-yellow-600">₹{booking.total_price}</span>
                          <button
                            onClick={() => {
                              const itemId = booking.item_id || booking.property_id || booking.experience_id || booking.trip_id || booking.retreat_id;
                              router.push(`/${details.type.toLowerCase()}s/${itemId}`);
                            }}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Bookings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-yellow-500" />
              All Bookings ({filteredBookings.length})
            </h2>

            {!user ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your bookings</h3>
                <p className="text-gray-600 mb-6">Please sign in to access your booking history and manage your trips.</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Sign In
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                <span className="ml-3 text-gray-600">Loading your bookings...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'Start exploring amazing properties and experiences!'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Explore Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredBookings.map((booking) => {
                  const details = getBookingDetails(booking);
                  return (
                    <Card key={booking.id} className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Image Section */}
                          <div className="lg:w-80 lg:h-64 h-48 relative overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-t-none">
                            <img
                              src={details.image}
                              alt={details.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 left-4">
                              {statusBadge(booking.status)}
                            </div>
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm">
                              ₹{booking.total_price}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    {details.type}
                                  </span>
                                  <div className="flex items-center text-yellow-500">
                                    <StarIcon className="w-4 h-4 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">{details.rating}</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{details.title}</h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  <span className="text-sm">{details.location}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                    <span>{new Date(booking.check_in_date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span>{details.duration}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <UsersIcon className="w-4 h-4 mr-1" />
                                    <span>{booking.guests_count} guests</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                              {booking.status === 'paid' && (
                                <button
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold"
                                  onClick={() => generateReceipt(booking, details)}
                                >
                                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </button>
                              )}
                              
                              {canCancel(booking) && (
                                <button
                                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  <XMarkIcon className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </button>
                              )}

                              <button
                                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors text-sm font-semibold"
                                onClick={() => {
                                  // Support both old and new schema
                                  const bookingType = booking.booking_type || (booking.property_id ? 'property' : booking.experience_id ? 'experience' : booking.trip_id || booking.retreat_id ? 'retreat' : 'property');
                                  const itemId = booking.item_id || booking.property_id || booking.experience_id || booking.trip_id || booking.retreat_id;
                                  
                                  if (bookingType === 'property' || booking.property_id) {
                                    router.push(`/property/${itemId}`);
                                  } else if (bookingType === 'experience' || booking.experience_id) {
                                    router.push(`/experiences/${itemId}`);
                                  } else if (bookingType === 'retreat' || booking.trip_id || booking.retreat_id) {
                                    router.push(`/retreats/${itemId}`);
                                  }
                                }}
                              >
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Details
                              </button>

                              <button
                                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-semibold"
                                onClick={() => router.push('/contact-us')}
                              >
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                Get Support
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 