"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { getRetreats, createTripBooking } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ImageCarousel } from '@/components/ImageCarousel';
import { buildCoverFirstImages } from '@/lib/media';
import Image from 'next/image';

type Retreat = {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  duration?: string;
  images: string[];
  cover_image?: string;
  image?: string | null;
  categories?: string | string[];
  created_at?: string;
  updated_at?: string;
};

// Loading skeleton component
function RetreatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyRetreatsState({ searchQuery, selectedCategory }: { searchQuery: string; selectedCategory: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <FunnelIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {searchQuery ? 'No retreats match your search' : 'No retreats available'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchQuery 
          ? 'Try adjusting your search terms or clearing filters to find more retreats.'
          : 'We\'re working on adding amazing retreats. Check back soon!'
        }
      </p>
      {(searchQuery || selectedCategory) && (
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="px-6"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

function RetreatsPageInner() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Retreat | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 1,
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<any>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [trips, setTrips] = useState<Retreat[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced category filter options with icons
  const categoryOptions = [
    { id: 'Couple', label: 'Couple', icon: '💑' },
    { id: 'Solo', label: 'Solo', icon: '🧘' },
    { id: 'Pet-Friendly', label: 'Pet-Friendly', icon: '🐕' },
    { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'Purposeful', label: 'Purposeful', icon: '🎯' },
    { id: 'Senior Citizen', label: 'Senior Citizen', icon: '👴' },
    { id: 'Group', label: 'Group', icon: '👥' },
    { id: 'Parents', label: 'Parents', icon: '👨‍👩‍👦' }
  ];

  // Fetch retreats from database
  useEffect(() => {
    const fetchRetreats = async () => {
      try {
        setLoadingTrips(true);
        const data = await getRetreats();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching retreats:', error);
        toast.error('Failed to load retreats');
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchRetreats();
  }, []);

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      // Search by title, description, location
      if (
        searchQuery &&
        !trip.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !((trip.description || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        !trip.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory && trip.categories) {
        const hasCategory = Array.isArray(trip.categories)
          ? trip.categories.includes(selectedCategory)
          : trip.categories === selectedCategory;
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [trips, searchQuery, selectedCategory]);

  const openBooking = (trip: Retreat) => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/retreats?book=${trip.id}`);
      return;
    }
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  // Open modal automatically if ?book=<id> is present and user is authenticated
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (!bookId || bookingOpen) return;
    const trip = trips.find(t => t.id === bookId);
    if (!trip) return;
    setSelectedTrip(trip);
    if (user && profile) {
      setBookingOpen(true);
    } else {
      router.push(`/auth/signin?redirect=/retreats?book=${bookId}`);
    }
    // eslint-disable-next-line
  }, [searchParams, user, profile, trips, bookingOpen]);

  useEffect(() => {
    let ignore = false;
    async function fetchWishlist() {
      if (user) {
        const wishlist = await Promise.all(filtered.map(trip => isWishlisted(user.id, trip.id, 'trip')));
        if (!ignore) {
          setWishlistedIds(filtered.map((trip, i) => wishlist[i] ? trip.id : '').filter(Boolean));
        }
      } else {
        setWishlistedIds([]);
      }
    }
    fetchWishlist();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleWishlist = async (tripId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add retreats to wishlist');
      return;
    }
    
    try {
      if (wishlisted) {
        const success = await removeFromWishlist(user.id, tripId, 'trip');
        if (success) {
          setWishlistedIds(ids => ids.filter(id => id !== tripId));
          toast.success('Retreat removed from wishlist');
          // Refresh wishlist count in navigation
          if ((window as any).refreshWishlistCount) {
            (window as any).refreshWishlistCount();
          }
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, tripId, 'trip');
        if (success) {
          setWishlistedIds(ids => [...ids, tripId]);
          toast.success('Retreat added to wishlist');
          // Refresh wishlist count in navigation
          if ((window as any).refreshWishlistCount) {
            (window as any).refreshWishlistCount();
          }
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedTrip(null);
    setForm({ name: "", email: "", date: "", guests: 1, phone: "" });
    // If URL has ?book=..., remove it so the auto-open effect doesn't re-trigger
    if (searchParams.get('book')) {
      router.replace('/retreats');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please sign in to book a retreat.');
      return;
    }
    setLoading(true);
    setPaymentInProgress(true);
    try {
      if (!selectedTrip) throw new Error("No retreat selected");
      const totalPrice = selectedTrip.price * form.guests;
      // Create order on server
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'INR', notes: { type: 'retreat', tripId: selectedTrip.id } }),
      });
      const { order, error } = await orderRes.json();
      if (!order) throw new Error(error || 'Failed to initialize payment');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: selectedTrip.title,
        description: 'Retreat Payment',
        order_id: order.id,
        handler: async function (response: any) {
          const booking = await createTripBooking({
            tripId: selectedTrip.id,
            email: form.email,
            name: form.name,
            date: form.date,
            guests: form.guests,
            totalPrice,
            guestId: profile.id,
          });
          setPaymentInProgress(false);
          setLoading(false);
          await sendPaymentReceiptEmail({
            to: profile.email,
            guestName: profile.full_name || profile.email,
            bookingType: 'Retreat',
            title: selectedTrip.title,
            checkIn: form.date,
            checkOut: form.date,
            guests: form.guests,
            totalPrice,
            paymentRef: response.razorpay_payment_id
          });
          toast.success('Retreat booked and payment successful!');
          closeBooking();
          router.push('/guest/dashboard');
        },
        prefill: {
          email: profile.email,
          name: profile.full_name,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setPaymentInProgress(false);
            setLoading(false);
            toast.error('Payment was cancelled. Please try again.');
          }
        }
      };
      ;(window as any).Razorpay && (paymentRef.current = new (window as any).Razorpay(options));
      paymentRef.current.open();
    } catch (err: any) {
      setPaymentInProgress(false);
      setLoading(false);
      toast.error(err.message || "Booking/payment failed");
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {paymentInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl font-semibold text-blue-700">Processing payment…</div>
            <p className="text-gray-600 mt-2">Please don't close this window</p>
          </div>
        </div>
      )}
      <Navigation />
      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-24 mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-right-bottom opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
                Discover Retreats
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Escape to curated retreats designed for every type of traveler. Find your perfect getaway and create unforgettable memories.
              </p>
              
              {/* Enhanced Search Box */}
              <div className="max-w-2xl mx-auto mb-10">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search retreats by title, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-8 py-6 pl-16 text-gray-900 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg transition-all duration-300 group-hover:shadow-3xl"
                  />
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="w-7 h-7 text-gray-400" />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  )}
              </div>
            </div>

              {/* Enhanced Category Filters */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-end mb-4">
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                      Clear all
                  </button>
                )}
                </div>
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Results Counter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              <span className="font-semibold text-gray-900">{filtered.length}</span> retreat{filtered.length !== 1 ? 's' : ''} found
              {hasActiveFilters && (
                <span className="text-blue-600 font-medium">
                  {' '}for {[selectedCategory, searchQuery].filter(Boolean).join(' + ')}
                </span>
            )}
          </p>
          </div>
        </div>

        {/* Enhanced Retreats Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <RetreatCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyRetreatsState searchQuery={searchQuery} selectedCategory={selectedCategory} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((trip) => {
                const isWishlisted = wishlistedIds.includes(trip.id);
              return (
                  <Link href={`/retreats/${trip.id}`} className="block group" key={trip.id}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100">
                      {/* Enhanced Image Section */}
                      <div className="relative h-56 overflow-hidden">
                        <ImageCarousel 
                          images={buildCoverFirstImages(trip.image || trip.cover_image, trip.images)} 
                          alt={trip.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Wishlist Button */}
                    {user && (
                      <button
                            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlist(trip.id, isWishlisted, e); }}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            {isWishlisted ? (
                              <HeartSolid className="w-5 h-5 text-pink-500" />
                            ) : (
                              <HeartOutline className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                        
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                          ₹{trip.price?.toLocaleString()}
                        </div>
                        
                        {/* Category Badge */}
                        {trip.categories && (
                          <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg">
                            {Array.isArray(trip.categories) ? trip.categories[0] : trip.categories}
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Content Section */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {trip.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4 text-blue-500" />
                              <span>{trip.location}</span>
                            </div>
                            {trip.duration && (
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4 text-green-500" />
                                <span>{trip.duration}</span>
                              </div>
                            )}
                    </div>
                  </div>
                        
                        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
                          {trip.description}
                        </p>
                        
                        {/* Enhanced Action Section */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">₹{trip.price?.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">per person</span>
                    </div>
                          <Button 
                            variant="primary" 
                            size="md" 
                            className="shadow-lg px-6 py-2 text-base font-semibold rounded-xl" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openBooking(trip); }}
                          >
                        Book Now
                      </Button>
                        </div>
                      </div>
                    </div>
                </Link>
              );
            })}
            </div>
          )}
        </div>

        {/* Enhanced Booking Modal */}
        <Modal open={bookingOpen} onClose={closeBooking}>
          <div className="space-y-6">
            {/* Retreat Summary */}
            {selectedTrip && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={buildCoverFirstImages(selectedTrip.image || selectedTrip.cover_image, selectedTrip.images)[0] || "/placeholder-experience.jpg"}
                      alt={selectedTrip.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedTrip.title}</h3>
                    <p className="text-gray-600 text-xs truncate">{selectedTrip.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-blue-600">₹{selectedTrip.price?.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs">per person</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {loadingAuth ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-700 mb-4">Loading profile...</p>
            </div>
          ) : (
              <form onSubmit={handleBook} className="space-y-5">
                {/* Date and Guests Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Preferred Date
                    </label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UsersIcon className="w-4 h-4 inline mr-1" />
                      Number of Guests
                    </label>
              <Input
                type="number"
                min={1}
                value={form.guests}
                onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h4>
                  
                  <Input
                    label="Full Name"
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                required
              />
                </div>

                {/* Price Calculation */}
                {selectedTrip && form.date && form.guests > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per person:</span>
                        <span>₹{selectedTrip.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of guests:</span>
                        <span>{form.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retreat date:</span>
                        <span>{new Date(form.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-blue-600">₹{(selectedTrip.price * form.guests).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    loading={loading || paymentInProgress} 
                    disabled={loading || paymentInProgress || !form.date || !form.name || !form.email || !form.phone || form.guests < 1}
                    className="flex-1"
                    size="lg"
                  >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                Confirm Booking
              </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={closeBooking}
                    className="px-6"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
            </form>
          )}
          </div>
        </Modal>
      </main>
      <Footer />
    </div>
  );
} 

export default function RetreatsPage() {
  return (
    <Suspense>
      <RetreatsPageInner />
    </Suspense>
  );
}