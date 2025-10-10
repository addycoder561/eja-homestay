"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { buildCoverFirstImages } from "@/lib/media";
import { 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon, 
  BookmarkIcon, 
  CalendarIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  HomeIcon,
  WifiIcon,
  TruckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isBucketlisted as checkIsBucketlisted, addToBucketlist, removeFromBucketlist } from '@/lib/database';
import Image from 'next/image';
import Script from 'next/script';

interface Property {
  id: string;
  host_id: string | null;
  title: string;
  description: string | null;
  location: string;
  city: string;
  state: string;
  property_type: string;
  accommodation_type: string | null;
  beds: number | null;
  amenities: string[];
  tags: string[];
  base_price: number;
  currency: string;
  min_nights: number;
  max_nights: number | null;
  google_average_rating: number | null;
  google_reviews_count: number | null;
  cover_image: string | null;
  gallery: any | null; // JSONB
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Host-related fields
  host_name?: string;
  host_type?: string;
  host_tenure?: string;
  host_description?: string;
  host_image?: string;
  host_usps?: string[];
  // Computed fields
  average_rating?: number;
  review_count?: number;
}

interface Review {
  id: string;
  property_id: string;
  guest_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isWishlistedState, setIsWishlistedState] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Get images for the property
  const images = property ? buildCoverFirstImages(property.cover_image, property.gallery) : [];

  useEffect(() => {
    if (isOpen && property) {
      fetchReviews();
      checkWishlistStatus();
      fetchRooms();
    }
  }, [isOpen, property, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchReviews = async () => {
    if (!property) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', property.id)
        .eq('review_type', 'property')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !property) return;

    try {
      const isWishlisted = await checkIsBucketlisted(user.id, property.id, 'property');
      setIsWishlistedState(isWishlisted);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const fetchRooms = async () => {
    if (!property) return;

    setLoadingRooms(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', property.id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !property) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    console.log('🔖 PropertyModal wishlist toggle:', { 
      userId: user.id, 
      propertyId: property.id, 
      currentState: isWishlistedState 
    });

    try {
      if (isWishlistedState) {
        console.log('🗑️ Removing from wishlist...');
        const success = await removeFromBucketlist(user.id, property.id, 'property');
        console.log('🗑️ Remove result:', success);
        if (success) {
          setIsWishlistedState(false);
          toast.success('Removed from saved');
        } else {
          toast.error('Failed to remove from saved');
        }
      } else {
        console.log('➕ Adding to wishlist...');
        const success = await addToBucketlist(user.id, property.id, 'property');
        console.log('➕ Add result:', success);
        if (success) {
          setIsWishlistedState(true);
          toast.success('Added to saved');
        } else {
          toast.error('Failed to add to saved');
        }
      }
    } catch (error) {
      console.error('❌ PropertyModal wishlist error:', error);
      toast.error('Failed to update saved items');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property || !reviewText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          item_id: property.id,
          review_type: 'property',
          guest_id: user.id,
          rating: reviewRating,
          comment: reviewText.trim()
        });

      if (error) throw error;

      setReviewText('');
      setReviewRating(5);
      setHasReviewed(true);
      toast.success('Review submitted successfully!');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const shareProperty = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isOpen || !property) return null;

  const averageRating = property.google_average_rating || property.average_rating || 0;
  const reviewCount = property.google_reviews_count || property.review_count || reviews.length;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Backdrop with enhanced animations */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
        onClick={onClose}
      >
        {/* Modal Container with smooth animations */}
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top/Left Side - Image Carousel */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black">
            <Image
              src={images[currentImageIndex] || '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                >
                  <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
            >
              {isWishlistedState ? (
                <BookmarkSolid className="w-6 h-6 text-red-500" />
              ) : (
                <BookmarkIcon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Bottom/Right Side - Content */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{property.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{property.location}, {property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HomeIcon className="w-4 h-4" />
                      <span className="text-sm capitalize">{property.property_type}</span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <StarSolid className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-sm">{averageRating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">({reviewCount} reviews)</span>
                    </div>
                    <button
                      onClick={shareProperty}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-900">₹{property.base_price?.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">per night</div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this property</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700 text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms */}
              {rooms.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
                    {rooms.length > 3 && (
                      <button
                        onClick={() => setShowAllRooms(!showAllRooms)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        {showAllRooms ? 'Show Less' : `Show All (${rooms.length})`}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAllRooms ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {(showAllRooms ? rooms : rooms.slice(0, 3)).map((room) => (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{room.name}</h4>
                            <p className="text-xs text-gray-600">{room.room_type}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">₹{room.price?.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">per night</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            {room.max_guests} guests
                          </span>
                          {room.amenities && room.amenities.length > 0 && (
                            <span className="text-gray-500">
                              {room.amenities.slice(0, 2).join(', ')}
                              {room.amenities.length > 2 && ` +${room.amenities.length - 2} more`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarSolid
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>

            {/* Footer - CTA */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-sm">
                  This property is available for booking through our retreat packages.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                  onClick={() => {
                    onClose();
                    window.location.href = '/search?type=retreats';
                  }}
                >
                  View Retreat Packages
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
