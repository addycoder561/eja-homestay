'use client';

// TypeScript declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { EngagementIcons } from '@/components/EngagementIcons';
import { getProperties, searchProperties, getExperiences, getRetreats, createExperienceBooking, createTripBooking, isWishlisted, addToWishlist, removeFromWishlist, ensureProfile } from '@/lib/database';
import { PropertyWithHost, SearchFilters as SearchFiltersType, Experience, PropertyType } from '@/lib/types';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  StarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BookmarkIcon as BookmarkOutline
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { SearchResultSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import { buildCoverFirstImages } from '@/lib/media';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';



// Filter data for experiences and retreats
const experienceFilterData = {
  category: [
    { id: 'immersive', label: 'Immersive', icon: '🧘', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'playful', label: 'Playful', icon: '🎮', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'culinary', label: 'Culinary', icon: '🍽️', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'meaningful', label: 'Meaningful', icon: '❤️', color: 'bg-red-100 text-red-700 border-red-200' }
  ],
  contentType: [
    { id: 'hyper-local', label: 'Hyper-local', icon: '🏘️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'retreats', label: 'Retreats', icon: '🏔️', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ]
};

const retreatFilterData = {
  category: [
    { id: 'Couple', label: 'Couple', icon: '💑' },
    { id: 'Solo', label: 'Solo', icon: '🧘' },
    { id: 'Pet-Friendly', label: 'Pet-Friendly', icon: '🐕' },
    { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'Purposeful', label: 'Purposeful', icon: '🎯' },
    { id: 'Senior Citizen', label: 'Senior Citizen', icon: '👴' },
    { id: 'Group', label: 'Group', icon: '👥' },
    { id: 'Parents', label: 'Parents', icon: '👨‍👩‍👦' }
  ]
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: loadingAuth } = useAuth();
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [retreats, setRetreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [loadingRetreats, setLoadingRetreats] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    rooms: searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : undefined,
    adults: searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined,
  });
  const [totalResults, setTotalResults] = useState(0);
  
  // Booking modal states
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Experience | any>(null);
  const [bookingType, setBookingType] = useState<'experience' | 'retreat'>('experience');
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 1,
    phone: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<any>(null);
  
  // Wishlist states
  const [wishlistedExperienceIds, setWishlistedExperienceIds] = useState<string[]>([]);
  const [wishlistedRetreatIds, setWishlistedRetreatIds] = useState<string[]>([]);
  
  // Filter states
  const [selectedExperienceCategory, setSelectedExperienceCategory] = useState("");
  const [selectedRetreatCategory, setSelectedRetreatCategory] = useState("");
  const [selectedContentTypeToggle, setSelectedContentTypeToggle] = useState<'hyper-local' | 'retreats'>('hyper-local');
  const [selectedFilterChips, setSelectedFilterChips] = useState<string[]>([]);
  


  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const startTime = Date.now();
      
      try {
        let data;
        
        // Combine filters with selected chips
        const combinedFilters = {
          ...filters,
          selectedChips: selectedFilterChips.length > 0 ? selectedFilterChips : undefined
        };

        console.log('🔍 DEBUG - Combined Filters:', combinedFilters);
        console.log('🔍 DEBUG - Selected Filter Chips:', selectedFilterChips);
        
        // Check if any filters are applied
        const hasFilters = Object.values(combinedFilters).some(value => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== undefined && value !== null && value !== '';
        });

        if (hasFilters) {
          console.log('Applying filters:', combinedFilters);
          data = await searchProperties(combinedFilters);
        } else {
          console.log('No filters applied, fetching all properties');
          data = await getProperties();
        }
        
        console.log('Fetched properties:', data);
        setProperties(data || []);
        setTotalResults((data || []).length);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filters, selectedFilterChips]);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const data = await getExperiences();
        setExperiences(data || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setExperiences([]);
      } finally {
        setLoadingExperiences(false);
      }
    };
    fetchExperiences();
  }, []);

  // Fetch retreats
  useEffect(() => {
    const fetchRetreats = async () => {
      try {
        setLoadingRetreats(true);
        const data = await getRetreats();
        setRetreats(data || []);
      } catch (error) {
        console.error('Error fetching retreats:', error);
        setRetreats([]);
      } finally {
        setLoadingRetreats(false);
      }
    };
    fetchRetreats();
  }, []);

  // Fetch wishlist status for experiences
  useEffect(() => {
    let ignore = false;
    async function fetchExperienceWishlist() {
      try {
        if (user && experiences.length > 0) {
          const wishlist = await Promise.all(
            experiences.map(exp => 
              exp && exp.id ? isWishlisted(user.id, exp.id, 'experience') : Promise.resolve(false)
            )
          );
          if (!ignore) {
            setWishlistedExperienceIds(
              experiences.map((exp, i) => exp && exp.id && wishlist[i] ? exp.id : '').filter(Boolean)
            );
          }
        } else {
          setWishlistedExperienceIds([]);
        }
      } catch (error) {
        console.error('Error fetching experience wishlist:', error);
        setWishlistedExperienceIds([]);
      }
    }
    fetchExperienceWishlist();
    return () => { ignore = true; };
  }, [user, experiences]);

  // Fetch wishlist status for retreats
  useEffect(() => {
    let ignore = false;
    async function fetchRetreatWishlist() {
      try {
        if (user && retreats.length > 0) {
          const wishlist = await Promise.all(
            retreats.map(retreat => 
              retreat && retreat.id ? isWishlisted(user.id, retreat.id, 'trip') : Promise.resolve(false)
            )
          );
          if (!ignore) {
            setWishlistedRetreatIds(
              retreats.map((retreat, i) => retreat && retreat.id && wishlist[i] ? retreat.id : '').filter(Boolean)
            );
          }
        } else {
          setWishlistedRetreatIds([]);
        }
      } catch (error) {
        console.error('Error fetching retreat wishlist:', error);
        setWishlistedRetreatIds([]);
      }
    }
    fetchRetreatWishlist();
    return () => { ignore = true; };
  }, [user, retreats]);

  // Wishlist handlers
  const handleExperienceWishlist = async (expId: string, wishlisted: boolean, e: React.MouseEvent) => {
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
          setWishlistedExperienceIds(ids => ids.filter(id => id !== expId));
          toast.success('Experience removed from wishlist');
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, expId, 'experience');
        if (success) {
          setWishlistedExperienceIds(ids => [...ids, expId]);
          toast.success('Experience added to wishlist');
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleRetreatWishlist = async (retreatId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add retreats to wishlist');
      return;
    }
    
    try {
      if (wishlisted) {
        const success = await removeFromWishlist(user.id, retreatId, 'trip');
        if (success) {
          setWishlistedRetreatIds(ids => ids.filter(id => id !== retreatId));
          toast.success('Retreat removed from wishlist');
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, retreatId, 'trip');
        if (success) {
          setWishlistedRetreatIds(ids => [...ids, retreatId]);
          toast.success('Retreat added to wishlist');
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  // Filter chip click handler
  const handleFilterChipClick = (chipName: string) => {
    console.log('🔍 DEBUG - Filter chip clicked:', chipName);
    setSelectedFilterChips(prev => {
      const newChips = prev.includes(chipName) 
        ? prev.filter(chip => chip !== chipName)
        : [...prev, chipName];
      console.log('🔍 DEBUG - Updated filter chips:', newChips);
      return newChips;
    });
  };

  // Booking handlers
  const openBooking = (item: Experience | any, type: 'experience' | 'retreat') => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/discover?book=${type}-${item.id}`);
      return;
    }
    setSelectedItem(item);
    setBookingType(type);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedItem(null);
    setForm({ name: "", email: "", date: "", guests: 1, phone: "" });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleBook called for:', bookingType);
    console.log('🔍 selectedItem:', selectedItem);
    console.log('🔍 user:', user);
    console.log('🔍 profile:', profile);
    
    if (!selectedItem || !user || !profile) {
      console.error('🔍 Missing required data:', { selectedItem: !!selectedItem, user: !!user, profile: !!profile });
      return;
    }

    setBookingLoading(true);
    try {
      if (bookingType === 'experience') {
        console.log('🔍 Processing experience booking...');
        // Ensure profile is up to date
        console.log('🔍 Ensuring profile is up to date for experience booking...');
        const updatedProfile = await ensureProfile(
          user.id,
          user.email!,
          user.user_metadata?.full_name
        );
        
        if (!updatedProfile) {
          console.error('🔍 Failed to ensure profile');
          toast.error('Failed to create/update user profile');
          setBookingLoading(false);
          return;
        }
        
        console.log('🔍 Profile ensured for experience booking:', updatedProfile);

        // Initialize Razorpay via server-created order
        console.log('🔍 Creating payment order for experience...');
        const orderRes = await fetch('/api/payments/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            amount: selectedItem.price * form.guests * 100, 
            currency: 'INR', 
            notes: { type: 'experience', experienceId: selectedItem.id } 
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
          description: `Booking for ${selectedItem.title}`,
          order_id: order.id,
          handler: async function (response: any) {
            console.log('🔍 Payment successful, creating booking...');
            try {
              // Create booking after successful payment
              const booking = await createExperienceBooking({
                experienceId: selectedItem.id,
                guestId: user.id,
                email: updatedProfile.email,
                name: updatedProfile.full_name || "",
                date: form.date,
                guests: form.guests,
                totalPrice: selectedItem.price * form.guests,
              });

              if (booking) {
                console.log('🔍 Booking created successfully:', booking);
                await sendPaymentReceiptEmail({
                  to: updatedProfile.email,
                  guestName: updatedProfile.full_name || '',
                  bookingType: 'experience',
                  title: selectedItem.title,
                  checkIn: form.date,
                  checkOut: form.date,
                  guests: form.guests,
                  totalPrice: selectedItem.price * form.guests,
                  paymentRef: response.razorpay_payment_id,
                });

                toast.success('Booking confirmed! Check your email for details.');
                closeBooking();
                router.push('/guest/dashboard');
              } else {
                console.error('🔍 Booking creation failed');
                toast.error('Payment successful but booking creation failed');
              }
            } catch (error) {
              console.error('🔍 Error creating booking:', error);
              toast.error('Payment successful but booking creation failed');
            }
          },
          prefill: {
            name: updatedProfile.full_name || '',
            email: updatedProfile.email,
            contact: updatedProfile.phone || '',
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
      } else {
        // Retreat booking
        // Ensure profile is up to date
        console.log('🔍 Ensuring profile is up to date for retreat booking...');
        const updatedProfile = await ensureProfile(
          user.id,
          user.email!,
          user.user_metadata?.full_name
        );
        
        if (!updatedProfile) {
          toast.error('Failed to create/update user profile');
          setBookingLoading(false);
          return;
        }
        
        console.log('🔍 Profile ensured for retreat booking:', updatedProfile);

        const totalPrice = selectedItem.price * form.guests;
        const orderRes = await fetch('/api/payments/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'INR', notes: { type: 'retreat', tripId: selectedItem.id } }),
        });
        
        if (!orderRes.ok) {
          throw new Error('Failed to create payment order');
        }
        
        const { order } = await orderRes.json();
        if (!order) throw new Error('Failed to initialize payment');
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: selectedItem.title,
          description: 'Retreat Payment',
          order_id: order.id,
          handler: async function (response: any) {
            const booking = await createTripBooking({
              tripId: selectedItem.id,
              email: form.email,
              name: form.name,
              date: form.date,
              guests: form.guests,
              totalPrice,
              guestId: updatedProfile.id,
            });
            
            await sendPaymentReceiptEmail({
              to: updatedProfile.email,
              guestName: updatedProfile.full_name || updatedProfile.email,
              bookingType: 'Retreat',
              title: selectedItem.title,
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
            email: updatedProfile.email,
            name: updatedProfile.full_name,
          },
          theme: { color: '#2563eb' },
          modal: {
            ondismiss: function () {
              toast.error('Payment was cancelled. Please try again.');
            }
          }
        };
        
        // Check if Razorpay is loaded
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          paymentRef.current = new (window as any).Razorpay(options);
          paymentRef.current.open();
        } else {
          console.error('Razorpay not loaded');
          toast.error('Payment gateway not loaded. Please refresh the page.');
          setBookingLoading(false);
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      checkIn: '',
      checkOut: '',
      rooms: undefined,
      adults: undefined,
    });
  };

  // Filter experiences based on selected vibe category
  const filteredExperiences = experiences.filter((exp) => {
    // Filter by vibe category
    if (selectedExperienceCategory && exp.categories) {
      const categoriesStr = String(exp.categories).toLowerCase();
      const selectedCategoryLower = selectedExperienceCategory.toLowerCase();
      if (!categoriesStr.includes(selectedCategoryLower)) {
        return false;
      }
    }
    
    // Filter by content type toggle
    if (selectedContentTypeToggle === 'hyper-local') {
      // Show only experiences for hyper-local
      return true; // Keep all experiences
    } else if (selectedContentTypeToggle === 'retreats') {
      // Hide experiences for retreats mode
      return false;
    }
    
    return true;
  });

  // Filter retreats based on selected category and content type toggle
  const filteredRetreats = retreats.filter((retreat) => {
    // Filter by content type toggle
    if (selectedContentTypeToggle === 'hyper-local') {
      // Hide retreats for hyper-local mode
      return false;
    } else if (selectedContentTypeToggle === 'retreats') {
      // Show retreats for retreats mode
      // Filter by category if selected
      if (selectedRetreatCategory && retreat.categories) {
        const hasCategory = Array.isArray(retreat.categories)
          ? retreat.categories.includes(selectedRetreatCategory)
          : retreat.categories === selectedRetreatCategory;
        return hasCategory;
      }
      return true;
    }
    return false;
  });

  // Filter properties based on content type toggle - Properties moved to search page
  const filteredProperties = properties.filter((property) => {
    // Hide properties from discover page - they are now in search page
    return false;
  });

  const clearAllFilters = () => {
    setSelectedExperienceCategory("");
    setSelectedRetreatCategory("");
    setSelectedContentTypeToggle('hyper-local');
    setSelectedFilterChips([]);
  };

  const hasPropertyFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  // Check if any filters are active
  const hasActiveFilters = selectedFilterChips.length > 0 || 
    selectedExperienceCategory || 
    selectedRetreatCategory || 
    selectedContentTypeToggle !== 'hyper-local';

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <Navigation />
      <div className="relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Horizontal Filter Bar */}
          <div className="mb-8 sticky top-16 z-40 bg-gray-50 py-4 -mx-8 px-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Scrollable Middle Section */}
              <div className="flex-1 overflow-x-auto scrollbar-hide relative">
                <div className="flex items-center gap-3 py-2 pr-16">
                  {/* Scroll gradient indicators - Reduced opacity and width */}
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50/80 to-transparent pointer-events-none z-10"></div>
                  
                  {/* Hyper-local Vibe Filters */}
                  {selectedContentTypeToggle === 'hyper-local' && (
                    <>


                      <button 
                        onClick={() => setSelectedExperienceCategory(selectedExperienceCategory === 'Immersive' ? "" : 'Immersive')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedExperienceCategory === 'Immersive'
                            ? 'bg-purple-100 border-purple-200 text-purple-700 shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Immersive experiences"
                      >
                        <span className="text-xs">🧘</span>
                        <span>Immersive</span>
                      </button>

                      <button 
                        onClick={() => setSelectedExperienceCategory(selectedExperienceCategory === 'Playful' ? "" : 'Playful')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedExperienceCategory === 'Playful'
                            ? 'bg-green-100 border-green-200 text-green-700 shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Playful experiences"
                      >
                        <span className="text-xs">🎮</span>
                        <span>Playful</span>
                      </button>

                      <button 
                        onClick={() => setSelectedExperienceCategory(selectedExperienceCategory === 'Culinary' ? "" : 'Culinary')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedExperienceCategory === 'Culinary'
                            ? 'bg-orange-100 border-orange-200 text-orange-700 shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Culinary experiences"
                      >
                        <span className="text-xs">🍽️</span>
                        <span>Culinary</span>
                      </button>
                    </>
                  )}

                  {/* Retreats Category Filters */}
                  {selectedContentTypeToggle === 'retreats' && (
                    <>
                      <button 
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === 'Couple' ? "" : 'Couple')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedRetreatCategory === 'Couple'
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Couple retreats"
                      >
                        <span className="text-xs">💑</span>
                        <span>Couple</span>
                      </button>

                      <button 
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === 'Solo' ? "" : 'Solo')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedRetreatCategory === 'Solo'
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Solo retreats"
                      >
                        <span className="text-xs">🧘</span>
                        <span>Solo</span>
                      </button>

                      <button 
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === 'Family' ? "" : 'Family')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedRetreatCategory === 'Family'
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Family retreats"
                      >
                        <span className="text-xs">👨‍👩‍👧‍👦</span>
                        <span>Family</span>
                      </button>

                      <button 
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === 'Group' ? "" : 'Group')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedRetreatCategory === 'Group'
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Group retreats"
                      >
                        <span className="text-xs">👥</span>
                        <span>Group</span>
                      </button>

                      <button 
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === 'Purposeful' ? "" : 'Purposeful')}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                          selectedRetreatCategory === 'Purposeful'
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        title="Purposeful retreats"
                      >
                        <span className="text-xs">🎯</span>
                        <span>Purposeful</span>
                      </button>
                    </>
                  )}


                </div>
              </div>



              {/* Content Type Toggle - Fixed Right with proper spacing */}
              <div className="bg-gray-100 rounded-xl p-1 flex flex-shrink-0 ml-4">
                {experienceFilterData.contentType.map((contentType) => (
                  <button
                    key={contentType.id}
                    onClick={() => setSelectedContentTypeToggle(contentType.id as 'hyper-local' | 'retreats')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 h-7 ${
                      selectedContentTypeToggle === contentType.id
                        ? 'bg-yellow-400 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">{contentType.icon}</span>
                    {contentType.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedContentTypeToggle === 'hyper-local' 
                    ? (filters.location ? `Experiences in ${filters.location}` : 'All Experiences')
                    : (filters.location ? `Retreats in ${filters.location}` : 'All Retreats')
                  }
                </h1>
                {!loading && (
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>
                      {selectedContentTypeToggle === 'hyper-local' 
                        ? `${filteredExperiences.length} experiences`
                        : `${filteredRetreats.length} retreats`
                      }
                    </span>
                  </div>
                )}
              </div>
              

            </div>

            {/* Active Filters Display */}
            {(hasPropertyFilters || hasActiveFilters) && (
              <div 
                className="flex flex-wrap gap-2 mt-4 animate-fade-in"
              >
                {filters.location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <MapPinIcon className="w-4 h-4" />
                    {filters.location}
                  </span>
                )}
                {filters.checkIn && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Check-in: {filters.checkIn}
                  </span>
                )}
                {filters.checkOut && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Check-out: {filters.checkOut}
                  </span>
                )}
                {filters.adults && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {filters.adults} adults
                  </span>
                )}

              </div>
            )}
          </div>

          {/* Combined Results Section */}
          {loading || loadingExperiences || loadingRetreats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (filteredExperiences.length === 0 && filteredRetreats.length === 0) ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {selectedContentTypeToggle === 'hyper-local' ? 'experiences' : 'retreats'} found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or browse our popular destinations
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Experiences */}
              {filteredExperiences.map((exp, index) => {
                const isWishlisted = wishlistedExperienceIds.includes(exp.id);
                return (
                  <Link
                    key={exp.id}
                    href={`/experiences/${exp.id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={buildCoverFirstImages(exp.cover_image, exp.images)[0] || '/placeholder-experience.jpg'}
                        alt={exp.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {exp.categories && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {exp.categories}
                          </span>
                        </div>
                      )}
                      
                      {/* Saved Button - Top Right */}
                      {user && (
                        <button 
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(exp.id, isWishlisted, e)}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          disabled={false}
                        >
                          {isWishlisted ? (
                            <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                          )}
                        </button>
                      )}
                      

                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-tight mb-2">
                        {exp.title}
                      </h3>
                      
                      {/* Location & Duration */}
                      <div className="flex items-center gap-3 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="text-xs">{exp.location}</span>
                        </div>
                        {exp.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span className="text-xs">{exp.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-gray-900">₹{exp.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">/ person</span>
                        </div>
                      </div>

                      {/* Engagement Icons */}
                      <EngagementIcons 
                        itemId={exp.id}
                        itemType="experience"
                        itemTitle={exp.title}
                        itemUrl={`/experiences/${exp.id}`}
                      />
                    </div>
                  </Link>
                );
              })}
              
              {/* Retreats */}
              {filteredRetreats.map((retreat, index) => {
                const isWishlisted = wishlistedRetreatIds.includes(retreat.id);
                return (
                  <Link
                    key={retreat.id}
                    href={`/retreats/${retreat.id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={buildCoverFirstImages(retreat.image || retreat.cover_image, retreat.images)[0] || '/placeholder-experience.jpg'}
                        alt={retreat.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {retreat.categories && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {Array.isArray(retreat.categories) ? retreat.categories[0] : retreat.categories}
                          </span>
                        </div>
                      )}
                      
                      {/* Saved Button - Top Right */}
                      {user && (
                        <button 
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleRetreatWishlist(retreat.id, isWishlisted, e)}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          disabled={false}
                        >
                          {isWishlisted ? (
                            <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                          )}
                        </button>
                      )}
                      

                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-tight mb-2">
                        {retreat.title}
                      </h3>
                      
                      {/* Location & Duration */}
                      <div className="flex items-center gap-3 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="text-xs">{retreat.location}</span>
                        </div>
                        {retreat.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span className="text-xs">{retreat.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-gray-900">₹{retreat.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">/ person</span>
                        </div>
                      </div>

                      {/* Engagement Icons */}
                      <EngagementIcons 
                        itemId={retreat.id}
                        itemType="retreat"
                        itemTitle={retreat.title}
                        itemUrl={`/retreats/${retreat.id}`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      <Modal open={bookingOpen} onClose={closeBooking}>
        <div className="space-y-6">
          {/* Item Summary */}
          {selectedItem && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={buildCoverFirstImages(selectedItem.cover_image || selectedItem.image, selectedItem.images)[0] || '/placeholder-experience.jpg'}
                    alt={selectedItem.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedItem.title}</h3>
                  <p className="text-gray-600 text-xs truncate">{selectedItem.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-yellow-600">₹{selectedItem.price?.toLocaleString()}</span>
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
                    max={selectedItem?.max_guests || 10}
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
              {selectedItem && form.date && form.guests > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per person:</span>
                      <span>₹{selectedItem.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of guests:</span>
                      <span>{form.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(form.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-yellow-600">₹{(selectedItem.price * form.guests).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  loading={bookingLoading || paymentInProgress} 
                  disabled={bookingLoading || paymentInProgress || !form.date || !form.name || !form.email || !form.phone || form.guests < 1}
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



      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <Footer />
    </div>
  );
} 