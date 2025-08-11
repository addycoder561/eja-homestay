"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef, Suspense } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { createExperienceBooking, getExperiences } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, MapPinIcon, ClockIcon, UsersIcon, MagnifyingGlassIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Experience } from '@/lib/types';
import Link from 'next/link';
import { ImageCarousel } from '@/components/ImageCarousel';
import { buildCoverFirstImages } from '@/lib/media';
import Image from 'next/image';

// Enhanced filter data for experiences
const filterData = {
  category: [
    { id: 'immersive', label: 'Immersive', icon: '🧘', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'playful', label: 'Playful', icon: '🎮', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'culinary', label: 'Culinary', icon: '🍽️', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'meaningful', label: 'Meaningful', icon: '❤️', color: 'bg-red-100 text-red-700 border-red-200' }
  ],
  location: [
    { id: 'mountains', label: 'Mountains', icon: '🏔️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'delhi-ncr', label: 'Delhi-NCR', icon: '🏙️', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ]
};

// Loading skeleton for experience cards
function ExperienceCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-48 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyExperiencesState({ searchQuery, selectedCategory, selectedLocation }: { 
  searchQuery: string; 
  selectedCategory: string; 
  selectedLocation: string; 
}) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-6">🔍</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">No experiences found</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {searchQuery || selectedCategory || selectedLocation 
          ? "Try adjusting your filters or check back later for new experiences."
          : "We're working on adding amazing experiences. Check back soon!"
        }
      </p>
      {(searchQuery || selectedCategory || selectedLocation) && (
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function ExperiencesPageInner() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToggle, setSelectedToggle] = useState<'mountains' | 'delhi-ncr'>('mountains');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch experiences from database
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const data = await getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        toast.error('Failed to load experiences');
      } finally {
        setLoadingExperiences(false);
      }
    };

    fetchExperiences();
  }, []);

  // Enhanced filtering logic
  const filtered = experiences.filter((exp) => {
    try {
    // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          exp.title.toLowerCase().includes(searchLower) ||
          (exp.description?.toLowerCase().includes(searchLower) || false) ||
          exp.location.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Filter by location toggle
      if (selectedToggle === 'mountains') {
        const mountainLocations = ['mountain', 'rishikesh', 'manali', 'shimla', 'mussoorie', 'nainital', 'dehradun', 'uttarakhand', 'himachal'];
        const isMountainLocation = mountainLocations.some(loc => 
          exp.location.toLowerCase().includes(loc)
        );
        if (!isMountainLocation) return false;
      } else if (selectedToggle === 'delhi-ncr') {
        const delhiLocations = ['delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'faridabad', 'ghaziabad'];
        const isDelhiLocation = delhiLocations.some(loc => 
          exp.location.toLowerCase().includes(loc)
        );
        if (!isDelhiLocation) return false;
      }
      
      // Filter by category - Simplified approach
      if (selectedCategory && exp.categories) {
        const categoryId = filterData.category.find(cat => cat.label === selectedCategory)?.id;
        if (categoryId) {
          // Convert categories to string and check if it contains the category
          const categoriesStr = String(exp.categories).toLowerCase();
          const categoryIdLower = categoryId.toLowerCase();
          
          // Check if the category ID is contained in the categories string
          if (!categoriesStr.includes(categoryIdLower)) {
      return false;
    }
    }
    }
    
    // Only show active experiences
    if (!exp.is_active) {
      return false;
    }
    
    return true;
    } catch (error) {
      console.error('Error filtering experience:', exp.id, error);
      return false; // Skip experiences that cause errors
    }
  });

  const openBooking = (exp: Experience) => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/experiences?book=${exp.id}`);
      return;
    }
    setSelectedExp(exp);
    setBookingOpen(true);
  };

  // Open modal automatically if ?book=<id> is present and user is authenticated
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (bookId && user && profile && !bookingOpen) {
      const exp = experiences.find(e => e.id === bookId);
      if (exp) {
        setSelectedExp(exp);
        setBookingOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [searchParams, user, profile]);

  useEffect(() => {
    let ignore = false;
    async function fetchWishlist() {
      if (user) {
        const wishlist = await Promise.all(filtered.map(exp => isWishlisted(user.id, exp.id, 'experience')));
        if (!ignore) {
          setWishlistedIds(filtered.map((exp, i) => wishlist[i] ? exp.id : '').filter(Boolean));
        }
      } else {
        setWishlistedIds([]);
      }
    }
    fetchWishlist();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleWishlist = async (expId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add experiences to wishlist');
      return;
    }
    
    try {
      if (wishlisted) {
        const success = await removeFromWishlist(user.id, expId, 'experience');
        if (success) {
          setWishlistedIds(ids => ids.filter(id => id !== expId));
          toast.success('Experience removed from wishlist');
          // Refresh wishlist count in navigation
          if ((window as any).refreshWishlistCount) {
            (window as any).refreshWishlistCount();
          }
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, expId, 'experience');
        if (success) {
          setWishlistedIds(ids => [...ids, expId]);
          toast.success('Experience added to wishlist');
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
    setSelectedExp(null);
    setForm({ name: "", email: "", date: "", guests: 1, phone: "" });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp || !user || !profile) return;

    setLoading(true);
    try {
      const booking = await createExperienceBooking({
        experienceId: selectedExp.id,
        guestId: user.id,
        email: profile.email,
        name: profile.full_name || "",
        date: form.date,
        guests: form.guests,
        totalPrice: selectedExp.price * form.guests,
      });

      if (booking) {
        // Initialize Razorpay via server-created order
        const orderRes = await fetch('/api/payments/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: selectedExp.price * form.guests * 100, currency: 'INR', notes: { type: 'experience', experienceId: selectedExp.id } }),
        });
        const { order, error } = await orderRes.json();
        if (!order) throw new Error(error || 'Failed to initialize payment');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'EJA Homestay',
          description: `Booking for ${selectedExp.title}`,
          order_id: order.id,
          handler: async function (response: any) {
            try {
              // Send email receipt
              await sendPaymentReceiptEmail({
                to: profile.email,
                guestName: profile.full_name || '',
                bookingType: 'experience',
                title: selectedExp.title,
                checkIn: form.date,
                checkOut: form.date,
                guests: form.guests,
                totalPrice: selectedExp.price * form.guests,
                paymentRef: response.razorpay_payment_id,
              });

              toast.success('Booking confirmed! Check your email for details.');
              closeBooking();
              router.push('/guest/dashboard');
            } catch (error) {
              console.error('Error sending email:', error);
              toast.success('Booking confirmed!');
              closeBooking();
              router.push('/guest/dashboard');
            }
          },
          prefill: {
            name: profile.full_name || '',
            email: profile.email,
            contact: profile.phone || '',
          },
          theme: {
            color: '#3B82F6',
          },
        } as any;

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const getImageUrl = (exp: Experience) => {
    const images = buildCoverFirstImages(exp.cover_image, exp.images);
    const imageUrl = images[0] || '/placeholder-experience.jpg';
    return imageErrors.has(imageUrl) ? '/placeholder-experience.jpg' : imageUrl;
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">Local Experiences</h1>
            <p className="text-xl text-blue-100 mb-8 animate-fade-in-delay-1">
              Discover unique experiences curated by locals
            </p>
            
            {/* Enhanced Search Box */}
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in-delay-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search experiences by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 text-gray-900 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Filter Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl animate-fade-in-delay-3">
            {/* Location Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-xl p-1 flex">
                {filterData.location.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedToggle(location.id as 'mountains' | 'delhi-ncr')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedToggle === location.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{location.icon}</span>
                    {location.label}
              </button>
                ))}
              </div>
            </div>

                {/* Category Filters */}
            <div className="flex justify-center">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {filterData.category.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.label ? "" : category.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                      selectedCategory === category.label
                        ? `${category.color} shadow-lg scale-105`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-gray-600 font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Results Counter */}
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-lg">
            <span className="font-semibold text-gray-900">{filtered.length}</span> experience{filtered.length !== 1 ? 's' : ''} found
            {hasActiveFilters && (
              <span className="text-blue-600 font-medium">
                {' '}for {[selectedCategory, searchQuery].filter(Boolean).join(' + ')}
              </span>
            )}
            <span className="text-blue-600 font-medium">
              {' '}in {selectedToggle === 'mountains' ? 'Mountains' : 'Delhi-NCR'}
            </span>
          </p>
        </div>

        {loadingExperiences ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <ExperienceCardSkeleton key={index} index={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyExperiencesState 
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedLocation={selectedLocation}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((exp, index) => {
              const isBook = wishlistedIds.includes(exp.id);
              return (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Enhanced Image Section */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={getImageUrl(exp)}
                      alt={exp.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(buildCoverFirstImages(exp.cover_image, exp.images)[0] || '')}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Wishlist Button */}
                    {user && (
                      <button
                        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-gray-900 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200"
                        onClick={(e) => handleWishlist(exp.id, isBook, e)}
                        aria-label={isBook ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isBook ? (
                          <HeartSolid className="w-5 h-5 text-pink-500" />
                        ) : (
                          <HeartOutline className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                      ₹{exp.price.toLocaleString()}
                    </div>
                    
                    {/* Category Badge */}
                    {exp.categories && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-lg">
                        {exp.categories}
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                      {exp.title}
                    </h3>
                    
                    {/* Location & Duration */}
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-sm">{exp.location}</span>
                      </div>
                      {exp.duration && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm">{exp.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[4.5rem]">
                      {exp.description}
                    </p>
                    
                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">₹{exp.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openBooking(exp);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
            </div>
        )}
      </main>
      
      <Modal open={bookingOpen} onClose={closeBooking}>
        <div className="space-y-6">
          {/* Experience Summary */}
          {selectedExp && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getImageUrl(selectedExp)}
                    alt={selectedExp.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedExp.title}</h3>
                  <p className="text-gray-600 text-xs truncate">{selectedExp.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">₹{selectedExp.price?.toLocaleString()}</span>
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
                    max={selectedExp?.max_guests || 10}
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
              {selectedExp && form.date && form.guests > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per person:</span>
                      <span>₹{selectedExp.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of guests:</span>
                      <span>{form.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience date:</span>
                      <span>{new Date(form.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-blue-600">₹{(selectedExp.price * form.guests).toLocaleString()}</span>
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
      <Footer />
    </div>
  );
} 

export default function ExperiencesPage() {
  return (
    <Suspense>
      <ExperiencesPageInner />
    </Suspense>
  );
}