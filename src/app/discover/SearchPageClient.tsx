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
import { getProperties, searchProperties, getExperiences, getRetreats, getExperienceCategories, getRetreatCategories, createExperienceBooking, createTripBooking, isBucketlisted, addToBucketlist, removeFromBucketlist, ensureProfile, testBucketlistTable } from '@/lib/database';
import { addReaction } from '@/lib/social-api';
import { PropertyWithHost, SearchFilters as SearchFiltersType, Experience, PropertyType } from '@/lib/types';
import ExperienceModal from '@/components/ExperienceModal';
import RetreatModal from '@/components/RetreatModal';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  XMarkIcon,
  StarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BookmarkIcon as BookmarkOutline,
  FunnelIcon
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



// Category helpers removed as filter chips are no longer shown

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
  // Content filter chip: hyper-local | online | retreats
  const [contentFilter, setContentFilter] = useState<'hyper-local' | 'online' | 'retreats' | 'all'>('all');
  
  // Mood filter states
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read mood parameter from URL on component mount
  useEffect(() => {
    const moodParam = searchParams.get('mood');
    if (moodParam) {
      setSelectedMood(moodParam);
    }
  }, [searchParams]);
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
  
  // Reaction menu states
  const [openReactionMenu, setOpenReactionMenu] = useState<string | null>(null);
  
  // Experience modal states
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<any>(null);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);
  
  // Filter and category UI removed
  


  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const startTime = Date.now();
      
      try {
        // Property search retained for future use; Discover shows experiences/retreats
        const data = await getProperties();
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
  }, [filters]);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const data = await getExperiences();
        setExperiences(data || []);
        
        // Extract unique mood values
        const moods = [...new Set(data?.map(exp => exp.mood).filter(mood => mood && mood.trim() !== '') || [])];
        setAvailableMoods(moods);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setExperiences([]);
        setAvailableMoods([]);
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

  // Category fetching removed

  // Filter state debug removed

  // Fetch wishlist status for experiences
  useEffect(() => {
    let ignore = false;
    async function fetchExperienceWishlist() {
      try {
        if (user && experiences.length > 0) {
          const wishlist = await Promise.all(
            experiences.map(exp => 
              exp && exp.id ? isBucketlisted(user.id, exp.id, 'experiences') : Promise.resolve(false)
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
              retreat && retreat.id ? isBucketlisted(user.id, retreat.id, 'experiences') : Promise.resolve(false)
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

  // Removed global click-outside handler to revert to simpler behavior

  // Wishlist handlers
  const handleExperienceWishlist = async (expId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }
    
    console.log('🔖 Discover page wishlist toggle:', { 
      userId: user.id, 
      experienceId: expId, 
      currentState: wishlisted 
    });
    
    // Test if bucketlist table exists first
    const tableExists = await testBucketlistTable();
    if (!tableExists) {
      toast.error('Bucketlist table not accessible. Please check database setup.');
      return;
    }
    
    try {
      if (wishlisted) {
        console.log('🗑️ Removing experience from bucketlist:', { userId: user.id, expId, itemType: 'experiences' });
        const success = await removeFromBucketlist(user.id, expId, 'experiences');
        console.log('🗑️ Remove result:', success);
        if (success) {
          setWishlistedExperienceIds(ids => ids.filter(id => id !== expId));
          toast.success('Experience removed from saved');
        } else {
          toast.error('Failed to remove from saved');
        }
      } else {
        console.log('➕ Adding experience to bucketlist:', { userId: user.id, expId, itemType: 'experiences' });
        const success = await addToBucketlist(user.id, expId, 'experiences');
        console.log('➕ Add result:', success);
        if (success) {
          setWishlistedExperienceIds(ids => [...ids, expId]);
          toast.success('Experience added to saved');
        } else {
          toast.error('Failed to add to saved');
        }
      }
    } catch (error) {
      console.error('❌ Discover page bucketlist error:', error);
      toast.error('Failed to update saved items');
    }
  };

  const handleRetreatWishlist = async (retreatId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }
    
    try {
      if (wishlisted) {
        console.log('🗑️ Removing retreat from bucketlist:', { userId: user.id, retreatId, itemType: 'experiences' });
        const success = await removeFromBucketlist(user.id, retreatId, 'experiences');
        console.log('🗑️ Remove result:', success);
        if (success) {
          setWishlistedRetreatIds(ids => ids.filter(id => id !== retreatId));
          toast.success('Retreat removed from saved');
        } else {
          toast.error('Failed to remove from saved');
        }
      } else {
        console.log('➕ Adding retreat to bucketlist:', { userId: user.id, retreatId, itemType: 'experiences' });
        const success = await addToBucketlist(user.id, retreatId, 'experiences');
        console.log('➕ Add result:', success);
        if (success) {
          setWishlistedRetreatIds(ids => [...ids, retreatId]);
          toast.success('Retreat added to saved');
        } else {
          toast.error('Failed to add to saved');
        }
      }
    } catch (error) {
      console.error('❌ Discover page retreat bucketlist error:', error);
      toast.error('Failed to update saved items');
    }
  };

  // Reaction handler
  const handleReaction = async (itemId: string, itemType: 'experience' | 'retreat', reactionType: 'wow' | 'care') => {
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }

    try {
      const result = await addReaction(user.id, itemId, itemType, reactionType);
      if (result.success) {
        toast.success(`Reacted with ${reactionType}!`);
      } else {
        toast.error(result.error || 'Failed to react');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to react. Please try again.');
    }
  };

  // Experience modal handlers
  const handleExperienceClick = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsExperienceModalOpen(true);
  };

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false);
    setSelectedExperience(null);
  };

  const handleRetreatClick = (retreat: any) => {
    setSelectedRetreat(retreat);
    setIsRetreatModalOpen(true);
  };

  const handleCloseRetreatModal = () => {
    setIsRetreatModalOpen(false);
    setSelectedRetreat(null);
  };

  // Filter chip handlers removed

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

  // Determine if an experience is "online"
  const isOnlineExperience = (exp: any) => {
    const loc = (exp?.location || '').toLowerCase();
    return loc === 'online' || loc.includes('virtual') || loc.includes('remote');
  };

  // Define retreat order
  const retreatOrder = [
    'Family Getaways',
    'Corporate Retreat',
    'Pet Parent Retreat',
    'Break-Up Retreat',
    'Cousins Meetup Retreat',
    'Sibling Reconnect Retreat',
    'Senior Citizen Retreat',
    'Single Parent Retreat',
    'Wellness Retreat',
    'First Trip Retreat',
    'Silent Retreat',
    'Re-unions Retreat'
  ];

  // Sort retreats by the specified order
  const sortedRetreats = [...retreats].sort((a, b) => {
    const aIndex = retreatOrder.indexOf(a.title);
    const bIndex = retreatOrder.indexOf(b.title);
    
    // If both are in the order array, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order array, sort alphabetically
    return a.title.localeCompare(b.title);
  });

  // Apply mood filter to ALL experiences (regardless of content type)
  const filteredExperiences = experiences.filter((exp) => {
    // If a specific mood is selected, ONLY filter by mood (ignore content filters)
    if (selectedMood !== 'all') {
      const expMood = exp.mood?.trim();
      const filterMood = selectedMood?.trim();
      const moodMatch = expMood === filterMood;
      return moodMatch;
    }
    
    // If "All Moods" is selected, apply content filters
    if (contentFilter === 'retreats') return false;
    if (contentFilter === 'online') return isOnlineExperience(exp);
    if (contentFilter === 'hyper-local') return !isOnlineExperience(exp);
    if (contentFilter === 'all') {
      // When showing all, exclude retreats from experiences section (they have their own section)
      if (exp.location === 'Retreats') return false;
    }
    
    return true;
  });

  // Separate experiences into hyper-local and online for proper ordering
  // Exclude Karaoke Nights from hyper-local since it's displayed separately
  const hyperLocalExperiences = filteredExperiences.filter(exp => !isOnlineExperience(exp) && exp.title !== 'Karaoke Nights');
  const onlineExperiences = filteredExperiences.filter(exp => isOnlineExperience(exp));

  // Only show retreats section when no specific mood is selected and content filter allows it
  const filteredRetreats = (selectedMood === 'all' && (contentFilter === 'retreats' || contentFilter === 'all')) ? sortedRetreats : [];

  // Filter properties based on content type toggle - Properties moved to search page
  const filteredProperties = properties.filter((property) => {
    // Hide properties from discover page - they are now in search page
    return false;
  });

  const clearAllFilters = () => {
    clearFilters();
  };

  const hasPropertyFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  // Active filters limited to date/location now
  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  // Debug filtered results
  console.log('🔍 Filtered results:', {
    selectedMood,
    contentFilter,
    experiences: filteredExperiences.length,
    retreats: filteredRetreats.length,
    totalExperiences: experiences.length,
    onlineExperiences: experiences.filter(isOnlineExperience).length,
    hyperLocalExperiences: experiences.filter(exp => !isOnlineExperience(exp)).length,
    experiencesWithSelectedMood: selectedMood !== 'all' ? experiences.filter(exp => exp.mood?.trim() === selectedMood?.trim()).length : 0
  });
  
  // Debug mood distribution
  console.log('🔍 Mood distribution in all experiences:', 
    experiences.reduce((acc, exp) => {
      const mood = exp.mood?.trim() || 'No Mood';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

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

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {/* Removed "Discover" title and results count as requested */}
              </div>
              
              {/* Mobile Filter Icon */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FunnelIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filters</span>
                  {selectedMood !== 'all' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">1</span>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Mood Filter Chips */}
            <div className="hidden md:block mt-4">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedMood('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedMood === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Moods
                </button>
                {availableMoods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedMood === mood
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
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
                No results found
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
              {/* Retreats First */}
              {filteredRetreats.map((retreat, index) => {
                const isBucketlisted = wishlistedRetreatIds.includes(retreat.id);
                return (
                  <div
                    key={retreat.id}
                    onClick={() => handleRetreatClick(retreat)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={buildCoverFirstImages(retreat.cover_image, retreat.gallery)[0] || '/placeholder-experience.jpg'}
                        alt={retreat.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {retreat.mood && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {retreat.mood}
                          </span>
                        </div>
                      )}
                      
                      {/* Saved Button - Top Right */}
                      {user && (
                        <button 
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleRetreatWishlist(retreat.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
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
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-gray-900">₹{retreat.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">for 2 adults</span>
                        </div>
                        {/* Reaction Menu - Bottom Right */}
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenReactionMenu(openReactionMenu === retreat.id ? null : retreat.id);
                            }}
                          >
                            <span className="text-xl">😮</span>
                          </button>
                          
                          {/* Reaction Options - Controlled by state */}
                          {openReactionMenu === retreat.id && (
                            <div className="absolute bottom-full right-0 mb-2 opacity-100 transition-opacity duration-200 pointer-events-auto">
                              <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1">
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Wow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Wow reaction
                                    handleReaction(exp.id, 'experience', 'wow');
                                  }}
                                >
                                  <span className="text-lg">😮</span>
                                </button>
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Care"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Care reaction
                                    handleReaction(exp.id, 'experience', 'care');
                                  }}
                                >
                                  <span className="text-lg">🥰</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Karaoke Nights Card - Special Active Experience */}
              {(() => {
                // Find Karaoke Nights from experiences
                const karaokeNights = experiences.find(exp => exp.title === 'Karaoke Nights');
                if (!karaokeNights) return null;
                
                const isBucketlisted = wishlistedExperienceIds.includes(karaokeNights.id);
                return (
                  <div
                    key={karaokeNights.id}
                    onClick={() => handleExperienceClick(karaokeNights)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${filteredRetreats.length * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={karaokeNights.cover_image || '/placeholder-experience.jpg'}
                        alt={karaokeNights.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {karaokeNights.mood && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {karaokeNights.mood}
                          </span>
                        </div>
                      )}
                      
                      {/* Active Badge - Top Right */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-green-500/95 backdrop-blur-sm shadow-lg text-white border-green-400">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Active
                        </span>
                      </div>
                      
                      {/* Saved Button - Bottom Right */}
                      {user && (
                        <button 
                          className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(karaokeNights.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
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
                        {karaokeNights.title}
                      </h3>
                      
                      {/* Location & Duration */}
                      <div className="flex items-center gap-3 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="text-xs">{karaokeNights.location}</span>
                        </div>
                        {karaokeNights.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span className="text-xs">{karaokeNights.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-gray-900">₹{karaokeNights.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">/ person</span>
                        </div>
                        {/* Reaction Menu - Bottom Right */}
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenReactionMenu(openReactionMenu === karaokeNights.id ? null : karaokeNights.id);
                            }}
                          >
                            <span className="text-xl">😮</span>
                          </button>
                          
                          {/* Reaction Options - Controlled by state */}
                          {openReactionMenu === karaokeNights.id && (
                            <div className="absolute bottom-full right-0 mb-2 opacity-100 transition-opacity duration-200 pointer-events-auto">
                              <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1">
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Wow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Wow reaction
                                    handleReaction(exp.id, 'experience', 'wow');
                                  }}
                                >
                                  <span className="text-lg">😮</span>
                                </button>
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Care"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Care reaction
                                    handleReaction(exp.id, 'experience', 'care');
                                  }}
                                >
                                  <span className="text-lg">🥰</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Hyper-local Experiences */}
              {hyperLocalExperiences.map((exp, index) => {
                const isBucketlisted = wishlistedExperienceIds.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => handleExperienceClick(exp)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={exp.cover_image || '/placeholder-experience.jpg'}
                        alt={exp.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {exp.mood && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {exp.mood}
                          </span>
                        </div>
                      )}
                      
                      {/* Upcoming Label - Top Right (except for Karaoke Nights) */}
                      {exp.title !== 'Karaoke Nights' && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-yellow-500/95 backdrop-blur-sm shadow-lg text-white border-yellow-400">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Upcoming
                          </span>
                        </div>
                      )}
                      
                      {/* Saved Button - Top Right (only if no Upcoming label) */}
                      {user && exp.title === 'Karaoke Nights' && (
                        <button 
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(exp.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
                            <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                          )}
                        </button>
                      )}
                      
                      {/* Saved Button - Bottom Right (when Upcoming label is shown) */}
                      {user && exp.title !== 'Karaoke Nights' && (
                        <button 
                          className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(exp.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
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
                        {/* Reaction Menu - Bottom Right */}
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenReactionMenu(openReactionMenu === exp.id ? null : exp.id);
                            }}
                          >
                            <span className="text-xl">😮</span>
                          </button>
                          
                          {/* Reaction Options - Controlled by state */}
                          {openReactionMenu === exp.id && (
                            <div className="absolute bottom-full right-0 mb-2 opacity-100 transition-opacity duration-200 pointer-events-auto">
                              <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1">
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Wow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Wow reaction
                                    handleReaction(exp.id, 'experience', 'wow');
                                  }}
                                >
                                  <span className="text-lg">😮</span>
                                </button>
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Care"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Care reaction
                                    handleReaction(exp.id, 'experience', 'care');
                                  }}
                                >
                                  <span className="text-lg">🥰</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              
              {/* Online Experiences */}
              {onlineExperiences.map((exp, index) => {
                const isBucketlisted = wishlistedExperienceIds.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => handleExperienceClick(exp)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={exp.cover_image || '/placeholder-experience.jpg'}
                        alt={exp.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Category Badge - Top Left */}
                      {exp.mood && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/95 backdrop-blur-sm shadow-lg text-gray-700 border-gray-200">
                            {exp.mood}
                          </span>
                        </div>
                      )}
                      
                      {/* Upcoming Label - Top Right (except for Karaoke Nights) */}
                      {exp.title !== 'Karaoke Nights' && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border bg-yellow-500/95 backdrop-blur-sm shadow-lg text-white border-yellow-400">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Upcoming
                          </span>
                        </div>
                      )}
                      
                      {/* Saved Button - Top Right (only if no Upcoming label) */}
                      {user && exp.title === 'Karaoke Nights' && (
                        <button 
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(exp.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
                            <BookmarkSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <BookmarkOutline className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                          )}
                        </button>
                      )}
                      
                      {/* Saved Button - Bottom Right (when Upcoming label is shown) */}
                      {user && exp.title !== 'Karaoke Nights' && (
                        <button 
                          className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-yellow-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          onClick={(e) => handleExperienceWishlist(exp.id, isBucketlisted, e)}
                          aria-label={isBucketlisted ? 'Remove from bucketlist' : 'Add to bucketlist'}
                          disabled={false}
                        >
                          {isBucketlisted ? (
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
                        {/* Reaction Menu - Bottom Right */}
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenReactionMenu(openReactionMenu === exp.id ? null : exp.id);
                            }}
                          >
                            <span className="text-xl">😮</span>
                          </button>
                          
                          {/* Reaction Options - Controlled by state */}
                          {openReactionMenu === exp.id && (
                            <div className="absolute bottom-full right-0 mb-2 opacity-100 transition-opacity duration-200 pointer-events-auto">
                              <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1">
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Wow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Wow reaction
                                    handleReaction(exp.id, 'experience', 'wow');
                                  }}
                                >
                                  <span className="text-lg">😮</span>
                                </button>
                                <button 
                                  className="p-1 hover:scale-110 transition-transform duration-150 animate-bounce" 
                                  title="Care"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenReactionMenu(null);
                                    // Handle Care reaction
                                    handleReaction(exp.id, 'experience', 'care');
                                  }}
                                >
                                  <span className="text-lg">🥰</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Drawer - Increased height to show all chips */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl h-[45vh] overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filter by Mood</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content - Flexbox Layout for Variable Chip Sizes */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSelectedMood('all');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedMood === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  All Moods
                </button>
                {availableMoods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => {
                      setSelectedMood(mood);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedMood === mood
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Experience Modal */}
      <ExperienceModal 
        experience={selectedExperience}
        isOpen={isExperienceModalOpen}
        onClose={handleCloseExperienceModal}
      />
      
      <RetreatModal 
        retreat={selectedRetreat}
        isOpen={isRetreatModalOpen}
        onClose={handleCloseRetreatModal}
      />
      
      <Footer />
    </div>
  );
} 