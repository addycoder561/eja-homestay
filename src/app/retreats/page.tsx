"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { getRetreats, createTripBooking } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isWishlisted, addToWishlist, removeFromWishlist } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ImageCarousel } from '@/components/ImageCarousel';
import { buildCoverFirstImages } from '@/lib/media';

type Retreat = {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  duration?: string;
  images: string[];
  cover_image?: string;
  image?: string | null;
  categories?: string | string[];
  created_at?: string;
  updated_at?: string;
};

export default function RetreatsPage() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Retreat | null>(null);
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
  const [trips, setTrips] = useState<Retreat[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Category filter options
  const categoryOptions = [
    'Couple',
    'Solo',
    'Pet-Friendly',
    'Family',
    'Purposeful',
    'Senior Citizen',
    'Group',
    'Parents'
  ];

  // Fetch retreats from database
  useEffect(() => {
    const fetchRetreats = async () => {
      try {
        setLoadingTrips(true);
        const data = await getRetreats();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching retreats:', error);
        toast.error('Failed to load retreats');
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchRetreats();
  }, []);

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      // Search by title, description, location (like experiences)
      if (
        searchQuery &&
        !trip.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !((trip.description || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        !trip.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory && trip.categories) {
        const hasCategory = Array.isArray(trip.categories)
          ? trip.categories.includes(selectedCategory)
          : trip.categories === selectedCategory;
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [trips, searchQuery, selectedCategory]);

  const openBooking = (trip: Retreat) => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/retreats?book=${trip.id}`);
      return;
    }
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  // Open modal automatically if ?book=<id> is present and user is authenticated
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (!bookId || bookingOpen) return;
    const trip = trips.find(t => t.id === bookId);
    if (!trip) return;
    setSelectedTrip(trip);
    if (user && profile) {
      setBookingOpen(true);
    } else {
      router.push(`/auth/signin?redirect=/retreats?book=${bookId}`);
    }
    // eslint-disable-next-line
  }, [searchParams, user, profile, trips, bookingOpen]);

  useEffect(() => {
    let ignore = false;
    async function fetchWishlist() {
      if (user) {
        const wishlist = await Promise.all(filtered.map(trip => isWishlisted(user.id, trip.id, 'trip')));
        if (!ignore) {
          setWishlistedIds(filtered.map((trip, i) => wishlist[i] ? trip.id : '').filter(Boolean));
        }
      } else {
        setWishlistedIds([]);
      }
    }
    fetchWishlist();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleWishlist = async (tripId: string, wishlisted: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add retreats to wishlist');
      return;
    }
    try {
      if (wishlisted) {
        const success = await removeFromWishlist(user.id, tripId, 'trip');
        if (success) {
          setWishlistedIds(ids => ids.filter(id => id !== tripId));
          toast.success('Retreat removed from wishlist');
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const success = await addToWishlist(user.id, tripId, 'trip');
        if (success) {
          setWishlistedIds(ids => [...ids, tripId]);
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

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedTrip(null);
    setForm({ name: "", email: "", date: "", guests: 1 });
    // If URL has ?book=..., remove it so the auto-open effect doesn't re-trigger
    if (searchParams.get('book')) {
      router.replace('/retreats');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please sign in to book a retreat.');
      return;
    }
    setLoading(true);
    setPaymentInProgress(true);
    try {
      if (!selectedTrip) throw new Error("No retreat selected");
      const totalPrice = selectedTrip.price * form.guests;
      // Create order on server
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'INR', notes: { type: 'retreat', tripId: selectedTrip.id } }),
      });
      const { order, error } = await orderRes.json();
      if (!order) throw new Error(error || 'Failed to initialize payment');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: selectedTrip.title,
        description: 'Retreat Payment',
        order_id: order.id,
        handler: async function (response: any) {
          await createTripBooking({
            tripId: selectedTrip.id,
            email: profile.email,
            name: profile.full_name || '',
            date: form.date,
            guests: form.guests,
            totalPrice,
            guestId: profile.id,
          });
          setPaymentInProgress(false);
          setLoading(false);
          await sendPaymentReceiptEmail({
            to: profile.email,
            guestName: profile.full_name || profile.email,
            bookingType: 'Retreat',
            title: selectedTrip.title,
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
          email: profile.email,
          name: profile.full_name,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
            setPaymentInProgress(false);
            setLoading(false);
            toast.error('Payment was cancelled. Please try again.');
          }
        }
      };
      // @ts-expect-error: Razorpay window type
      ;(window as any).Razorpay && (paymentRef.current = new (window as any).Razorpay(options));
      paymentRef.current.open();
    } catch (err: any) {
      setPaymentInProgress(false);
      setLoading(false);
      toast.error(err.message || "Booking/payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {paymentInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <div className="text-lg font-semibold text-blue-700">Processing payment…</div>
          </div>
        </div>
      )}
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 py-20 mb-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Retreats</h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Explore curated retreats and packages for every kind of traveler. Browse by location and book your next adventure!
              </p>
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search retreats by title, description, or location..."
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
            </div>

            {/* Category Filters */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 border-blue-600 text-white shadow'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                    className="ml-auto px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-right-bottom opacity-10 pointer-events-none" />
        </div>

        {/* Results Counter */}
        <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
          <p className="text-gray-600">
            {filtered.length} retreat{filtered.length !== 1 ? 's' : ''} found
            {(selectedCategory || searchQuery) && (
              <span className="text-blue-600 font-medium"> {`for ${[selectedCategory, searchQuery].filter(Boolean).join(' + ')}`}</span>
            )}
          </p>
        </div>

        {/* Retreats Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {loadingTrips ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading retreats...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No retreats match your search' : 'No retreats available'}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different query or clear filters' : 'Check back later for new retreats'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {filtered.map((trip) => {
              const isBook = wishlistedIds.includes(trip.id);
              return (
                <Link href={`/retreats/${trip.id}`} className="block" key={trip.id}>
                <Card className="relative group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <ImageCarousel images={buildCoverFirstImages(trip.image || trip.cover_image, trip.images)} alt={trip.title} />
                    {user && (
                      <button
                        className="absolute top-4 left-4 z-10 p-1 rounded-full bg-white shadow hover:bg-pink-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlist(trip.id, isBook, e); }}
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
                      ₹{trip.price}
                    </div>
                  </div>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2 pt-4 px-6">
                    <h2 className="text-2xl font-bold text-blue-800 mb-1 drop-shadow-sm">{trip.title}</h2>
                    <div className="text-blue-500 text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      {trip.location}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{trip.duration}</div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                    <p className="text-gray-700 mb-6 min-h-[48px]">{trip.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-700">₹{trip.price}</span>
                      <Button variant="primary" size="md" className="shadow-lg px-6 py-2 text-base font-semibold" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openBooking(trip); }}>
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
            </div>
          )}
        </div>
        <Modal open={bookingOpen} onClose={closeBooking} title={selectedTrip ? `Book: ${selectedTrip.title}` : ""}>
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
      </main>
      <Footer />
    </div>
  );
} 