"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { createExperienceBooking, getExperiences } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { Experience } from '@/lib/types';
import Link from 'next/link';
import { ImageCarousel } from '@/components/ImageCarousel';
import { buildCoverFirstImages } from '@/lib/media';

// Filter data for experiences
const filterData = {
  category: [
    { id: 'immersive', label: 'Immersive', icon: '🧘' },
    { id: 'playful', label: 'Playful', icon: '🎮' },
    { id: 'culinary', label: 'Culinary', icon: '🍽️' },
    { id: 'meaningful', label: 'Meaningful', icon: '❤️' }
  ]
};

export default function ExperiencesPage() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToggle, setSelectedToggle] = useState<'mountains' | 'delhi-ncr'>('mountains');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 1,
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<any>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // Fetch experiences from database
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const data = await getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        toast.error('Failed to load experiences');
      } finally {
        setLoadingExperiences(false);
      }
    };

    fetchExperiences();
  }, []);

  const filtered = experiences.filter((exp) => {
    // Filter by search query
    if (searchQuery && !exp.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !(exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) &&
        !exp.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by toggle selection (Mountains vs Delhi-NCR)
    if (selectedToggle === 'mountains' && !exp.location.toLowerCase().includes('mountain') && !exp.location.toLowerCase().includes('rishikesh') && !exp.location.toLowerCase().includes('manali') && !exp.location.toLowerCase().includes('shimla') && !exp.location.toLowerCase().includes('mussoorie') && !exp.location.toLowerCase().includes('nainital')) {
      return false;
    }
    if (selectedToggle === 'delhi-ncr' && !exp.location.toLowerCase().includes('delhi') && !exp.location.toLowerCase().includes('ncr') && !exp.location.toLowerCase().includes('gurgaon') && !exp.location.toLowerCase().includes('noida')) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && exp.categories) {
      if (exp.categories !== selectedCategory) return false;
    }
    
    // Only show active experiences
    if (!exp.is_active) {
      return false;
    }
    
    return true;
  });

  const openBooking = (exp: Experience) => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/experiences?book=${exp.id}`);
      return;
    }
    setSelectedExp(exp);
    setBookingOpen(true);
  };

  // Open modal automatically if ?book=<id> is present and user is authenticated
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (bookId && user && profile && !bookingOpen) {
      const exp = experiences.find(e => e.id === bookId);
      if (exp) {
        setSelectedExp(exp);
        setBookingOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [searchParams, user, profile]);

  useEffect(() => {
    let ignore = false;
    async function fetchWishlist() {
      if (user) {
        const wishlist = await Promise.all(filtered.map(exp => isWishlisted(user.id, exp.id, 'experience')));
        if (!ignore) {
          setWishlistedIds(filtered.map((exp, i) => wishlist[i] ? exp.id : '').filter(Boolean));
        }
      } else {
        setWishlistedIds([]);
      }
    }
    fetchWishlist();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleWishlist = async (expId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add experiences to wishlist');
      return;
    }
    
    try {
      if (wishlisted) {
        const success = await removeFromWishlist(user.id, expId, 'experience');
        if (success) {
          setWishlistedIds(ids => ids.filter(id => id !== expId));
          toast.success('Experience removed from wishlist');
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, expId, 'experience');
        if (success) {
          setWishlistedIds(ids => [...ids, expId]);
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

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedExp(null);
    setForm({ name: "", email: "", date: "", guests: 1 });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp || !user || !profile) return;

    setLoading(true);
    try {
      const booking = await createExperienceBooking({
        experienceId: selectedExp.id,
        guestId: user.id,
        email: profile.email,
        name: profile.full_name || "",
        date: form.date,
        guests: form.guests,
        totalPrice: selectedExp.price * form.guests,
      });

      if (booking) {
        // Initialize Razorpay via server-created order
        const orderRes = await fetch('/api/payments/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: selectedExp.price * form.guests * 100, currency: 'INR', notes: { type: 'experience', experienceId: selectedExp.id } }),
        });
        const { order, error } = await orderRes.json();
        if (!order) throw new Error(error || 'Failed to initialize payment');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'EJA Homestay',
          description: `Booking for ${selectedExp.title}`,
          order_id: order.id,
          handler: async function (response: any) {
            try {
              // Send email receipt
              await sendPaymentReceiptEmail({
                to: profile.email,
                guestName: profile.full_name || '',
                bookingType: 'experience',
                title: selectedExp.title,
                checkIn: form.date,
                checkOut: form.date,
                guests: form.guests,
                totalPrice: selectedExp.price * form.guests,
                paymentRef: response.razorpay_payment_id,
              });

              toast.success('Booking confirmed! Check your email for details.');
              closeBooking();
              router.push('/guest/dashboard');
            } catch (error) {
              console.error('Error sending email:', error);
              toast.success('Booking confirmed!');
              closeBooking();
              router.push('/guest/dashboard');
            }
          },
          prefill: {
            name: profile.full_name || '',
            email: profile.email,
            contact: profile.phone || '',
          },
          theme: {
            color: '#3B82F6',
          },
        } as any;

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const FilterChip = ({ 
    icon, 
    label, 
    isSelected, 
    onClick 
  }: { 
    icon: string; 
    label: string; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap text-sm font-medium min-w-[70px] ${
        isSelected
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-normal">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Hero Section with Filters */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Local Experiences</h1>
            <p className="text-xl text-blue-100">Discover unique experiences curated by locals</p>
          </div>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search experiences by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 text-gray-900 bg-white rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Exact Thrillophilia-style Filter Bar */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-4">
              {/* Left Scroll Button */}
              <button className="flex-shrink-0 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Scrollable Filter Chips */}
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1">
                {/* Category Filters */}
                {filterData.category.map((category) => (
                  <FilterChip
                    key={category.id}
                    icon={category.icon}
                    label={category.label}
                    isSelected={selectedCategory === category.label}
                    onClick={() => setSelectedCategory(selectedCategory === category.label ? "" : category.label)}
                  />
                ))}
              </div>

              {/* Right Scroll Button */}
              <button className="flex-shrink-0 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Segmented Toggle Control */}
              <div className="flex-shrink-0 bg-white border border-gray-300 rounded-lg p-1 flex">
                <button
                  onClick={() => setSelectedToggle('mountains')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedToggle === 'mountains'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Mountains
                </button>
                <button
                  onClick={() => setSelectedToggle('delhi-ncr')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedToggle === 'delhi-ncr'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Delhi-NCR
                </button>
              </div>
            </div>

            {/* Clear Filters - Below the main filter bar */}
            {(selectedCategory || searchQuery) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-gray-600 font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filtered.length} experience{filtered.length !== 1 ? 's' : ''} found
            {(selectedCategory || searchQuery) && (
              <span className="text-blue-600 font-medium">
                {' '}for {[selectedCategory, searchQuery].filter(Boolean).join(' + ')}
              </span>
            )}
            <span className="text-blue-600 font-medium">
              {' '}in {selectedToggle === 'mountains' ? 'Mountains' : 'Delhi-NCR'}
            </span>
          </p>
        </div>

        {loadingExperiences ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new experiences.</p>
            {(selectedLocation || selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedLocation("");
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {filtered.map((exp) => {
              const isBook = wishlistedIds.includes(exp.id);
              return (
                <Link href={`/experiences/${exp.id}`} className="block" key={exp.id}>
                <Card className="relative group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <ImageCarousel images={buildCoverFirstImages(exp.cover_image, exp.images)} alt={exp.title} />
                    {user && (
                      <button
                        className="absolute top-4 left-4 z-10 p-1 rounded-full bg-white shadow hover:bg-pink-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlist(exp.id, isBook, e); }}
                        aria-label={isBook ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isBook ? (
                          <HeartSolid className="w-6 h-6 text-pink-500" />
                        ) : (
                          <HeartOutline className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                      ₹{exp.price}
                    </div>
                  </div>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2 pt-4 px-6">
                    <h2 className="text-2xl font-bold text-blue-800 mb-1 drop-shadow-sm">{exp.title}</h2>
                    <div className="flex items-center justify-between">
                      <div className="text-blue-500 text-sm font-medium flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                        {exp.location}
                      </div>
                      {exp.duration && (
                        <div className="text-blue-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
                          {exp.duration}
                        </div>
                      )}
                    </div>
                    {exp.categories && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {exp.categories}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                    <p className="text-gray-700 mb-6 min-h-[48px]">{exp.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-700">₹{exp.price}</span>
                      <Button variant="primary" size="md" className="shadow-lg px-6 py-2 text-base font-semibold" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openBooking(exp); }}>
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
            </div>
          </>
        )}
      </main>
      <Modal open={bookingOpen} onClose={closeBooking} title={selectedExp ? `Book: ${selectedExp.title}` : ""}>
        {loadingAuth ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-700 mb-4">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-4">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="Guests"
              type="number"
              min={1}
              value={form.guests}
              onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))}
              required
            />
            <Button type="submit" variant="primary" size="md" loading={loading || paymentInProgress} disabled={loading || paymentInProgress} className="w-full text-lg font-bold">
              Confirm Booking
            </Button>
          </form>
        )}
      </Modal>
      <Footer />
    </div>
  );
} 