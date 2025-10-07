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
  ShareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isBucketlisted as checkIsBucketlisted, addToBucketlist, removeFromBucketlist } from '@/lib/database';
import Image from 'next/image';
import Link from 'next/link';
import { Retreat } from '@/lib/types';

interface Review {
  id: string;
  retreat_id: string;
  guest_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  guest_name?: string;
  guest_email?: string;
}

// Loading skeleton component
function RetreatDetailSkeleton() {
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
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          {star <= rating ? (
            <StarSolid className={`${sizeClasses[size]} text-yellow-400`} />
          ) : (
            <StarIcon className={`${sizeClasses[size]} text-gray-300`} />
          )}
        </button>
      ))}
    </div>
  );
}

export default function RetreatDetailPage() {
  const params = useParams();
  const retreatId = params.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isWishlistedState, setIsWishlistedState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showRetreatDetails, setShowRetreatDetails] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    guests: 1,
    specialRequests: ''
  });

  const fetchRetreat = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .eq('id', retreatId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setError('Retreat not found');
        } else {
          setError('Failed to load retreat');
        }
        console.error('Error fetching retreat:', error);
        return;
      }
      
      setRetreat(data);
    } catch (err) {
      console.error('Error fetching retreat:', err);
      setError('Failed to load retreat');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('retreat_reviews')
        .select('*')
        .eq('retreat_id', retreatId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }
      
      setReviews(data || []);
      setHasReviewed(data?.some((r) => r.guest_email === user?.email) || false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !retreat) return;
    try {
      const wishlisted = await checkIsBucketlisted(user.id, retreat.id, 'trip');
      setIsWishlistedState(wishlisted);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retreat || !reviewText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('retreat_reviews')
        .insert({
          retreat_id: retreat.id,
          guest_id: user?.id || null,
          guest_name: user?.email?.split('@')[0] || 'Anonymous',
          guest_email: user?.email || '',
          rating: reviewRating,
          comment: reviewText.trim()
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast.error('Failed to submit review');
        return;
      }

      toast.success('Review submitted successfully!');
      setReviewText('');
      setReviewRating(5);
      setCanReview(false);
      await fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !retreat) {
      toast.error('Please sign in to add retreats to wishlist');
      return;
    }

    try {
      if (isWishlistedState) {
        const success = await removeFromBucketlist(user.id, retreat.id, 'trip');
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
        const success = await addToBucketlist(user.id, retreat.id, 'trip');
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
        title: retreat?.title || 'Amazing Retreat',
        text: `Check out this amazing retreat: ${retreat?.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };



  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Retreat booking submit called');
    console.log('🔍 Retreat:', retreat);
    console.log('🔍 User:', user);
    console.log('🔍 Profile:', profile);
    
    if (!user || !profile || !retreat) {
      toast.error('Please sign in to book this retreat');
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = retreat.price * bookingForm.guests;
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
          notes: { type: 'retreat', retreatId: retreat.id } 
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
        description: `Booking for ${retreat.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          console.log('🔍 Payment successful, creating booking...');
          try {
            // Create booking after successful payment
            const { data, error } = await supabase
              .from('retreat_bookings')
              .insert({
                retreat_id: retreat.id,
                guest_id: user.id,
                guest_name: profile?.full_name || user.email?.split('@')[0] || 'Guest',
                guest_email: user.email || '',
                guest_phone: profile?.phone || '',
                date: bookingForm.date,
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
            toast.success('Retreat booked and payment successful!');
            
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
      toast.error('Failed to submit booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Couple': '💑',
      'Solo': '🧘',
      'Pet-Friendly': '🐕',
      'Family': '👨‍👩‍👧‍👦',
      'Purposeful': '🎯',
      'Senior Citizen': '👴',
      'Group': '👥',
      'Parents': '👨‍👩‍👦'
    };
    return icons[category] || '🏕️';
  };

  useEffect(() => {
    if (retreatId) {
      fetchRetreat();
      fetchReviews();
    }
  }, [retreatId]);

  useEffect(() => {
    if (retreat) {
      checkWishlistStatus();
    }
  }, [retreat, user]);

  if (loading) {
    return <RetreatDetailSkeleton />;
  }

  if (error || !retreat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error === 'Retreat not found' ? 'Retreat Not Found' : 'Something went wrong'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error === 'Retreat not found' 
                ? 'The retreat you\'re looking for doesn\'t exist or has been removed.'
                : 'We encountered an error while loading the retreat.'
              }
            </p>
            <Link href="/retreats">
              <Button variant="primary">Browse Other Retreats</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = buildCoverFirstImages(retreat.cover_image, retreat.gallery);
  const averageRating = calculateAverageRating();

  try {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        
        {/* Title and Actions Above Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{retreat.title}</h1>
            </div>
            <div className="flex gap-2 ml-4">
            <button
              onClick={handleShare}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
              aria-label="Share retreat"
            >
              <ShareIcon className="w-5 h-5 text-gray-700" />
            </button>
            {user && (
              <button
                onClick={handleWishlistToggle}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
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
            propertyTitle={retreat.title} 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section A: Compact Property Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* First line: subtitle, location */}
                    <div className="flex items-center gap-4 text-gray-600">
                      {retreat.subtitle && (
                        <span className="text-lg font-medium">{retreat.subtitle}</span>
                      )}
                  <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                    <span>{retreat.location}</span>
                  </div>
                    </div>
                    
                    {/* Second line: category */}
                    <div className="flex items-center gap-4 text-gray-600">
                  {retreat.categories && (
                    <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryIcon(Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories)}</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories}
                      </span>
                    </div>
                  )}
                </div>

                    {/* Third line: rating */}
                {reviews.length > 0 && (
                      <div className="flex items-center gap-3">
                        <StarRating rating={averageRating} readonly size="md" />
                        <span className="font-semibold text-gray-900">{averageRating}</span>
                    <span className="text-gray-600">({reviews.length} reviews)</span>
                  </div>
              )}
            </div>
                </CardContent>
              </Card>

              {/* Collapsible Retreat Details Section */}
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                        Retreat Details
                      </h2>
                      <button
                        onClick={() => setShowRetreatDetails(!showRetreatDetails)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {showRetreatDetails ? (
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
                  
                  {showRetreatDetails && (
                    <div className="p-6 space-y-8">
                      {/* Section A: Subtitle, Location, Duration, Category, Rating */}
                      <div>
                        {/* Subtitle */}
                        {retreat.subtitle && (
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">{retreat.subtitle}</h3>
                        )}
                        
                        {/* Location, Category */}
                        <div className="flex items-center space-x-6 mb-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{retreat.location}</span>
                          </div>
                          {retreat.categories && (
                            <div className="flex items-center space-x-1">
                              <span className="text-2xl">{getCategoryIcon(Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories)}</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        {reviews.length > 0 && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-yellow-500">
                              <StarIcon className="w-4 h-4 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {averageRating}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                ({reviews.length} reviews)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section B: About, What's Included, Important Info, Host, USP */}
                      
                      {/* About this retreat */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this retreat</h3>
                  <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {retreat.description || 'Details coming soon.'}
                    </p>
                  </div>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>



              {/* Reviews Section */}
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
                            placeholder="Share your experience with this retreat..."
                            required
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={submitting || !reviewText.trim()}
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
                    {reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {(review.guest_name || review.guest_email || 'Anonymous').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {review.guest_name || review.guest_email?.split('@')[0] || 'Anonymous'}
                                </span>
                              </div>
                              <StarRating rating={review.rating} readonly size="sm" />
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm">{review.comment}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
              </CardContent>
            </Card>
          </div>

            {/* Right: Booking Widget */}
            <div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ₹{retreat.price?.toLocaleString()}
                    </div>
                    <div className="text-gray-600">for 2 adults</div>
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
                        max={20}
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
                        value={bookingForm.specialRequests}
                        onChange={e => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any special requirements or requests..."
                />
              </div>

              {/* Price Calculation */}
              {retreat && bookingForm.date && bookingForm.guests > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price for 2 adults:</span>
                      <span>₹{retreat.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of guests:</span>
                      <span>{bookingForm.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retreat date:</span>
                      <span>{new Date(bookingForm.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-blue-600">₹{(retreat.price * bookingForm.guests).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

                    {/* Check-in Button */}
                <Button 
                  type="submit" 
                      variant="primary" 
                  size="lg"
                      loading={bookingLoading} 
                      disabled={bookingLoading || !bookingForm.date || bookingForm.guests < 1}
                      className="w-full"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                      Check-in
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
  } catch (err) {
    console.error('Render error:', err);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">We encountered an error while displaying the retreat.</p>
            <Link href="/retreats">
              <Button variant="primary">Browse Other Retreats</Button>
            </Link>
          </div>
        </div>
      <Footer />
    </div>
  );
  }
}
