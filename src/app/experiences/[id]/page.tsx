"use client";

// TypeScript declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Script from "next/script";

import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { buildCoverFirstImages } from "@/lib/media";
import { 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon, 
  HeartIcon, 
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isBucketlisted as checkIsBucketlisted, addToBucketlist, removeFromBucketlist } from '@/lib/database';
import Image from 'next/image';
import Link from 'next/link';

interface Experience {
  id: string;
  host_id: string | null;
  title: string;
  description: string | null;
  location: string;
  // categories: string[]; // Removed - now using mood field
  mood: string | null;
  price: number;
  duration_hours: number | null;
  cover_image: string | null;
  gallery: any | null; // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Host-related fields
  host_name?: string;
  host_type?: string;
  host_tenure?: string;
  host_description?: string;
  host_image?: string;
  host_usps?: string[];
  // Unique propositions
  unique_propositions?: string[];
}

interface Review {
  id: string;
  experience_id: string;
  guest_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  guest_name?: string;
  guest_email?: string; // Added guest_email
}

// Loading skeleton component
function ExperienceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Image skeleton */}
          <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Title skeleton */}
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              
              {/* Content skeleton */}
              <div className="bg-white rounded-2xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
            
            {/* Booking skeleton */}
            <div className="bg-white rounded-2xl p-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Star Rating Component
