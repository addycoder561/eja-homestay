"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isWishlisted as checkIsWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import Image from 'next/image';
import Link from 'next/link';

interface Retreat {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  duration?: string;
  images: string[];
  cover_image?: string;
  image?: string | null;
  categories?: string | string[];
  created_at?: string;
  updated_at?: string;
}

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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    guests: 1,
    name: '',
    email: '',
    phone: ''
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
      const wishlisted = await checkIsWishlisted(user.id, retreat.id, 'trip');
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
        const success = await removeFromWishlist(user.id, retreat.id, 'trip');
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
        const success = await addToWishlist(user.id, retreat.id, 'trip');
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

  const openBooking = () => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/retreats/${retreatId}`);
      return;
    }
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setBookingForm({
      date: '',
      guests: 1,
      name: '',
      email: '',
      phone: ''
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !retreat) return;

    setBookingLoading(true);
    try {
      // Here you would integrate with your booking system
      // For now, we'll just show a success message
      toast.success('Booking request submitted! We\'ll contact you soon.');
      closeBooking();
    } catch (err) {
      console.error('Booking error:', err);
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

  const images = buildCoverFirstImages(retreat.image || retreat.cover_image, retreat.images);
  const averageRating = calculateAverageRating();

  try {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
        
        {/* Hero Section with PropertyImageGallery */}
        <div className="relative">
          <PropertyImageGallery 
            images={images.length ? images : ["/placeholder-experience.jpg"]} 
            propertyTitle={retreat.title} 
          />
          
          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleShare}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
              aria-label="Share retreat"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Section */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{retreat.title}</h1>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{retreat.location}</span>
                  </div>
              {retreat.duration && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      <span>{retreat.duration}</span>
                    </div>
                  )}
                  {retreat.categories && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories)}</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <StarRating rating={averageRating} readonly size="lg" />
                    <span className="text-lg font-semibold text-gray-900">{averageRating}</span>
                    <span className="text-gray-600">({reviews.length} reviews)</span>
                  </div>
              )}
            </div>

              {/* About Section */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About this retreat</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {retreat.description || 'Details coming soon.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included Section */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Accommodation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">All meals included</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Guided activities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Wellness sessions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Transportation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">24/7 support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Information Section */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Cancellation Policy</h3>
                        <p className="text-gray-600 text-sm">Free cancellation up to 7 days before the retreat start date.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">What to Bring</h3>
                        <p className="text-gray-600 text-sm">Comfortable clothing, personal items, and any specific requirements will be communicated before arrival.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Health & Safety</h3>
                        <p className="text-gray-600 text-sm">All retreats follow strict health and safety protocols. Please inform us of any special requirements.</p>
                      </div>
                    </div>
                  </div>
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

            {/* Right: Booking Summary & Widgets */}
            <div className="space-y-6">
              {/* Booking Summary */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ₹{retreat.price?.toLocaleString()}
                    </div>
                    <div className="text-gray-600">per person</div>
                  </div>
                <Button 
                  variant="primary" 
                    size="lg"
                    onClick={openBooking}
                    className="w-full mb-4"
                >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
                  <div className="text-center text-sm text-gray-500">
                    Free cancellation • Secure booking
                  </div>
                </CardContent>
              </Card>

              {/* Contact Host */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Host</h3>
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/918976662177"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </div>
                      <span className="font-medium text-green-700">Message Host</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Retreat Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Retreat Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{retreat.duration || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">
                        {Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{retreat.location}</span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

        {/* Enhanced Booking Modal */}
        <Modal open={bookingOpen} onClose={closeBooking}>
          <div className="space-y-6">
            {/* Retreat Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={images[0] || "/placeholder-experience.jpg"}
                    alt={retreat.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{retreat.title}</h3>
                  <p className="text-gray-600 text-xs truncate">{retreat.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">₹{retreat.price?.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs">per person</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Date and Guests Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    Number of Guests
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={bookingForm.guests}
                    onChange={e => setBookingForm(prev => ({ ...prev, guests: Number(e.target.value) }))}
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
                  value={bookingForm.name}
                  onChange={e => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={bookingForm.email}
                  onChange={e => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  required
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={bookingForm.phone}
                  onChange={e => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Price Calculation */}
              {retreat && bookingForm.date && bookingForm.guests > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per person:</span>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  loading={bookingLoading} 
                  disabled={bookingLoading || !bookingForm.date || !bookingForm.name || !bookingForm.email || !bookingForm.phone || bookingForm.guests < 1}
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
          </div>
        </Modal>
        
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
