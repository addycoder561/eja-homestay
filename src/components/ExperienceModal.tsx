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
  DocumentTextIcon,
  HeartIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isBucketlisted as checkIsBucketlisted, addToBucketlist, removeFromBucketlist, testWishlistTable } from '@/lib/database';
import Image from 'next/image';
import Script from 'next/script';

interface Experience {
  id: string;
  host_id: string | null;
  title: string;
  description: string | null;
  location: string;
  categories: string[];
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
  guest_email?: string;
}

interface ExperienceModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function ExperienceModal({ experience, isOpen, onClose }: ExperienceModalProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: ''
  });
  const [canReview, setCanReview] = useState(false);
  const [isBucketlistedState, setIsBucketlistedState] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'About' | 'Reviews'>('About');
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [mobileDrawerType, setMobileDrawerType] = useState<'about' | 'reviews' | 'checkin' | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    guests: 1,
    specialRequests: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const modalRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Build images list
  const images: string[] = experience ? buildCoverFirstImages(experience.cover_image, experience.images || []) : [];

  // Fetch reviews when experience changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!experience) return;
      
      try {
        const { data, error } = await supabase
          .from("experience_reviews")
          .select("*")
          .eq("experience_id", experience.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error('Error fetching reviews:', error);
          setReviews([]);
          return;
        }
        
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };
    
    fetchReviews();
  }, [experience]);

  // Check bucketlist status
  useEffect(() => {
    const checkBucketlistStatus = async () => {
      if (user && experience) {
        try {
          const bucketlisted = await checkIsBucketlisted(user.id, experience.id, 'experience');
          setIsBucketlistedState(bucketlisted);
        } catch (err) {
          console.error('Error checking bucketlist status:', err);
          setIsBucketlistedState(false);
        }
      } else {
        setIsBucketlistedState(false);
      }
    };
    
    checkBucketlistStatus();
  }, [user, experience]);

  // Check if user can review
  useEffect(() => {
    setCanReview(false); // Start with review form hidden
    setHasReviewed(reviews.some((r) => r.guest_email === user?.email));
  }, [user, reviews]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
      setShowBookingForm(false);
      setReviewText("");
      setReviewRating(5);
      setReviewForm({ name: '', email: '' });
      setCanReview(false);
      setBookingForm({ date: '', guests: 1, specialRequests: '' });
      setShowCalendar(false);
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendar && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!experience) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("experience_reviews")
        .insert({
          experience_id: experience.id,
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
      setReviews([data, ...reviews]);
      setHasReviewed(true);
      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBucketlistToggle = async () => {
    if (!user || !experience) {
      toast.error('Please sign in to add experiences to bucketlist');
      return;
    }

    console.log('🔖 Modal bucketlist toggle:', { 
      userId: user.id, 
      experienceId: experience.id, 
      currentState: isBucketlistedState 
    });

    try {
      if (isBucketlistedState) {
        console.log('🗑️ Removing from bucketlist...');
        const success = await removeFromBucketlist(user.id, experience.id, 'experience');
        console.log('🗑️ Remove result:', success);
        if (success) {
          setIsBucketlistedState(false);
          toast.success('Removed from saved');
        } else {
          toast.error('Failed to remove from saved');
        }
      } else {
        console.log('➕ Adding to bucketlist...');
        const success = await addToBucketlist(user.id, experience.id, 'experience');
        console.log('➕ Add result:', success);
        if (success) {
          setIsBucketlistedState(true);
          toast.success('Added to saved');
        } else {
          toast.error('Failed to add to saved');
        }
      }
    } catch (err) {
      console.error('❌ Modal bucketlist error:', err);
      toast.error('Failed to update saved items');
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
    
    if (!experience || !user) {
      toast.error('Please sign in to book this experience');
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = experience.price * bookingForm.guests;
      
      // Create Razorpay order
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
      
      if (!orderRes.ok) {
        throw new Error('Failed to create payment order');
      }
      
      const orderData = await orderRes.json();
      const { order } = orderData;
      if (!order) {
        throw new Error('Failed to initialize payment');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'EJA',
        description: `Booking for ${experience.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const { data, error } = await supabase
              .from('experience_bookings')
              .insert({
                experience_id: experience.id,
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
              toast.error('Payment successful but booking creation failed');
              return;
            }

            toast.success('Booking confirmed! Check your email for details.');
            setBookingForm({ date: '', guests: 1, specialRequests: '' });
            setShowBookingForm(false);
          } catch (error) {
            console.error('Error creating booking:', error);
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

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setBookingLoading(false);
      }
      
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const getCategoryIcon = (category: string | string[]) => {
    if (!category) return '🌟';
    const categoryStr = Array.isArray(category) ? category[0] : category;
    const categoryLower = categoryStr.toLowerCase();
    if (categoryLower.includes('immersive')) return '🧘';
    if (categoryLower.includes('playful')) return '🎮';
    if (categoryLower.includes('culinary')) return '🍽️';
    if (categoryLower.includes('meaningful')) return '❤️';
    return '🌟';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Calendar functions
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysArray = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day: number, month: Date) => {
    const today = new Date();
    return day === today.getDate() && 
           month.getMonth() === today.getMonth() && 
           month.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number, month: Date) => {
    if (!bookingForm.date) return false;
    const selectedDate = new Date(bookingForm.date);
    return day === selectedDate.getDate() && 
           month.getMonth() === selectedDate.getMonth() && 
           month.getFullYear() === selectedDate.getFullYear();
  };

  const isPastDate = (day: number, month: Date) => {
    const today = new Date();
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    // Set both dates to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Use local date formatting to avoid timezone issues
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    setBookingForm(prev => ({ ...prev, date: dateString }));
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    // Use local date formatting to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    setBookingForm(prev => ({ ...prev, date: dateString }));
    setShowCalendar(false);
  };

  const clearDate = () => {
    setBookingForm(prev => ({ ...prev, date: '' }));
    setShowCalendar(false);
  };

  if (!isOpen || !experience) return null;

  const averageRating = calculateAverageRating();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Mobile Full Screen Gallery */}
      <div className="md:hidden fixed inset-0 z-50 bg-black">
        {/* Close Button and Counter - Floating */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all backdrop-blur-sm"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Full Screen Image */}
        <div className="relative w-full h-full">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all backdrop-blur-sm"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all backdrop-blur-sm"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Floating Action Buttons - Over Image */}
              <div className="absolute bottom-24 right-4 flex flex-col space-y-3">
                {/* Details Button */}
                <button
                  onClick={() => setMobileDrawerType('about')}
                  className="bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all backdrop-blur-sm border border-gray-200"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                </button>

                {/* Reviews Button */}
                <button
                  onClick={() => setMobileDrawerType('reviews')}
                  className="bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all backdrop-blur-sm border border-gray-200"
                >
                  <HeartIcon className="w-5 h-5" />
                </button>

                {/* Check-in Button */}
                <button
                  onClick={() => setMobileDrawerType('checkin')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-xl transition-all border-2 border-yellow-400"
                >
                  <CalendarDaysIcon className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-4xl mb-2">📸</div>
                <div>No images available</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Desktop Modal */}
      <div className="hidden md:block fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal Container */}
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top/Left Side - Image Carousel */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black">
            {images.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  <Image
                    src={images[currentImageIndex]}
                    alt={experience.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    priority
                  />
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all backdrop-blur-sm"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all backdrop-blur-sm"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom/Right Side - Content */}
          <div ref={rightPanelRef} className="w-full md:w-1/2 flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{experience.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{experience.location}</span>
                    </div>
                    {experience.duration && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{experience.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Share experience"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                   {user && (
                     <button
                       onClick={handleBucketlistToggle}
                       className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
                         isBucketlistedState ? 'text-yellow-500' : 'text-gray-600'
                       }`}
                       aria-label={isBucketlistedState ? 'Remove from saved' : 'Add to saved'}
                     >
                       {isBucketlistedState ? (
                         <BookmarkSolid className="w-5 h-5" />
                       ) : (
                         <BookmarkIcon className="w-5 h-5" />
                       )}
                     </button>
                   )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {!showBookingForm ? (
                <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                  {/* Cylindrical Toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative bg-gray-200 rounded-full p-1 flex">
                      <button
                        onClick={() => setActiveTab('About')}
                        className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          activeTab === 'About'
                            ? 'text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        About
                      </button>
                      <button
                        onClick={() => setActiveTab('Reviews')}
                        className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          activeTab === 'Reviews'
                            ? 'text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Reviews
                      </button>
                      {/* Sliding background */}
                      <div
                        className={`absolute top-1 bottom-1 w-1/2 bg-blue-600 rounded-full transition-transform duration-200 ${
                          activeTab === 'About' ? 'translate-x-0' : 'translate-x-full'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'About' ? (
                    <>
                  {/* About this experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About this experience</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                        {experience.description || "Details coming soon."}
                      </p>
                    </div>
                  </div>
                    </>
                  ) : (
                    /* Reviews Tab Content */
                   <div>
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-semibold text-gray-900">Guest Reviews</h3>
                       {!hasReviewed && (
                         <button
                           onClick={() => setCanReview(!canReview)}
                           className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                         >
                           {canReview ? 'Cancel' : 'Add a review'}
                         </button>
                       )}
                     </div>

                     {/* Reviews Display */}
                     <div className="space-y-3">
                       {reviews.length === 0 ? (
                         <p className="text-gray-500 text-center py-4 text-sm">No reviews yet. Be the first to share your experience!</p>
                       ) : (
                         <div className="space-y-3 max-h-64 overflow-y-auto">
                           {reviews.slice(0, 3).map((review) => (
                             <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                               <div className="flex items-center justify-between mb-1">
                                 <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                     <span className="text-xs font-medium text-blue-600">
                                       {(review.guest_name || review.guest_email || 'Anonymous').charAt(0).toUpperCase()}
                                     </span>
                                   </div>
                                   <span className="font-medium text-gray-900 text-sm">
                                     {review.guest_name || review.guest_email?.split('@')[0] || 'Anonymous'}
                                   </span>
                                 </div>
                                 <StarRating rating={review.rating} readonly size="sm" />
                               </div>
                               {review.comment && (
                                 <p className="text-gray-700 text-xs">{review.comment}</p>
                               )}
                               <p className="text-gray-500 text-xs mt-1">
                                 {new Date(review.created_at).toLocaleDateString()}
                               </p>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Review Form - Only shown when canReview is true */}
                     {canReview && !hasReviewed && (
                       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-4 border border-blue-100">
                         <form onSubmit={handleReviewSubmit} className="space-y-3">
                           {!user && (
                             <div className="grid grid-cols-1 gap-3">
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
                             <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                             <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                             <textarea
                               value={reviewText}
                               onChange={(e) => setReviewText(e.target.value)}
                               rows={2}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                               placeholder="Share your experience..."
                               required
                             />
                           </div>
                           <div className="flex gap-2">
                             <Button
                               type="submit"
                               disabled={submitting || !reviewText.trim() || (!user && (!reviewForm.name || !reviewForm.email))}
                               className="flex-1 text-sm"
                             >
                               {submitting ? 'Submitting...' : 'Submit Review'}
                             </Button>
                             <Button
                               type="button"
                               variant="outline"
                               onClick={() => setCanReview(false)}
                               className="text-sm"
                             >
                               Cancel
                             </Button>
                           </div>
                         </form>
                       </div>
                     )}
                   </div>
                  )}
                </div>
              ) : (
                 /* Booking Form */
                 <div className="p-6">
                   <div className="flex items-center justify-between mb-6">
                     <div>
                       <h3 className="text-xl font-bold text-gray-900">Book this experience</h3>
                     </div>
                     <button
                       onClick={() => setShowBookingForm(false)}
                       className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                     >
                       <XMarkIcon className="w-5 h-5 text-gray-500" />
                     </button>
                   </div>

                   <form onSubmit={handleBookingSubmit} className="space-y-4">
                     {/* Date and Guest Selection - Side by Side */}
                     <div className="grid grid-cols-2 gap-4">
                       {/* Date Selection */}
                       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 h-32 flex flex-col">
                         <label className="block text-sm font-semibold text-gray-900 mb-2">
                           Select Date
                         </label>
                         <div className="relative flex-1">
                           <button
                             type="button"
                             onClick={() => setShowCalendar(!showCalendar)}
                             className="w-full h-full text-base py-3 px-3 pr-10 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer text-left flex items-center justify-between"
                           >
                             <span className={bookingForm.date ? 'text-gray-900' : 'text-gray-500'}>
                               {bookingForm.date 
                                 ? new Date(bookingForm.date).toLocaleDateString('en-US', { 
                                     weekday: 'short', 
                                     month: 'short', 
                                     day: 'numeric' 
                                   })
                                 : 'Choose date'
                               }
                             </span>
                             <ChevronDownIcon className={`w-4 h-4 text-blue-500 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                           </button>
                           
                          {/* Custom Calendar Dropdown */}
                          {showCalendar && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-50 p-3">
                              {/* Calendar Header */}
                              <div className="flex items-center justify-between mb-3">
                                <button
                                  type="button"
                                  onClick={() => navigateMonth('prev')}
                                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <ChevronLeftIcon className="w-4 h-4 text-blue-600" />
                                </button>
                                
                                <h3 className="text-base font-semibold text-gray-900">
                                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                
                                <button
                                  type="button"
                                  onClick={() => navigateMonth('next')}
                                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <ChevronRightIcon className="w-4 h-4 text-blue-600" />
                                </button>
                              </div>
                              
                              {/* Calendar Grid */}
                              <div className="grid grid-cols-7 gap-1 mb-3">
                                {/* Day headers */}
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                  </div>
                                ))}
                                
                                {/* Calendar days */}
                                {getDaysArray(currentMonth).map((day, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => day && handleDateSelect(day)}
                                    disabled={!day || isPastDate(day, currentMonth)}
                                    className={`
                                      h-7 w-7 text-xs rounded-lg transition-all duration-200 flex items-center justify-center
                                      ${!day 
                                        ? 'invisible' 
                                        : isPastDate(day, currentMonth)
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : isToday(day, currentMonth)
                                        ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200'
                                        : isSelected(day, currentMonth)
                                        ? 'bg-blue-600 text-white font-semibold'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                      }
                                    `}
                                  >
                                    {day}
                                  </button>
                                ))}
                              </div>
                              
                              {/* Calendar Footer */}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <button
                                  type="button"
                                  onClick={clearDate}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded"
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  onClick={goToToday}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded"
                                >
                                  Today
                                </button>
                              </div>
                            </div>
                          )}
                         </div>
                         <div className="mt-2 text-xs text-gray-600">
                           {bookingForm.date ? new Date(bookingForm.date).toLocaleDateString('en-US', { 
                             weekday: 'short', 
                             month: 'short', 
                             day: 'numeric' 
                           }) : 'Choose date'}
                         </div>
                       </div>
                       
                       {/* Guest Selection */}
                       <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 h-32 flex flex-col">
                         <label className="block text-sm font-semibold text-gray-900 mb-2">
                           Number of Guests
                         </label>
                         <div className="relative flex-1">
                           <select
                             value={bookingForm.guests}
                             onChange={e => setBookingForm(prev => ({ ...prev, guests: Number(e.target.value) }))}
                             required
                             className="w-full h-full text-base py-3 px-3 pr-10 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer appearance-none"
                             style={{ 
                               color: '#111827',
                               fontWeight: '500'
                             }}
                           >
                             {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                               <option key={num} value={num} style={{ color: '#111827', fontWeight: '500', padding: '8px' }}>
                                 {num} {num === 1 ? 'Guest' : 'Guests'}
                               </option>
                             ))}
                           </select>
                           <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                             <UsersIcon className="w-4 h-4 text-green-500" />
                           </div>
                         </div>
                         <div className="mt-2 text-xs text-gray-600">
                           Max 8 guests
                         </div>
                       </div>
                     </div>
                     
                     {/* Special Requests */}
                     <div className="bg-gray-50 rounded-xl p-4">
                       <label className="block text-sm font-semibold text-gray-900 mb-2">
                         Special Requests
                       </label>
                       <textarea
                         rows={2}
                         value={bookingForm.specialRequests}
                         onChange={e => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                         placeholder="Any dietary restrictions, accessibility needs, or special requirements..."
                       />
                     </div>

                     {/* Price Summary */}
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-gray-700 font-medium">Price per person</span>
                         <span className="text-lg font-semibold text-gray-900">₹{experience.price?.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-gray-700 font-medium">Number of guests</span>
                         <span className="text-lg font-semibold text-gray-900">{bookingForm.guests}</span>
                       </div>
                       <div className="border-t border-blue-200 pt-2">
                         <div className="flex justify-between items-center">
                           <span className="text-lg font-bold text-gray-900">Total Price</span>
                           <span className="text-xl font-bold text-blue-600">₹{(experience.price * bookingForm.guests).toLocaleString()}</span>
                         </div>
                       </div>
                     </div>

                     {/* Booking Button */}
                     <Button 
                       type="submit" 
                       variant="primary"
                       size="lg"
                       disabled={bookingLoading || !bookingForm.date || bookingForm.guests < 1}
                       className="w-full py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                     >
                       {bookingLoading ? (
                         <div className="flex items-center justify-center">
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                           Processing...
                         </div>
                       ) : (
                         <div className="flex items-center justify-center">
                           <CalendarIcon className="w-6 h-6 mr-2" />
                           Confirm Booking
                         </div>
                       )}
                     </Button>

                     {/* Trust Indicators */}
                     <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                       <div className="flex items-center">
                         <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                         Free cancellation
                       </div>
                       <div className="flex items-center">
                         <ShieldCheckIcon className="w-4 h-4 mr-1 text-green-500" />
                         Secure booking
                       </div>
                       <div className="flex items-center">
                         <ClockIcon className="w-4 h-4 mr-1 text-green-500" />
                         Instant confirmation
                       </div>
                     </div>
                   </form>
                 </div>
              )}
            </div>

            {/* Sticky Footer - Check-in Button */}
            {!showBookingForm && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">₹{experience.price?.toLocaleString()}</div>
                    <div className="text-gray-600 text-sm">per person</div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setShowMobileBooking(true);
                      } else {
                        setShowBookingForm(true);
                      }
                    }}
                    variant="primary"
                    size="lg"
                    className="px-8"
                  >
                    Check-in
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Booking Drawer */}
      {showMobileBooking && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowMobileBooking(false)}
          />
          
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[60vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Book Experience</h3>
                <button
                  onClick={() => setShowMobileBooking(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content - Compact Layout */}
            <div className="p-4 space-y-4 flex-1">
                {/* Date and Guest Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  
                  {/* Guest Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                      <button
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, guests: Math.max(1, bookingForm.guests - 1)})}
                        className="w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="font-medium text-gray-900 text-sm">{bookingForm.guests}</span>
                      <button
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, guests: bookingForm.guests + 1})}
                        className="w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="Any special requirements?"
                  />
                </div>
            </div>
            
            {/* Footer - Fixed at Bottom */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="space-y-3">
                {/* Price Summary */}
                <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                  <span className="text-gray-700 font-medium text-sm">Total for {bookingForm.guests} guest{bookingForm.guests !== 1 ? 's' : ''}</span>
                  <span className="text-lg font-bold text-blue-600">₹{((experience?.price || 0) * bookingForm.guests).toLocaleString()}</span>
                </div>
                
                {/* Confirm Booking Button */}
                <Button
                  onClick={handleBookingSubmit}
                  disabled={!bookingForm.date || bookingLoading}
                  className="w-full py-3 text-base font-semibold"
                  variant="primary"
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawers */}
      {mobileDrawerType && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileDrawerType(null)}
          />
          
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {mobileDrawerType === 'about' && 'About'}
                  {mobileDrawerType === 'reviews' && 'Reviews'}
                  {mobileDrawerType === 'checkin' && 'Check-in'}
                </h3>
                <button
                  onClick={() => setMobileDrawerType(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {mobileDrawerType === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{experience.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Professional guide</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>All necessary equipment</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Safety briefing</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Important Information</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <span>Bring comfortable walking shoes</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                        <span>Weather-dependent activity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {mobileDrawerType === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarSolid key={i} className="w-5 h-5 text-yellow-400" />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600">({averageRating.toFixed(1)})</span>
                      </div>
                      <p className="text-gray-600 text-sm">{reviews.length} reviews</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-600">
                                {review.guest_name?.charAt(0) || 'A'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{review.guest_name}</div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarSolid 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  {user && !hasReviewed && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="text-2xl"
                              >
                                {star <= reviewRating ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Share your experience..."
                          />
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full">
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {mobileDrawerType === 'checkin' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">₹{experience.price?.toLocaleString()}</div>
                    <div className="text-gray-700 font-semibold">per person</div>
                  </div>

                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Select Date</label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Guests</label>
                        <div className="flex items-center justify-center space-x-3 px-3 py-2 border-2 border-gray-400 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setBookingForm(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
                          >
                            <span className="text-lg font-bold text-gray-700">-</span>
                          </button>
                          <span className="text-lg font-semibold text-gray-900">{bookingForm.guests}</span>
                          <button
                            type="button"
                            onClick={() => setBookingForm(prev => ({ ...prev, guests: prev.guests + 1 }))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
                          >
                            <span className="text-lg font-bold text-gray-700">+</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Special Requests (Optional)</label>
                      <textarea
                        value={bookingForm.specialRequests}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
                        placeholder="Any special requirements or requests..."
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-400">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900 font-semibold">Total</span>
                        <span className="text-xl font-bold text-gray-900">₹{(experience.price * bookingForm.guests).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-700 font-medium">Includes all taxes and fees</div>
                    </div>

                    <Button 
                      onClick={() => {
                        setMobileDrawerType(null);
                        setShowMobileBooking(true);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Confirm Booking
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