function StarRating({ rating, onRatingChange, readonly = false, size = "md" }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          {star <= rating ? (
            <StarSolid className={sizeClasses[size]} />
          ) : (
            <StarIcon className={sizeClasses[size]} />
          )}
        </button>
      ))}
    </div>
  );
}

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const experienceId = params.id as string;

  const [experience, setExperience] = useState<Experience | null>(null);
  const [tales, setTales] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: ''
  });
  const [canReview, setCanReview] = useState(false);
  const [isWishlistedState, setIsWishlistedState] = useState(false);
  const [showExperienceDetails, setShowExperienceDetails] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    guests: 1,
    specialRequests: ''
  });

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        console.log('🔍 Fetching experience with ID:', experienceId);
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experienceId)
        .single();
        
        console.log('📊 Experience data:', data);
        console.log('❌ Experience error:', error);
        
        if (error) {
          console.error('Error fetching experience:', error);
          if (error.code === 'PGRST116') {
            setError('Experience not found');
          } else {
            setError('Failed to load experience details');
          }
          return;
        }
        
        if (!data) {
          console.log('❌ No data returned');
          setError('Experience not found');
          return;
        }
        
        console.log('✅ Experience loaded successfully:', data);
      setExperience(data);
      } catch (err) {
        console.error('💥 Error fetching experience:', err);
        setError('Failed to load experience details');
      } finally {
        setLoading(false);
      }
    };
    
    if (experienceId) fetchExperience();
  }, [experienceId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
        .from("tales")
        .select("*")
        .eq("experience_id", experienceId)
        .order("created_at", { ascending: false });
        
        if (error) {
          console.error('Error fetching reviews:', error);
          setTales([]);
          return;
        }
        
        setTales(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setTales([]);
      }
    };
    
    if (experienceId) fetchReviews();
  }, [experienceId]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && experience) {
        try {
          const wishlisted = await checkIsBucketlisted(user.id, experience.id, 'experience');
          setIsWishlistedState(wishlisted);
        } catch (err) {
          console.error('Error checking wishlist status:', err);
          setIsWishlistedState(false); // Default to false on error
        }
      } else {
        setIsWishlistedState(false);
      }
    };
    
    checkWishlistStatus();
  }, [user, experience]);

  useEffect(() => {
    setCanReview(true); // Allow anyone to review
    setHasReviewed(tales.some((r) => r.guest_email === user?.email));
  }, [user, tales]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
    const { data, error } = await supabase
      .from("tales")
      .insert({
        experience_id: experienceId,
          guest_id: user?.id || null,
          guest_name: reviewForm.name || user?.email?.split('@')[0] || 'Anonymous',
          guest_email: reviewForm.email || user?.email || '',
        rating: reviewRating,
        comment: reviewText,
      })
      .select()
      .single();
      
      if (error) throw error;
      
      setReviewText("");
      setReviewRating(5);
      setReviewForm({ name: '', email: '' });
      setTales([data, ...tales]);
      setHasReviewed(true);
      toast.success("Tale submitted successfully!");
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !experience) {
      toast.error('Please sign in to add experiences to wishlist');
      return;
    }

    try {
      if (isWishlistedState) {
        const success = await removeFromBucketlist(user.id, experience.id, 'experience');
        if (success) {
          setIsWishlistedState(false);
          toast.success('Removed from wishlist');
          // Refresh wishlist count in navigation
          if ((window as any).refreshWishlistCount) {
            (window as any).refreshWishlistCount();
          }
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToBucketlist(user.id, experience.id, 'experience');
        if (success) {
          setIsWishlistedState(true);
          toast.success('Added to wishlist');
          // Refresh wishlist count in navigation
          if ((window as any).refreshWishlistCount) {
            (window as any).refreshWishlistCount();
          }
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: experience?.title,
        text: experience?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };



  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Experience booking submit called');
    console.log('🔍 Experience:', experience);
    console.log('🔍 User:', user);
    console.log('🔍 Profile:', profile);
    
    if (!experience || !user) {
      toast.error('Please sign in to book this experience');
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = experience.price * bookingForm.guests;
      console.log('🔍 Total price:', totalPrice);
      
      // Create Razorpay order
      console.log('🔍 Creating payment order...');
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          amount: totalPrice * 100, 
          currency: 'INR', 
          notes: { type: 'experience', experienceId: experience.id } 
        }),
      });
      
      console.log('🔍 Payment order response status:', orderRes.status);
      
      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error('🔍 Payment order failed:', errorText);
        throw new Error('Failed to create payment order');
      }
      
      const orderData = await orderRes.json();
      console.log('🔍 Payment order response:', orderData);
      
      const { order } = orderData;
      if (!order) {
        console.error('🔍 No order in response');
        throw new Error('Failed to initialize payment');
      }

      console.log('🔍 Setting up Razorpay options...');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'EJA',
        description: `Booking for ${experience.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          console.log('🔍 Payment successful, creating booking...');
          try {
            // Create booking after successful payment
            const { data, error } = await supabase
              .from('bookings')
              .insert({
                property_id: experience.id, // Using property_id for experience/retreat ID
                guest_id: user.id,
                guest_name: profile?.full_name || user.email?.split('@')[0] || 'Guest',
                guest_email: user.email || '',
                guest_phone: profile?.phone || '',
                check_in: bookingForm.date,
                booking_type: 'experience', // Add type to distinguish experience bookings
                guests: bookingForm.guests,
                special_requests: bookingForm.specialRequests,
                total_price: totalPrice,
                status: 'confirmed',
                payment_id: response.razorpay_payment_id
              })
              .select()
              .single();

            if (error) {
              console.error('🔍 Booking creation error:', error);
              toast.error('Payment successful but booking creation failed');
              return;
            }

            console.log('🔍 Booking created successfully:', data);
            toast.success('Booking confirmed! Check your email for details.');
            
            // Reset form
            setBookingForm({
              date: '',
              guests: 1,
              specialRequests: ''
            });
            
            // Redirect to dashboard
            router.push('/guest/dashboard');
          } catch (error) {
            console.error('🔍 Error creating booking:', error);
            toast.error('Payment successful but booking creation failed');
          }
        },
        prefill: {
          name: profile?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: profile?.phone || '',
        },
        theme: {
          color: '#3B82F6',
        },
      } as any;

      console.log('🔍 Razorpay options:', options);

      // Check if Razorpay is loaded
      console.log('🔍 Checking if Razorpay is loaded...');
      console.log('🔍 window.Razorpay:', typeof window !== 'undefined' ? (window as any).Razorpay : 'undefined');
      
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        console.log('🔍 Opening Razorpay modal...');
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        console.error('🔍 Razorpay not loaded');
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setBookingLoading(false);
      }
      
    } catch (err) {
      console.error('🔍 Booking error:', err);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateAverageRating = () => {
    try {
      if (!tales || tales.length === 0) return 0;
      const total = tales.reduce((sum, tale) => sum + (tale.rating || 0), 0);
      return Math.round((total / tales.length) * 10) / 10;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  };

  const getCategoryIcon = (category: string | string[]) => {
    try {
      if (!category) return '🌟';
      const categoryStr = Array.isArray(category) ? category[0] : category;
      const categoryLower = categoryStr.toLowerCase();
      if (categoryLower.includes('immersive')) return '🧘';
      if (categoryLower.includes('playful')) return '🎮';
      if (categoryLower.includes('culinary')) return '🍽️';
      if (categoryLower.includes('meaningful')) return '❤️';
      return '🌟';
    } catch (error) {
      console.error('Error getting category icon:', error);
      return '🌟';
    }
  };

  if (loading) return <ExperienceDetailSkeleton />;

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Experience not found</h1>
            <p className="text-gray-600 mb-8">{error || 'This experience may have been removed or is no longer available.'}</p>
            <Link href="/experiences">
              <Button variant="primary">Browse Other Experiences</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Build images list from cover_image + images[]
  const images: string[] = buildCoverFirstImages(experience.cover_image, experience.images || []);
  const averageRating = calculateAverageRating();

  // Defensive programming - ensure we have required data
  if (!experience.title || !experience.id) {
    console.error('❌ Missing required experience data:', experience);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Experience Data</h1>
            <p className="text-gray-600 mb-8">The experience data is incomplete or corrupted.</p>
            <Link href="/experiences">
              <Button variant="primary">Browse Other Experiences</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  try {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        
        {/* Title and Action Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{experience.title}</h1>
            </div>
            <div className="flex gap-2 ml-4">
            <button
              onClick={handleShare}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
              aria-label="Share experience"
            >
              <ShareIcon className="w-5 h-5 text-gray-700" />
            </button>
            {user && (
              <button
                onClick={handleWishlistToggle}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                aria-label={isWishlistedState ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlistedState ? (
                  <HeartSolid className="w-5 h-5 text-pink-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Hero Section with PropertyImageGallery */}
        <div className="relative">
          <PropertyImageGallery 
            images={images.length ? images : ["/placeholder-experience.jpg"]} 
            propertyTitle={experience.title} 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Experience Details - Collapsible Section */}
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                        Experience Details
                      </h2>
                      <button
                        onClick={() => setShowExperienceDetails(!showExperienceDetails)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {showExperienceDetails ? (
                          <>
                            <ChevronUpIcon className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-4 h-4" />
                            Show Details
                          </>
                        )}
                      </button>
                  </div>
                </div>

                  {showExperienceDetails && (
                    <div className="p-6 space-y-8">
                      {/* Section A: Subtitle, Location, Duration, Category, Rating */}
                      <div>
                        {/* Subtitle */}
                        {experience.subtitle && (
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">{experience.subtitle}</h3>
                        )}
                        
                        {/* Location, Duration, Category */}
                        <div className="flex items-center space-x-6 mb-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{experience.location}</span>
                  </div>
              {experience.duration && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{experience.duration}</span>
                    </div>
                  )}
                  {experience.mood && (
                            <div className="flex items-center space-x-1">
                      <span className="text-2xl">{getCategoryIcon(experience.mood)}</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {experience.mood}
                      </span>
                    </div>
                  )}
            </div>

                {/* Rating */}
                {tales.length > 0 && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-yellow-500">
                              <StarIcon className="w-4 h-4 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {averageRating}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                ({tales.length} tales)
                              </span>
                      </div>
                  </div>
                )}
              </div>

                      {/* Section B: About, What's Included, Important Info, Host, USP */}
                      
                      {/* About this experience */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this experience</h3>
                  <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {experience.description || "Details coming soon."}
                    </p>
                  </div>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>



              {/* Reviews Section - Moved to Left Column */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
                    {!hasReviewed && (
                      <button
                        onClick={() => setCanReview(!canReview)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {canReview ? 'Cancel' : 'Add a review'}
                      </button>
                    )}
                  </div>

                  {/* Review Form */}
                  {canReview && !hasReviewed && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        {/* Name and Email fields for non-authenticated users */}
                        {!user && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Your Name"
                              type="text"
                              value={reviewForm.name}
                              onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter your name"
                              required
                            />
                            <Input
                              label="Your Email"
                              type="email"
                              value={reviewForm.email}
                              onChange={e => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Share your experience with this activity..."
                            required
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={submitting || !reviewText.trim() || (!user && (!reviewForm.name || !reviewForm.email))}
                            className="flex-1"
                          >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCanReview(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Reviews Display */}
                  <div className="space-y-4">
                    {tales.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No tales yet. Be the first to share your experience!</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {tales.slice(0, 5).map((tale) => (
                          <div key={tale.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {(tale.guest_name || tale.guest_email || 'Anonymous').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {tale.guest_name || tale.guest_email?.split('@')[0] || 'Anonymous'}
                                </span>
                              </div>
                              <StarRating rating={tale.rating} readonly size="sm" />
                            </div>
                            {tale.comment && (
                              <p className="text-gray-700 text-sm">{tale.comment}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(tale.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </CardContent>
            </Card>
          </div>

            {/* Right: Optimized Booking Widget */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 bg-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">₹{experience.price?.toLocaleString()}</div>
                    <div className="text-gray-600">per person</div>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Preferred Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    value={bookingForm.date}
                    onChange={e => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
                
                    {/* Number of Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    Number of Guests
                  </label>
                    <Input
                      type="number"
                      min={1}
                        max={10}
                      value={bookingForm.guests}
                      onChange={e => setBookingForm(prev => ({ ...prev, guests: Number(e.target.value) }))}
                      required
                        className="w-full"
                      />
              </div>
              
                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        rows={3}
                        value={bookingForm.specialRequests}
                        onChange={e => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any special requirements or requests..."
                />
              </div>

                    {/* Total Price */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700">Total Price</span>
                        <span className="text-xl font-bold text-gray-900">₹{(experience.price * bookingForm.guests).toLocaleString()}</span>
                    </div>
                    </div>

                    {/* Check-in Button */}
                <Button 
                  type="submit" 
                      variant="primary"
                  size="lg"
                      disabled={bookingLoading || !bookingForm.date || bookingForm.guests < 1}
                      className="w-full"
                >
                      {bookingLoading ? (
                        'Processing...'
                      ) : (
                        <>
                  <CalendarIcon className="w-5 h-5 mr-2" />
                          Check-in
                        </>
                      )}
                </Button>

                    <div className="text-center text-sm text-gray-500">
                      Free cancellation • Secure booking
              </div>
            </form>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>


        
      <Footer />
    </div>
  );
  } catch (error) {
    console.error('💥 Error rendering experience detail page:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">We encountered an unexpected error while loading this experience.</p>
            <div className="space-y-4">
              <Link href="/experiences">
                <Button variant="primary">Browse Other Experiences</Button>
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="block mx-auto mt-4 text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
} 