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
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { isWishlisted as checkIsWishlisted, addToWishlist, removeFromWishlist, testWishlistTable } from '@/lib/database';
import Image from 'next/image';
import Script from 'next/script';

interface Retreat {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  categories: string[];
  cover_image: string | null;
  gallery: any | null; // JSONB
  unique_propositions?: string[];
  host_name?: string;
  host_avatar?: string;
  host_bio?: string;
  host_image?: string;
  host_type?: string;
  host_tenure?: string;
  host_description?: string;
  host_usps?: string[];
  created_at: string;
  updated_at: string;
}

interface Review {
  id: string;
  retreat_id: string;
  guest_id: string;
  rating: number;
  comment: string;
  guest_name: string;
  guest_email: string;
  created_at: string;
}

interface RetreatModalProps {
  retreat: Retreat | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RetreatModal({ retreat, isOpen, onClose }: RetreatModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isWishlistedState, setIsWishlistedState] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: ''
  });
  const [canReview, setCanReview] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    guests: 2,
    specialRequests: '',
    destination: '',
    duration: 1,
    budget: 'family comfort' as 'tight budget' | 'family comfort' | 'premium',
    selectedRooms: [] as string[],
    selectedExperiences: [] as string[],
    selectedTransport: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [imageLoading, setImageLoading] = useState(true);
  const [destinations, setDestinations] = useState<{state: string, cities: string[]}[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomImageIndex, setRoomImageIndex] = useState(0);
  const [roomImageIndices, setRoomImageIndices] = useState<{[key: string]: number}>({});
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Build images list
  const images = retreat ? buildCoverFirstImages(retreat.cover_image, retreat.gallery) : [];

  // Fetch destinations, rooms, and experiences
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!retreat || !showBookingForm) return;
      
      console.log('🔍 Fetching booking data for retreat:', retreat.id, 'budget:', bookingForm.budget);
      setLoadingData(true);
      try {
        // Fetch destinations from properties table
        const { data: locationsData, error: locationsError } = await supabase
          .from('properties')
          .select('city, state')
          .not('city', 'is', null)
          .not('state', 'is', null);
        
        if (locationsError) {
          console.error('Error fetching locations:', locationsError);
        } else {
          // Group cities by state
          const groupedData: {[key: string]: string[]} = {};
          locationsData?.forEach(location => {
            if (location.state && location.city) {
              if (!groupedData[location.state]) {
                groupedData[location.state] = [];
              }
              if (!groupedData[location.state].includes(location.city)) {
                groupedData[location.state].push(location.city);
              }
            }
          });
          
          // Convert to array and sort
          const destinationsArray = Object.keys(groupedData)
            .sort()
            .map(state => ({
              state,
              cities: groupedData[state].sort()
            }));
          
          setDestinations(destinationsArray);
          console.log('🔍 Destinations loaded:', destinationsArray.length, 'states');
        }

        // Fetch properties based on budget
        const budgetRanges = {
          'tight budget': { min: 1500, max: 2500 },
          'family comfort': { min: 2501, max: 5000 },
          'premium': { min: 5001, max: 7500 }
        };
        
        const range = budgetRanges[bookingForm.budget];
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            base_price,
            cover_image,
            gallery,
            amenities,
            address,
            city,
            state,
            is_available
          `)
          .eq('is_available', true)
          .gte('base_price', range.min)
          .lte('base_price', range.max);
        
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
        } else {
          // Convert properties to room-like format
          if (propertiesData && propertiesData.length > 0) {
            const roomFormatProperties = propertiesData.map(property => ({
              id: property.id,
              name: property.title,
              room_type: 'Property',
              price_per_night: property.base_price,
              amenities: property.amenities || [],
              property_id: property.id,
              properties: {
                id: property.id,
                title: property.title,
                cover_image: property.cover_image,
                gallery: property.gallery || []
              }
            }));
            setRooms(roomFormatProperties);
            console.log('🔍 Properties loaded:', roomFormatProperties.length, 'properties');
          } else {
            // Fallback: fetch all available properties
            const { data: fallbackProperties } = await supabase
              .from('properties')
              .select(`
                id,
                title,
                base_price,
                cover_image,
                gallery,
                amenities,
                address,
                city,
                state,
                is_available
              `)
              .eq('is_available', true)
              .limit(10);
            
            if (fallbackProperties && fallbackProperties.length > 0) {
              const roomFormatProperties = fallbackProperties.map(property => ({
                id: property.id,
                name: property.title,
                room_type: 'Property',
                price_per_night: property.base_price,
                amenities: property.amenities || [],
                property_id: property.id,
                properties: {
                  id: property.id,
                  title: property.title,
                  cover_image: property.cover_image,
                  gallery: property.gallery || []
                }
              }));
              setRooms(roomFormatProperties);
            } else {
              setRooms([]);
            }
          }
        }

        // Fetch experiences from retreat_experiences table
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('retreat_experiences')
          .select('*')
          .eq('experience_type', bookingForm.budget)
          .eq('is_active', true);
        
        if (experiencesError) {
          console.error('Error fetching experiences:', experiencesError);
        }
        
        if (experiencesData && experiencesData.length > 0) {
          setExperiences(experiencesData);
          console.log('🔍 Experiences loaded:', experiencesData.length, 'experiences');
        } else {
          // Fallback: try to get all experiences for this retreat
          const { data: allExperiences } = await supabase
            .from('retreat_experiences')
            .select('*')
            .eq('retreat_id', retreat.id);
          
          if (allExperiences && allExperiences.length > 0) {
            setExperiences(allExperiences);
          } else {
            // Sample experiences as final fallback
            const sampleExperiences = [
              {
                id: 'sample-exp-1',
                title: 'Morning Yoga Session',
                description: 'Start your day with a peaceful yoga session in nature',
                experience_type: bookingForm.budget,
                cover_image: null
              },
              {
                id: 'sample-exp-2',
                title: 'Guided Nature Walk',
                description: 'Explore the beautiful surroundings with an expert guide',
                experience_type: bookingForm.budget,
                cover_image: null
              },
              {
                id: 'sample-exp-3',
                title: 'Meditation Workshop',
                description: 'Learn mindfulness techniques in a serene environment',
                experience_type: bookingForm.budget,
                cover_image: null
              }
            ];
            setExperiences(sampleExperiences);
            console.log('🔍 Using sample experiences:', sampleExperiences.length, 'experiences');
          }
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error('Failed to load booking options');
      } finally {
        setLoadingData(false);
      }
    };

    if (showBookingForm) {
      fetchBookingData();
    }
  }, [retreat, showBookingForm, bookingForm.budget]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!retreat) return;
      
      try {
        const { data, error } = await supabase
          .from("retreat_reviews")
          .select("*")
          .eq("retreat_id", retreat.id)
          .order("created_at", { ascending: false });
        
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

    if (isOpen && retreat) {
      fetchReviews();
    }
  }, [isOpen, retreat, user]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && retreat) {
        try {
          const wishlisted = await checkIsWishlisted(user.id, retreat.id, 'retreat');
          setIsWishlistedState(wishlisted);
        } catch (err) {
          console.error('Error checking wishlist status:', err);
        }
      }
    };

    if (isOpen && user && retreat) {
      checkWishlistStatus();
    }
  }, [isOpen, user, retreat]);

  // Set canReview to false by default
  useEffect(() => {
    setCanReview(false);
    setHasReviewed(reviews.some((r) => r.guest_email === user?.email));
  }, [user, reviews]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    if (isOpen) {
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
      setBookingForm({ 
        date: '', 
        guests: 2, 
        specialRequests: '', 
        destination: '', 
        duration: 1, 
        budget: 'family comfort', 
        selectedRooms: [], 
        selectedExperiences: [], 
        selectedTransport: '' 
      });
      setShowCalendar(false);
      setImageLoading(true);
    }
  }, [isOpen]);

  // Reset image loading when retreat changes
  useEffect(() => {
    if (retreat) {
      setImageLoading(true);
    }
  }, [retreat]);

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
    
    if (!retreat) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("retreat_reviews")
        .insert({
          retreat_id: retreat.id,
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

  const handleWishlistToggle = async () => {
    if (!user || !retreat) {
      toast.error('Please sign in to add retreats to wishlist');
      return;
    }

    console.log('🔖 Modal wishlist toggle:', { 
      userId: user.id, 
      retreatId: retreat.id, 
      currentState: isWishlistedState 
    });

    // Test if wishlist table exists first
    const tableExists = await testWishlistTable();
    if (!tableExists) {
      toast.error('Wishlist table not accessible. Please check database setup.');
      return;
    }

    try {
      if (isWishlistedState) {
        const success = await removeFromWishlist(user.id, retreat.id, 'retreat');
        if (success) {
          setIsWishlistedState(false);
          toast.success('Removed from saved');
        } else {
          toast.error('Failed to remove from saved');
        }
      } else {
        const success = await addToWishlist(user.id, retreat.id, 'retreat');
        if (success) {
          setIsWishlistedState(true);
          toast.success('Added to saved');
        } else {
          toast.error('Failed to add to saved');
        }
      }
    } catch (err) {
      console.error('❌ Modal wishlist error:', err);
      toast.error('Failed to update saved items');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!retreat || !user) {
      toast.error('Please sign in to book this retreat');
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = retreat.price * bookingForm.guests;
      
      // Create Razorpay order
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          amount: totalPrice * 100, 
          currency: 'INR', 
          notes: { type: 'retreat', retreatId: retreat.id }
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Eja Homestay',
        description: `Retreat: ${retreat.title}`,
        order_id: orderData.id,
        handler: async function(response: any) {
          try {
            // Create booking record
            const bookingRes = await fetch('/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                retreat_id: retreat.id,
                check_in: bookingForm.date,
                guests: bookingForm.guests,
                total_price: totalPrice,
                special_requests: bookingForm.specialRequests,
                payment_id: response.razorpay_payment_id,
                payment_status: 'completed'
              })
            });

            if (bookingRes.ok) {
              toast.success('Retreat booked successfully!');
              setShowBookingForm(false);
              setBookingForm({ 
                date: '', 
                guests: 2, 
                specialRequests: '', 
                destination: '', 
                duration: 1, 
                budget: 'family comfort', 
                selectedRooms: [], 
                selectedExperiences: [], 
                selectedTransport: '' 
              });
            } else {
              throw new Error('Failed to create booking');
            }
          } catch (error) {
            console.error('Booking creation error:', error);
            toast.error('Payment successful but booking failed. Please contact support.');
          }
        },
        prefill: {
          name: user.email?.split('@')[0] || '',
          email: user.email || '',
        },
        theme: {
          color: '#F59E0B'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Calculate pricing based on budget and selections
  const calculatePricing = () => {
    if (!retreat) return { basePrice: 0, totalPrice: 0, breakdown: {} };

    const basePrice = retreat.price; // Family comfort base price (for 2 adults)
    const durationMultiplier = bookingForm.duration;
    
    // Budget adjustments
    const budgetMultipliers = {
      'tight budget': 0.7, // 30% discount
      'family comfort': 1.0, // Base price
      'premium': 1.3 // 30% premium
    };
    
    const budgetMultiplier = budgetMultipliers[bookingForm.budget];
    const adjustedBasePrice = basePrice * budgetMultiplier;
    
    // Hotel industry pricing: base price covers up to 2 guests, pro-rata for additional guests
    const guestCount = bookingForm.guests;
    const additionalGuests = Math.max(0, guestCount - 2); // Additional guests beyond 2
    
    // Base price covers up to 2 guests (no multiplication)
    const basePriceForStay = adjustedBasePrice;
    // Additional guests pay 50% of base price each
    const additionalPrice = additionalGuests > 0 ? (adjustedBasePrice * 0.5 * additionalGuests) : 0;
    
    // Total price for the stay (before duration multiplier)
    const stayPrice = basePriceForStay + additionalPrice;
    // Apply duration multiplier
    const totalPrice = stayPrice * durationMultiplier;
    
    return {
      basePrice: adjustedBasePrice,
      totalPrice,
      breakdown: {
        basePrice: basePrice,
        budgetAdjustment: budgetMultiplier,
        duration: durationMultiplier,
        guests: guestCount,
        baseGuests: 2,
        additionalGuests: additionalGuests,
        additionalPricePerGuest: adjustedBasePrice * 0.5,
        stayPrice: stayPrice
      }
    };
  };

  const getCategoryIcon = (category: string | string[]) => {
    const cat = Array.isArray(category) ? category[0] : category;
    const icons: { [key: string]: string } = {
      'Family': '👨‍👩‍👧‍👦',
      'Group': '👥',
      'Couple': '💑',
      'Try': '🎯',
      'Wellness': '🧘‍♀️',
      'Adventure': '🏔️',
      'Cultural': '🏛️',
      'Spiritual': '🕉️'
    };
    return icons[cat] || '🌟';
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

  if (!isOpen || !retreat) return null;

  const averageRating = calculateAverageRating();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Image Carousel */}
          <div className="w-1/2 relative bg-black">
            {images.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <Image
                    src={images[currentImageIndex]}
                    alt={retreat.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    priority
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
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

          {/* Right Side - Content */}
          <div ref={rightPanelRef} className="w-1/2 flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{retreat.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{retreat.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: retreat.title,
                          text: retreat.description,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {user && (
                    <button
                      onClick={handleWishlistToggle}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {isWishlistedState ? (
                        <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {!showBookingForm ? (
                <div className="p-6 space-y-6">
                  {/* About this retreat */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this retreat</h3>
                    <p className="text-gray-700 leading-relaxed">{retreat.description}</p>
                  </div>

                  {/* What's included */}
                  {retreat.unique_propositions && retreat.unique_propositions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included</h3>
                      <ul className="space-y-2">
                        {retreat.unique_propositions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What makes this retreat special */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                      What makes this retreat special
                    </h3>
                    <div className="space-y-3">
                      {(retreat.unique_propositions || [
                        'Exclusive access to premium retreat facilities',
                        'Personalized wellness and mindfulness experience',
                        'Professional guidance and support throughout'
                      ]).map((proposition, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircleIcon className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">{proposition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Important Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Cancellation Policy</h4>
                          <p className="text-gray-600 text-xs">Free cancellation up to 24 hours before the retreat start time.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">What to Bring</h4>
                          <p className="text-gray-600 text-xs">Comfortable clothing and any specific requirements will be communicated before the retreat.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Host Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {retreat.host_image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image 
                              src={retreat.host_image} 
                              alt={retreat.host_name || 'Host'} 
                              width={48} 
                              height={48} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                            {(retreat.host_name || 'E').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          Hosted by {retreat.host_name || 'EJA'}
                        </h4>
                        <p className="text-gray-600 mb-2 text-sm">
                          {retreat.host_type || 'Retreat Guide'} • {retreat.host_tenure || '3 years'} hosting
                        </p>
                        <p className="text-gray-700 mb-3 text-sm">
                          {(retreat.host_bio || 'Experienced guide passionate about creating transformative retreat experiences and wellness journeys.').slice(0, 100)}...
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(retreat.host_usps || ['Local Expertise', 'Safety First', 'Personalized Experience']).slice(0, 2).map((usp, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {usp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Reviews */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Guest Reviews</h3>
                      {user && !hasReviewed && (
                        <button
                          onClick={() => setCanReview(!canReview)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {canReview ? 'Cancel' : 'Add review'}
                        </button>
                      )}
                    </div>

                    {/* Add Review Form */}
                    {canReview && user && (
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="text-2xl"
                                  >
                                    {star <= reviewRating ? (
                                      <StarSolid className="w-6 h-6 text-yellow-400" />
                                    ) : (
                                      <StarIcon className="w-6 h-6 text-gray-300" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your review
                              </label>
                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                type="text"
                                placeholder="Your name"
                                value={reviewForm.name}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                              <Input
                                type="email"
                                placeholder="Your email"
                                value={reviewForm.email}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                disabled={submitting}
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
                        </CardContent>
                      </Card>
                    )}

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarSolid
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-1">- {review.guest_name}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Clean Booking Form - Rewritten from Scratch */
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Book this retreat</h3>
                      <p className="text-sm text-gray-600 mt-1">Customize your retreat experience</p>
                    </div>
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {loadingData ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading options...</span>
                    </div>
                  ) : (
                    <div>
                      {console.log('🔍 Booking form data:', { 
                        destinations: destinations.length, 
                        rooms: rooms.length, 
                        experiences: experiences.length,
                        budget: bookingForm.budget 
                      })}
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      {/* Step 1: Date & Guests */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                          Date & Guests
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Date Selection */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Select Date
                            </label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full text-base py-3 px-3 pr-10 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer text-left flex items-center justify-between"
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
                              
                              {/* Calendar Dropdown */}
                              {showCalendar && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-50 p-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <button
                                      type="button"
                                      onClick={() => navigateMonth('prev')}
                                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <ChevronLeftIcon className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button
                                      type="button"
                                      onClick={() => navigateMonth('next')}
                                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <ChevronRightIcon className="w-4 h-4 text-blue-600" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-1 mb-4">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                        {day}
                                      </div>
                                    ))}
                                    
                                    {getDaysArray(currentMonth).map((day, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => day && handleDateSelect(day)}
                                        disabled={!day || isPastDate(day, currentMonth)}
                                        className={`
                                          h-8 w-8 text-sm rounded-lg transition-all duration-200 flex items-center justify-center
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
                                  
                                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <button
                                      type="button"
                                      onClick={clearDate}
                                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Clear
                                    </button>
                                    <button
                                      type="button"
                                      onClick={goToToday}
                                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Today
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Guest Selection */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Number of Guests
                            </label>
                            <div className="relative">
                              <select
                                value={bookingForm.guests}
                                onChange={e => setBookingForm(prev => ({ ...prev, guests: Number(e.target.value) }))}
                                required
                                className="w-full text-base py-3 px-3 pr-10 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer appearance-none text-gray-900 font-medium"
                              >
                                {Array.from({ length: 7 }, (_, i) => i + 2).map(num => (
                                  <option key={num} value={num}>
                                    {num} {num === 1 ? 'Guest' : 'Guests'}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <UsersIcon className="w-4 h-4 text-green-500" />
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              Max 8 guests (2-8 guests)
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Step 2: Destination */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                          Destination
                        </h4>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Choose Destination
                          </label>
                          <select
                            value={bookingForm.destination}
                            onChange={e => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                            required
                            className="w-full text-base py-3 px-3 pr-10 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md cursor-pointer appearance-none text-gray-900 font-medium"
                          >
                            <option value="">Select a destination</option>
                            {destinations.map(stateGroup => (
                              <optgroup key={stateGroup.state} label={stateGroup.state}>
                                {stateGroup.cities.map(city => (
                                  <option key={`${stateGroup.state}-${city}`} value={city}>
                                    {city}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step 3: Duration */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                          Duration
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 3, 5].map(days => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setBookingForm(prev => ({ ...prev, duration: days }))}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                bookingForm.duration === days
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              <div className="text-lg font-semibold">{days} Day{days > 1 ? 's' : ''}</div>
                              <div className="text-sm text-gray-600">
                                {days === 1 ? 'Quick getaway' : days === 3 ? 'Weekend retreat' : 'Extended stay'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 4: Budget Category */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                          Budget Category
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'tight budget', label: 'Tight Budget', color: 'green' },
                            { key: 'family comfort', label: 'Family Comfort', color: 'blue' },
                            { key: 'premium', label: 'Premium', color: 'purple' }
                          ].map(({ key, label, color }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setBookingForm(prev => ({ ...prev, budget: key as any }))}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                bookingForm.budget === key
                                  ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                                  : `border-gray-200 bg-white text-gray-700 hover:border-${color}-300 hover:bg-${color}-50`
                              }`}
                            >
                              <div className="text-lg font-semibold">{label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 5: Property Selection */}
                      {bookingForm.budget && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
                            Property Selection
                          </h4>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-3">
                              Choose your accommodation
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowRoomModal(true)}
                              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
                            >
                              <div className="text-gray-600 font-medium">
                                {selectedRoom ? `Selected: ${selectedRoom.name || selectedRoom.room_type}` : 'Select a property'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Click to browse available properties
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 6: Experience Selection */}
                      {bookingForm.budget && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
                            Experience Selection
                          </h4>
                          
                          <button
                            type="button"
                            onClick={() => setShowExperienceModal(true)}
                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                          >
                            <div className="text-gray-600 font-medium mb-2">
                              {bookingForm.selectedExperiences.length > 0 
                                ? `Selected ${bookingForm.selectedExperiences.length} experiences` 
                                : 'Select experiences'
                              }
                            </div>
                            {bookingForm.selectedExperiences.length > 0 ? (
                              <div className="space-y-1">
                                {bookingForm.selectedExperiences.map(experienceId => {
                                  const experience = experiences.find(exp => exp.id === experienceId);
                                  return experience ? (
                                    <div key={experienceId} className="text-sm text-gray-700 bg-blue-50 px-2 py-1 rounded">
                                      • {experience.title}
                                    </div>
                                  ) : null;
                                })}
                                <div className="text-xs text-blue-600 mt-2">
                                  Click to modify selection
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Click to browse available experiences ({experiences.length} available)
                              </div>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Step 7: Special Requests */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">7</span>
                          Special Requests
                        </h4>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                          <textarea
                            rows={3}
                            value={bookingForm.specialRequests}
                            onChange={e => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                            placeholder="Any dietary restrictions, accessibility needs, or special requirements..."
                          />
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Base price (for 2 adults)</span>
                            <span className="font-semibold text-gray-900">₹{retreat.price?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Budget adjustment ({bookingForm.budget})</span>
                            <span className="font-semibold text-gray-900">
                              {bookingForm.budget === 'tight budget' ? '-30%' : 
                               bookingForm.budget === 'family comfort' ? 'Base' : '+30%'}
                            </span>
                          </div>
                          {calculatePricing().breakdown.additionalGuests > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Additional guests ({calculatePricing().breakdown.additionalGuests})</span>
                              <span className="font-semibold text-gray-900">
                                ₹{calculatePricing().breakdown.additionalPricePerGuest.toLocaleString()} each
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Duration</span>
                            <span className="font-semibold text-gray-900">{bookingForm.duration} day{bookingForm.duration > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Total guests</span>
                            <span className="font-semibold text-gray-900">{bookingForm.guests}</span>
                          </div>
                          <div className="border-t border-blue-200 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total Price</span>
                              <span className="text-xl font-bold text-blue-600">
                                ₹{calculatePricing().totalPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Button */}
                      <Button 
                        type="submit" 
                        variant="primary"
                        size="lg"
                        disabled={bookingLoading || !bookingForm.date || bookingForm.guests < 2 || !bookingForm.destination}
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
                    </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Footer - Book Now Button */}
            {!showBookingForm && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">₹{retreat.price?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">for 2 adults</div>
                  </div>
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    variant="primary"
                    className="px-8 py-3 text-lg font-semibold"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Selection Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Select Your Property</h3>
                <p className="text-gray-600 mt-1">
                  Choose from {rooms.length} available properties in your {bookingForm.budget} category
                </p>
                {rooms.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ No properties found for this budget category
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Room Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => {
                  return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      setBookingForm(prev => ({ ...prev, selectedRooms: [room.id] }));
                      setShowRoomModal(false);
                    }}
                    className={`cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Room Image with Carousel */}
                    <div className="relative h-48 rounded-t-xl overflow-hidden group bg-gray-200">
                      <Image
                        src={room.properties?.gallery?.[roomImageIndices[room.id] || 0] || room.properties?.cover_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'}
                        alt={room.room_type}
                        fill
                        className="object-cover transition-all duration-300"
                        onError={(e) => {
                          console.log('Image failed to load, using fallback');
                          // Fallback to a working image
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                        }}
                        onLoad={() => console.log('Image loaded successfully for room:', room.room_type)}
                      />
                      
                      {/* Property Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-900">
                        Property
                      </div>
                      
                      {/* Image Navigation Arrows */}
                      {room.properties?.gallery && room.properties.gallery.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = roomImageIndices[room.id] || 0;
                              const newIndex = currentIndex > 0 ? currentIndex - 1 : room.properties.gallery.length - 1;
                              setRoomImageIndices(prev => ({ ...prev, [room.id]: newIndex }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = roomImageIndices[room.id] || 0;
                              const newIndex = currentIndex < room.properties.gallery.length - 1 ? currentIndex + 1 : 0;
                              setRoomImageIndices(prev => ({ ...prev, [room.id]: newIndex }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Indicators */}
                      {room.properties?.gallery && room.properties.gallery.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                          {room.properties.gallery.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all ${
                                (roomImageIndices[room.id] || 0) === index ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-900 mb-1">{room.name || room.room_type}</h4>
                      <p className="text-sm text-gray-500 mb-3">{room.properties?.title || 'Property Name'}</p>
                      
                      {/* Amenities */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                          {(room.amenities || []).slice(0, 4).map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {(room.amenities || []).length > 4 && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              +{(room.amenities || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {rooms.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg font-medium">No rooms available</div>
                  <div className="text-sm mt-1">Try selecting a different budget category</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedRoom ? `Selected: ${selectedRoom.name}` : 'No room selected'}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowRoomModal(false)}
                    disabled={!selectedRoom}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience Selection Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Select Your Experiences</h3>
                <p className="text-gray-600 mt-1">
                  Choose up to 3 experiences from {experiences.length} available in your {bookingForm.budget} category
                </p>
                {experiences.length > 0 && experiences[0].id.startsWith('sample-') && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Showing sample data - no real experiences found in database
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowExperienceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Experience Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((experience) => {
                  const isSelected = bookingForm.selectedExperiences.includes(experience.id);
                  const canSelect = !isSelected && bookingForm.selectedExperiences.length < 3;
                  
                  return (
                    <div
                      key={experience.id}
                      onClick={() => {
                        if (isSelected) {
                          setBookingForm(prev => ({
                            ...prev,
                            selectedExperiences: prev.selectedExperiences.filter(id => id !== experience.id)
                          }));
                        } else if (canSelect) {
                          setBookingForm(prev => ({
                            ...prev,
                            selectedExperiences: [...prev.selectedExperiences, experience.id]
                          }));
                        }
                      }}
                      className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 ${
                        isSelected
                          ? 'ring-4 ring-blue-500 ring-opacity-50'
                          : canSelect
                          ? 'hover:shadow-xl'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Experience Image */}
                      <div className="relative h-48 bg-gray-200">
                        <Image
                          src={experience.cover_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'}
                          alt={experience.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Selection Indicator */}
                        <div className="absolute top-3 right-3">
                          {isSelected ? (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-5 h-5 text-white" />
                            </div>
                          ) : canSelect ? (
                            <div className="w-8 h-8 border-2 border-white rounded-full bg-white/20 backdrop-blur-sm" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                              <XMarkIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Experience Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {experience.experience_type}
                          </span>
                        </div>
                      </div>
                      
                      {/* Experience Content */}
                      <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{experience.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        
                        {/* Experience Details */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>2-3 hrs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>Small group</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {experiences.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg font-medium">No experiences available</div>
                  <div className="text-sm">for this budget category</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {bookingForm.selectedExperiences.length > 0 
                  ? `${bookingForm.selectedExperiences.length} experiences selected`
                  : 'No experiences selected'
                }
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
