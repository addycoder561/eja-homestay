"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { createExperienceBooking } from "@/lib/database";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { sendPaymentReceiptEmail } from '@/lib/notifications';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/database';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

type Experience = {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  price: number;
};

const experiences: Experience[] = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-111111111111",
    title: "Sunrise Mountain Hike",
    location: "Manali, Himachal Pradesh",
    description: "Start your day with a guided sunrise trek and breathtaking views.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    price: 1200,
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-222222222222",
    title: "Local Food Tasting Tour",
    location: "Jaipur, Rajasthan",
    description: "Sample the best of Rajasthani cuisine with a local expert.",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80",
    price: 900,
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-333333333333",
    title: "Pottery Workshop",
    location: "Pune, Maharashtra",
    description: "Get your hands dirty and create your own pottery masterpiece.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    price: 700,
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-444444444444",
    title: "Old City Heritage Walk",
    location: "Varanasi, Uttar Pradesh",
    description: "Explore the hidden gems and stories of the ancient city.",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    price: 500,
  },
];

export default function ExperiencesPage() {
  const { user, profile, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState("");
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
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const filtered = selectedLocation
    ? experiences.filter((exp) =>
        exp.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : experiences;

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
    async function fetchBookmarks() {
      if (user) {
        const bookmarks = await Promise.all(filtered.map(exp => isBookmarked(user.id, exp.id, 'experience')));
        if (!ignore) {
          setBookmarkedIds(filtered.map((exp, i) => bookmarks[i] ? exp.id : '').filter(Boolean));
        }
      } else {
        setBookmarkedIds([]);
      }
    }
    fetchBookmarks();
    return () => { ignore = true; };
  }, [user, filtered]);

  const handleBookmark = async (expId: string, bookmarked: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (bookmarked) {
      await removeBookmark(user.id, expId, 'experience');
      setBookmarkedIds(ids => ids.filter(id => id !== expId));
    } else {
      await addBookmark(user.id, expId, 'experience');
      setBookmarkedIds(ids => [...ids, expId]);
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedExp(null);
    setForm({ name: "", email: "", date: "", guests: 1 });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please sign in to book an experience.');
      return;
    }
    setLoading(true);
    setPaymentInProgress(true);
    try {
      if (!selectedExp) throw new Error("No experience selected");
      const totalPrice = selectedExp.price * form.guests;
      const options = {
        key: 'rzp_test_C7d9Vbcc9JM8dp',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: selectedExp.title,
        description: 'Experience Payment',
        handler: async function (response: any) {
          await createExperienceBooking({
            experienceId: selectedExp.id,
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
            bookingType: 'Experience',
            title: selectedExp.title,
            checkIn: form.date,
            checkOut: form.date,
            guests: form.guests,
            totalPrice,
            paymentRef: response.razorpay_payment_id
          });
          toast.success(
            <span>Experience booked and payment successful!<br/><span className="text-xs text-gray-500">Payment Ref: {response.razorpay_payment_id}</span></span>
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
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Local Experiences</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
              Discover curated local experiences to make your stay unforgettable. Browse by location and book instantly!
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

        {/* Experiences Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filtered.map((exp) => {
              const isBook = bookmarkedIds.includes(exp.id);
              return (
                <Card key={exp.id} className="relative group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {user && (
                      <button
                        className="absolute top-4 left-4 z-10 p-1 rounded-full bg-white shadow hover:bg-pink-100"
                        onClick={e => handleBookmark(exp.id, isBook, e)}
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
                      ₹{exp.price}
                    </div>
                  </div>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2 pt-4 px-6">
                    <h2 className="text-2xl font-bold text-blue-800 mb-1 drop-shadow-sm">{exp.title}</h2>
                    <div className="text-blue-500 text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      {exp.location}
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                    <p className="text-gray-700 mb-6 min-h-[48px]">{exp.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-700">₹{exp.price}</span>
                      <Button variant="primary" size="md" className="shadow-lg px-6 py-2 text-base font-semibold" onClick={() => openBooking(exp)}>
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
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
      </main>
      <Footer />
    </div>
  );
} 