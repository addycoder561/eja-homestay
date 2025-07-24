"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { createTripBooking } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

type Trip = {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  price: number;
  duration: string;
};

const trips: Trip[] = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-aaaaaaaabbbb",
    title: "Golden Triangle Tour",
    location: "Delhi, Agra, Jaipur",
    description: "Experience the best of North India with this classic circuit.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    price: 8500,
    duration: "5 Days / 4 Nights",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-bbbbbbbbcccc",
    title: "Goa Beach Getaway",
    location: "Goa",
    description: "Relax on pristine beaches and enjoy vibrant nightlife.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    price: 6500,
    duration: "4 Days / 3 Nights",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ccccccccdddd",
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "Cruise through the tranquil backwaters on a houseboat.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    price: 9000,
    duration: "3 Days / 2 Nights",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ddddddddaaaa",
    title: "Himalayan Adventure",
    location: "Leh, Ladakh",
    description: "Thrilling road trip through the majestic Himalayas.",
    image: "https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80",
    price: 12000,
    duration: "7 Days / 6 Nights",
  },
];

export default function TripsPage() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 1,
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<any>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const filtered = selectedLocation
    ? trips.filter((trip) =>
        trip.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : trips;

  const openBooking = (trip: Trip) => {
    if (!user || !profile) {
      router.push(`/auth/signin?redirect=/trips?book=${trip.id}`);
      return;
    }
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  // Open modal automatically if ?book=<id> is present and user is authenticated
  useEffect(() => {
    const bookId = searchParams.get('book');
    if (bookId && user && profile && !bookingOpen) {
      const trip = trips.find(t => t.id === bookId);
      if (trip) {
        setSelectedTrip(trip);
        setBookingOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [searchParams, user, profile]);

  useEffect(() => {
    let ignore = false;
    async function fetchBookmarks() {
      if (user) {
        const bookmarks = await Promise.all(filtered.map(trip => isBookmarked(user.id, trip.id, 'trip')));
        if (!ignore) {
          setBookmarkedIds(filtered.map((trip, i) => bookmarks[i] ? trip.id : '').filter(Boolean));
        }
      } else {
        setBookmarkedIds([]);
      }
    }
    fetchBookmarks();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleBookmark = async (tripId: string, bookmarked: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (bookmarked) {
      await removeBookmark(user.id, tripId, 'trip');
      setBookmarkedIds(ids => ids.filter(id => id !== tripId));
    } else {
      await addBookmark(user.id, tripId, 'trip');
      setBookmarkedIds(ids => [...ids, tripId]);
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedTrip(null);
    setForm({ name: "", email: "", date: "", guests: 1 });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please sign in to book a trip.');
      return;
    }
    setLoading(true);
    setPaymentInProgress(true);
    try {
      if (!selectedTrip) throw new Error("No trip selected");
      const totalPrice = selectedTrip.price * form.guests;
      const options = {
        key: 'rzp_test_C7d9Vbcc9JM8dp',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: selectedTrip.title,
        description: 'Trip Payment',
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
            bookingType: 'Trip',
            title: selectedTrip.title,
            checkIn: form.date,
            checkOut: form.date,
            guests: form.guests,
            totalPrice,
            paymentRef: response.razorpay_payment_id
          });
          toast.success(
            <span>Trip booked and payment successful!<br/><span className="text-xs text-gray-500">Payment Ref: {response.razorpay_payment_id}</span></span>
          );
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
      paymentRef.current = new window.Razorpay(options);
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
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Trips</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
              Explore curated trips and packages for every kind of traveler. Browse by location and book your next adventure!
            </p>
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Search by location..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-blue-200 rounded-lg px-6 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-md"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-right-bottom opacity-10 pointer-events-none" />
        </div>

        {/* Trips Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filtered.map((trip) => {
              const isBook = bookmarkedIds.includes(trip.id);
              return (
                <Card key={trip.id} className="relative group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {user && (
                      <button
                        className="absolute top-4 left-4 z-10 p-1 rounded-full bg-white shadow hover:bg-pink-100"
                        onClick={e => handleBookmark(trip.id, isBook, e)}
                        aria-label={isBook ? 'Remove bookmark' : 'Add bookmark'}
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
                      <Button variant="primary" size="md" className="shadow-lg px-6 py-2 text-base font-semibold" onClick={() => openBooking(trip)}>
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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