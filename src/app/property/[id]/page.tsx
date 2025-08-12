'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { LiveRating } from '@/components/LiveRating';
import { PropertyImageGallery } from '@/components/PropertyImageGallery';
import { getPropertyWithReviews, hasCompletedBooking, getRoomsForProperty } from '@/lib/database';
import { updatePropertyRating } from '@/lib/rating-calculator';
import { PropertyWithReviews, Profile, Room } from '@/lib/types';
import { addDays, format, isSameDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { 
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  UsersIcon,
  HomeIcon,
  WifiIcon,
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

function GoogleMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <iframe
      width="100%"
      height="400"
      style={{ border: 0, borderRadius: 16 }}
      loading="lazy"
      allowFullScreen
      src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
    />
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<PropertyWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [lastBooking, setLastBooking] = useState<{ id: string; status: string; total_price?: number } | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const bookingFormRef = useRef<HTMLDivElement | null>(null);

  console.log('PropertyDetailPage propertyId:', propertyId);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyWithReviews(propertyId);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    // Check if user can review (has completed booking)
    const checkEligibility = async () => {
      if (user && propertyId) {
        const eligible = await hasCompletedBooking(user.id, propertyId);
        setCanReview(eligible);
      } else {
        setCanReview(false);
      }
    };
    checkEligibility();
  }, [user, propertyId]);

  useEffect(() => {
    if (lastBooking) {
      console.log('lastBooking set:', lastBooking);
    }
  }, [lastBooking]);

  useEffect(() => {
    // Check if user has already reviewed this property
    if (user && property && property.reviews) {
      const alreadyReviewed = property.reviews.some(r => r.guest_id === user.id);
      setHasReviewed(alreadyReviewed);
    } else {
      setHasReviewed(false);
    }
  }, [user, property]);

  useEffect(() => {
    // Fetch rooms for this property
    if (propertyId) {
      getRoomsForProperty(propertyId).then(setRooms);
    }
  }, [propertyId]);

  useEffect(() => {
    // Check if property is wishlisted
    if (user && property) {
      checkWishlistStatus();
    }
  }, [user, property]);

  const checkWishlistStatus = async () => {
    if (!user || !property) return;
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', property.id)
        .eq('item_type', 'property')
        .single();
      setIsWishlisted(!!data);
    } catch (error) {
      setIsWishlisted(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !property) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', property.id)
          .eq('item_type', 'property');
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            item_id: property.id,
            item_type: 'property'
          });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('reviews').insert({
        property_id: propertyId,
        guest_id: profile.id,
        rating: reviewRating,
        comment: reviewText,
      }).select().single();
      if (error) throw error;
      setReviewText('');
      setReviewRating(5);
      // Update property rating in database
      await updatePropertyRating(propertyId);
      
      // Refresh property data to get updated ratings
      const updatedProperty = await getPropertyWithReviews(propertyId);
      if (updatedProperty) {
        setProperty(updatedProperty);
      }
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!lastBooking) return;
    setPaymentLoading(true);
    const options = {
      key: 'rzp_test_C7d9Vbcc9JM8dp',
      amount: Math.round((lastBooking.total_price || 0) * 100), // in paise
      currency: 'INR',
      name: property?.title || 'Property Booking',
      description: 'Booking Payment',
      handler: async function (response: { razorpay_payment_id: string }) {
            // Mark booking as confirmed (aligned with booking_status enum)
            await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', lastBooking.id);
        toast.success('Payment successful! Your booking is confirmed.');
        window.location.href = '/guest/dashboard';
      },
      prefill: {
        email: profile?.email,
        name: profile?.full_name,
      },
      theme: { color: '#2563eb' },
    };
    // @ts-expect-error: Razorpay is a global injected by the script
    const rzp = new window.Razorpay(options);
    rzp.open();
    setPaymentLoading(false);
  };

  // Helper: get next 30 days
  const getNext30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      days.push(addDays(today, i));
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Demo/placeholder data for new fields
  // Use actual data from Supabase, with minimal fallbacks only if absolutely necessary
  const usps = property.usps && property.usps.length > 0 ? property.usps : [
    'Stunning mountain views',
    'Power backup & pure-veg meals',
    'Pet friendly & parking available',
  ];
  
  const host: Profile = property.host || {
    id: '',
    email: '',
    full_name: 'Host Name',
    phone: '',
    avatar_url: '',
    is_host: true,
    created_at: '',
    updated_at: '',
    host_bio: 'Experienced host passionate about hospitality and local culture.',
    host_usps: ['Warm hospitality', 'Local expertise', 'Quick response'],
  };
  
  const houseRules = property.house_rules || 'House rules will be provided upon booking.';
  const cancellationPolicy = property.cancellation_policy || 'Cancellation policy will be provided upon booking.';

  const displayedReviews = showAllReviews ? property.reviews : property.reviews.slice(0, 3);
  const displayedAmenities = showAllAmenities ? (property.amenities || []) : (property.amenities || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {property.property_type}
                </span>
                <div className="flex items-center text-yellow-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {property.google_rating || property.average_rating || 4.5}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({property.google_reviews_count || property.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{property.title}</h1>
              {property.subtitle && <h2 className="text-xl text-gray-600 mb-3">{property.subtitle}</h2>}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>
                  {[property.address, property.city, property.state, property.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isWishlisted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <HeartIcon className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-200">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Image Gallery */}
        <div className="mb-8">
          <PropertyImageGallery 
            images={(property.cover_image ? [property.cover_image, ...property.images] : property.images).filter((v, i, a) => v && a.indexOf(v) === i)} 
            propertyTitle={property.title} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <HomeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UsersIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.max_guests}</div>
                    <div className="text-sm text-gray-600">Max Guests</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <StarIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.google_rating || property.average_rating || 4.5}
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* USPs */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CheckCircleIcon className="w-6 h-6 mr-2 text-green-600" />
                  Why Book This Stay?
                </h2>
                {usps && usps.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {usps.map((usp, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{usp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No highlights listed</h3>
                    <p className="text-gray-600">Property highlights will be provided upon booking.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <WifiIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Amenities
                </h2>
                {property.amenities && property.amenities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {displayedAmenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <WifiIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                    {(property.amenities || []).length > 6 && (
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {showAllAmenities ? (
                          <>
                            <ChevronUpIcon className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-4 h-4" />
                            Show All Amenities ({(property.amenities || []).length})
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WifiIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No amenities listed</h3>
                  <p className="text-gray-600">Amenities information will be provided upon booking.</p>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Room Types List */}
            {property && rooms.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <HomeIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Available Room Types
                  </h2>
                  <div className="space-y-6">
                    {rooms.map(room => {
                      // Use per-room images if available, else fallback to property images
                      const roomImages = room.images && room.images.length > 0 ? room.images : property.images.slice(0, 2);
                      return (
                        <div key={room.id} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:w-1/3">
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                {roomImages.slice(0, 4).map((img, i) => (
                                  <div key={i} className="relative h-20 rounded-lg overflow-hidden">
                                    <Image src={img} alt={`${room.name} image ${i + 1}`} fill className="object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="lg:w-2/3">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {room.room_type}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-600">₹{room.price}</div>
                                  <div className="text-sm text-gray-500">per night</div>
                                </div>
                              </div>
                              
                              {room.description && (
                                <p className="text-gray-700 mb-4 text-sm">{room.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities && room.amenities.slice(0, 4).map((amenity, i) => (
                                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    {amenity}
                                  </span>
                                ))}
                                {room.amenities && room.amenities.length > 4 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    +{room.amenities.length - 4} more
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                  <span className="font-semibold">Capacity:</span> Up to {room.max_guests} guests
                                </div>
                                <button
                                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center"
                                  onClick={() => {
                                    setPreselectedRoomId(room.id);
                                    setTimeout(() => {
                                      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 100);
                                  }}
                                >
                                  Book This Room
                                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* House Rules & Cancellation Policy */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
                      House Rules
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-700">{houseRules}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Cancellation Policy
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700">{cancellationPolicy}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <StarIcon className="w-6 h-6 mr-2 text-yellow-500" />
                    Guest Reviews
                  </h2>
                  <LiveRating 
                    propertyId={property.id}
                    propertyTitle={property.title}
                    size="md"
                  />
                </div>
                
                {property.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {displayedReviews.map((review, idx) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {review.guest_id.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {property.reviews.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                      >
                        {showAllReviews ? 'Show Less Reviews' : `Show All ${property.reviews.length} Reviews`}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <StarIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this property!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <UsersIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Meet Your Host
                </h2>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {host.avatar_url ? (
                        <Image src={host.avatar_url} alt={host.full_name || 'Host'} width={96} height={96} className="rounded-full" />
                      ) : (
                        host.full_name?.[0] || 'H'
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{host.full_name}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{host.host_bio}</p>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{host.email}</span>
                    </div>
                    
                    {(host.host_usps || []).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Host Highlights:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(host.host_usps || []).map((usp, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {usp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Map */}
            {property.latitude && property.longitude && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <MapPinIcon className="w-6 h-6 mr-2 text-red-600" />
                      Location
                    </h2>
                  </div>
                  <GoogleMap lat={property.latitude} lng={property.longitude} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Booking Form */}
          <div className="lg:col-span-1" ref={bookingFormRef}>
            <BookingForm property={property} preselectedRoomId={preselectedRoomId} />
          </div>
        </div>

        {/* Review Form Section */}
        {user && profile && (
          <section className="mt-12">
            {canReview && !hasReviewed && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Leave a Review
                  </h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Share your experience with this property..."
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      loading={submitting} 
                      disabled={submitting || !reviewText}
                      className="w-full"
                    >
                      Submit Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {hasReviewed && user && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Review Submitted</h3>
                  <p className="text-green-700">You have already reviewed this property. Thank you for your feedback!</p>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 