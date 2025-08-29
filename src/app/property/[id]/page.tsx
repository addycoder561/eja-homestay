'use client';

// TypeScript declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PropertyImageGallery } from '@/components/PropertyImageGallery';
import { getPropertyWithReviews, hasCompletedBooking, getRoomsForProperty } from '@/lib/database';
import { updatePropertyRating } from '@/lib/rating-calculator';
import { PropertyWithReviews, Profile, Room } from '@/lib/types';
import { addDays, format, isSameDay, differenceInDays } from 'date-fns';
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
  ChevronUpIcon,
  UserIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LiveRating } from '@/components/LiveRating';

// Host Info Modal Component
function HostInfoModal({ isOpen, onClose, property }: { isOpen: boolean; onClose: () => void; property: PropertyWithReviews }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">About {property.host_name || 'EJA'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-start gap-6 mb-6">
            {property.host_image ? (
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <Image 
                  src={property.host_image} 
                  alt={property.host_name || 'Host'} 
                  width={80} 
                  height={80} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {(property.host_name || 'E').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{property.host_name || 'EJA'} Host</h3>
              <p className="text-gray-600 mb-2">{property.host_tenure || '5 years'} hosting</p>
              <p className="text-gray-700 leading-relaxed">
                {property.host_description || 'EJA is a trusted hospitality partner committed to providing exceptional homestay experiences. We specialize in curating unique properties that offer authentic local experiences while ensuring comfort and safety for our guests. Our hosts are carefully selected and trained to deliver warm, personalized service that makes every stay memorable.'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Host Highlights:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(property.host_usps || ['Warm Hospitality', 'Local Expertise', 'Quick Response']).map((usp, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{usp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Description Modal Component
function DescriptionModal({ isOpen, onClose, description }: { isOpen: boolean; onClose: () => void; description: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">About this place</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Room Type Component
function RoomTypeCard({ 
  room, 
  property,
  onQuantityChange, 
  selectedQuantity = 0,
  maxAvailable = 1
}: { 
  room: Room; 
  property: PropertyWithReviews;
  onQuantityChange: (quantity: number) => void;
  selectedQuantity?: number;
  maxAvailable?: number;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-all duration-300">
      <div className="flex gap-6">
        <div className="w-1/3">
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image 
              src={
                room.images && room.images.length > 0 
                  ? room.images[0] 
                  : property.images && property.images.length > 0 
                    ? property.images[0] 
                    : '/placeholder-experience.jpg'
              } 
              alt={room.name} 
              fill 
              className="object-cover" 
            />
          </div>
        </div>
        <div className="w-2/3">
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
            <p className="text-gray-700 mb-4 text-sm line-clamp-2">{room.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Capacity:</span> Up to {room.max_guests} guests
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quantity:</span>
              <select
                value={selectedQuantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: maxAvailable + 1 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified Booking Form Component
function SimplifiedBookingForm({ 
  property, 
  rooms, 
  roomSelections,
  onRoomQuantityChange
}: { 
  property: PropertyWithReviews;
  rooms: Room[];
  roomSelections: Record<string, number>;
  onRoomQuantityChange: (roomId: string, quantity: number) => void;
}) {
  console.log('🔍 SimplifiedBookingForm is rendering!');
  console.log('🔍 Property:', property);
  console.log('🔍 Rooms:', rooms);
  
  const { user, profile } = useAuth();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const dayAfter = format(addDays(new Date(), 2), 'yyyy-MM-dd');
    setCheckIn(tomorrow);
    setCheckOut(dayAfter);
  }, []);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  // Calculate selected room price (price A from left side)
  const calculateSelectedRoomPrice = () => {
    let totalPrice = 0;
    Object.entries(roomSelections).forEach(([roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      if (room && quantity > 0) {
        totalPrice += room.price * quantity;
      }
    });
    return totalPrice;
  };

  // Calculate final total price (selected rooms × nights)
  const calculateTotalPrice = () => {
    const selectedRoomPrice = calculateSelectedRoomPrice();
    const nights = calculateNights();
    if (nights <= 0 || selectedRoomPrice <= 0) return 0;
    return selectedRoomPrice * nights;
  };

  // Get display price (selected room price or base property price)
  const getDisplayPrice = () => {
    const selectedRoomPrice = calculateSelectedRoomPrice();
    return selectedRoomPrice > 0 ? selectedRoomPrice : (property.price_per_night || 0);
  };

  return (
    <Card className="sticky top-8 bg-white shadow-xl border-0">
      {/* TEST BUTTON - Should be visible */}
      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 9999 }}>
        <button
          onClick={() => {
            console.log('🔍 SIMPLIFIED BOOKING FORM TEST BUTTON CLICKED!');
            console.log('🔍 User:', user);
            console.log('🔍 Property:', property);
            console.log('🔍 Rooms:', rooms);
          }}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🟢 SIMPLIFIED TEST
        </button>
      </div>

      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900">₹{getDisplayPrice()?.toLocaleString()}</div>
          <div className="text-gray-600">per night</div>
        </div>

        <div className="space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Rooms</label>
            <div className="space-y-2">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-600">₹{room.price}/night</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const currentQty = roomSelections[room.id] || 0;
                        if (currentQty > 0) {
                          onRoomQuantityChange(room.id, currentQty - 1);
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={(roomSelections[room.id] || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{roomSelections[room.id] || 0}</span>
                    <button
                      onClick={() => {
                        const currentQty = roomSelections[room.id] || 0;
                        onRoomQuantityChange(room.id, currentQty + 1);
                      }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Total for {calculateNights()} nights</span>
              <span className="text-xl font-bold text-gray-900">₹{calculateTotalPrice().toLocaleString()}</span>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              disabled={!user || calculateTotalPrice() === 0}
              onClick={async () => {
                console.log('🔍 Book Now button clicked!');
                console.log('🔍 User:', user);
                console.log('🔍 Property:', property);
                console.log('🔍 Check-in:', checkIn);
                console.log('🔍 Check-out:', checkOut);
                console.log('🔍 Adults:', adults);
                console.log('🔍 Children:', children);
                console.log('🔍 Total price:', calculateTotalPrice());
                
                if (!user) {
                  toast.error('Please sign in to book');
                  return;
                }

                if (calculateTotalPrice() === 0) {
                  toast.error('Please select at least one room');
                  return;
                }

                // Test profile API - Use auth context instead of API
                try {
                  console.log('🔍 Profile data from auth context:', {
                    user: user,
                    profile: profile // This comes from useAuth context
                  });
                  
                  // Also try the API as backup
                  const res = await fetch('/api/user/profile', {
                    credentials: 'include'
                  });
                  const data = await res.json();
                  console.log('🔍 Profile API response:', data);
                } catch (error) {
                  console.error('🔍 Profile API error:', error);
                }
                
                // Create Razorpay order
                try {
                  console.log('🔍 Creating Razorpay order...');
                  const orderRes = await fetch('/api/payments/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      amount: Math.round(calculateTotalPrice() * 100), // Convert to paise
                      currency: 'INR',
                      notes: {
                        type: 'homestay',
                        propertyId: property.id,
                        checkIn,
                        checkOut,
                        guests: adults + children
                      }
                    }),
                  });
                  
                  if (!orderRes.ok) {
                    throw new Error('Failed to create payment order');
                  }
                  
                  const { order } = await orderRes.json();
                  console.log('🔍 Razorpay order created:', order);
                  
                  // Initialize Razorpay
                  const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: property.title,
                    description: `Booking for ${calculateNights()} night${calculateNights() > 1 ? 's' : ''}`,
                    order_id: order.id,
                    handler: async function (response: any) {
                      console.log('🔍 Payment successful!', response);
                      toast.success('Payment successful! Booking confirmed.');
                      // Here you would create the booking in the database
                    },
                    prefill: {
                      email: user.email || '',
                      name: profile?.full_name || user.user_metadata?.full_name || '',
                    },
                    theme: { color: '#2563eb' },
                    modal: {
                      ondismiss: function () {
                        console.log('🔍 Payment modal dismissed');
                        toast.error('Payment was cancelled');
                      }
                    }
                  };

                  // Check if Razorpay is loaded
                  if (typeof window !== 'undefined' && (window as any).Razorpay) {
                    console.log('🔍 Opening Razorpay payment modal...');
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                  } else {
                    console.error('🔍 Razorpay not loaded');
                    toast.error('Payment gateway not loaded. Please refresh the page.');
                  }
                  
                } catch (error) {
                  console.error('🔍 Payment error:', error);
                  toast.error('Failed to process payment. Please try again.');
                }
              }}
            >
              {user ? 'Book Now' : 'Sign in to Book'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  console.log('🔍 PropertyDetailPage is loading!');
  
  const params = useParams();
  const propertyId = params.id as string;
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<PropertyWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllRoomTypes, setShowAllRoomTypes] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(true);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [roomSelections, setRoomSelections] = useState<Record<string, number>>({});

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

  const handleRoomQuantityChange = (roomId: string, quantity: number) => {
    setRoomSelections(prev => ({
      ...prev,
      [roomId]: quantity
    }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(roomSelections).forEach(([roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      if (room && quantity > 0) {
        total += room.price * quantity;
      }
    });
    return total;
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

  // Use actual data from database with fallbacks
  const uniquePropositions = property.unique_propositions && property.unique_propositions.length > 0 
    ? property.unique_propositions 
    : [
        'Stunning mountain views from every room',
        'Authentic local cuisine prepared fresh daily',
        'Exclusive access to hidden hiking trails'
      ];

  const displayedReviews = showAllReviews ? property.reviews : property.reviews.slice(0, 3);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Property Title and Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{property.title}</h1>
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
            
            {/* Property Details - Collapsible Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                      Property Details
                </h2>
                      <button
                      onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                      {showPropertyDetails ? (
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
                
                {showPropertyDetails && (
                  <div className="p-6 space-y-8">
                    {/* Property Info Section - Compact Layout */}
                    <div>
                      {/* First Line: Subtitle and Location */}
                      <div className="mb-4">
                        {property.subtitle && (
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">{property.subtitle}</h3>
                        )}
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>
                            {[property.address, property.city, property.state, property.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Second Line: Property Stats */}
                      <div className="flex items-center space-x-6 mb-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Up to {property.max_guests} guests</span>
                                  </div>
                        <div className="flex items-center space-x-1">
                          <HomeIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{property.bedrooms} room{property.bedrooms !== 1 ? 's' : ''}</span>
                              </div>
                        <div className="flex items-center space-x-1">
                          <HomeIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{property.beds || property.bedrooms} bed{(property.beds || property.bedrooms) !== 1 ? 's' : ''}</span>
                            </div>
                        <div className="flex items-center space-x-1">
                          <WifiIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Third Line: Category and Rating */}
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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
                              </div>
                              
                    {/* Host Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          {property.host_image ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden">
                              <Image 
                                src={property.host_image} 
                                alt={property.host_name || 'Host'} 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                              {(property.host_name || 'E').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            Hosted by {property.host_name || 'EJA'}
                          </h4>
                          <p className="text-gray-600 mb-3 text-sm">
                            {property.host_type || 'EJA Host'} • {property.host_tenure || '5 years'} hosting
                          </p>
                          <p className="text-gray-700 mb-4 text-sm">
                            {(property.host_description || 'Experienced host passionate about hospitality and local culture.').slice(0, 120)}
                            <button 
                              onClick={() => setHostModalOpen(true)}
                              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                              more
                            </button>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(property.host_usps || ['Warm Hospitality', 'Local Expertise', 'Quick Response']).map((usp, index) => (
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
                              
                    {/* Unique Propositions */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                        What makes this place special
                      </h3>
                      <div className="space-y-3">
                        {uniquePropositions.map((proposition, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                                </div>
                            <span className="text-gray-700 text-sm">{proposition}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Property Description */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">About this place</h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {property.description?.slice(0, 180)}
                          {property.description && property.description.length > 180 && (
                            <>
                              ...
                                <button
                                onClick={() => setDescriptionModalOpen(true)}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                              >
                                more
                                </button>
                            </>
                          )}
                        </p>
                              </div>
                            </div>

                    {/* Amenities */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <WifiIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Amenities
                      </h3>
                      {property.amenities && property.amenities.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <WifiIcon className="w-3 h-3 text-blue-600" />
                          </div>
                              <span className="text-gray-700 text-sm font-medium">{amenity}</span>
                        </div>
                          ))}
                  </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <WifiIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">No amenities listed</h4>
                          <p className="text-gray-600 text-sm">Amenities information will be provided upon booking.</p>
                        </div>
                      )}
                    </div>

            {/* House Rules & Cancellation Policy */}
                    <div className="border-t pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                  <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                            <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-600" />
                      House Rules
                    </h3>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-gray-700 text-sm">{property.house_rules || 'House rules will be provided upon booking.'}</p>
                    </div>
                  </div>
                  <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Cancellation Policy
                    </h3>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-gray-700 text-sm">{property.cancellation_policy || 'Cancellation policy will be provided upon booking.'}</p>
                    </div>
                  </div>
                </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Room Types */}
            {rooms.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <HomeIcon className="w-6 h-6 mr-2 text-blue-600" />
                      Available Room Types
                    </h2>
                    <button
                      onClick={() => setShowAllRoomTypes(!showAllRoomTypes)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {showAllRoomTypes ? (
                        <>
                          <ChevronUpIcon className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-4 h-4" />
                          Show All ({rooms.length})
                        </>
                      )}
                    </button>
                  </div>
                  {showAllRoomTypes && (
                    <>
                      <div className="space-y-4">
                        {rooms.map(room => (
                          <RoomTypeCard
                            key={room.id}
                            room={room}
                            property={property}
                            selectedQuantity={roomSelections[room.id] || 0}
                            maxAvailable={room.total_inventory || 1}
                            onQuantityChange={(quantity) => handleRoomQuantityChange(room.id, quantity)}
                          />
                        ))}
                      </div>
                      {Object.values(roomSelections).some(qty => qty > 0) && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Price:</span>
                            <span className="text-2xl font-bold text-blue-600">₹{calculateTotalPrice().toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

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

          {/* Right Sidebar - Simplified Booking Form */}
          <div className="lg:col-span-1">
            <SimplifiedBookingForm 
              property={property} 
              rooms={rooms}
              roomSelections={roomSelections}
              onRoomQuantityChange={handleRoomQuantityChange}
            />
                    </div>
        </div>
      </main>
      
      {/* Modals */}
      <HostInfoModal 
        isOpen={hostModalOpen} 
        onClose={() => setHostModalOpen(false)} 
        property={property}
      />
      <DescriptionModal 
        isOpen={descriptionModalOpen} 
        onClose={() => setDescriptionModalOpen(false)} 
        description={property.description || ''}
      />
      
      <Footer />
      
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  );
} 