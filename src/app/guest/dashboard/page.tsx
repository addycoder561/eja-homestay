'use client';

import { useEffect, useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { updateBookingStatus } from '@/lib/database';
import { useRouter } from 'next/navigation';

// Experience and trip data for lookup (should be fetched from DB in real app)
const experiences = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-111111111111",
    title: "Sunrise Mountain Hike",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-222222222222",
    title: "Local Food Tasting Tour",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-333333333333",
    title: "Pottery Workshop",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-444444444444",
    title: "Old City Heritage Walk",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
  },
];
const trips = [
  {
    id: "b3b1c2d4-1234-4a1b-9abc-aaaaaaaabbbb",
    title: "Golden Triangle Tour",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-bbbbbbbbcccc",
    title: "Goa Beach Getaway",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ccccccccdddd",
    title: "Kerala Backwaters",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3b1c2d4-1234-4a1b-9abc-ddddddddaaaa",
    title: "Himalayan Adventure",
    image: "https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function GuestDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.email) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) {
        toast.error('Failed to fetch bookings');
        setBookings([]);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };
    if (profile?.id) fetchBookings();
  }, [profile?.id, profile?.email]);

  const getBookingDetails = (booking: any) => {
    if (booking.property_id) {
      return {
        type: 'Homestay',
        title: booking.property_title || 'Homestay',
        image: booking.property_image || '/globe.svg',
      };
    }
    if (booking.experience_id) {
      const exp = experiences.find(e => e.id === booking.experience_id);
      return {
        type: 'Experience',
        title: exp?.title || 'Experience',
        image: exp?.image || '/globe.svg',
      };
    }
    if (booking.trip_id) {
      const trip = trips.find(t => t.id === booking.trip_id);
      return {
        type: 'Trip',
        title: trip?.title || 'Trip',
        image: trip?.image || '/globe.svg',
      };
    }
    return { type: 'Booking', title: 'Booking', image: '/globe.svg' };
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 ml-2"><span role="img" aria-label="paid">✅</span> Paid</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 ml-2"><span role="img" aria-label="pending">⏳</span> Pending</span>;
      case 'failed':
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 ml-2"><span role="img" aria-label="failed">❌</span> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 ml-2">{status}</span>;
    }
  };

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const generateReceipt = (booking: any, details: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Booking Receipt', 14, 18);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${booking.id}`, 14, 30);
    doc.text(`Type: ${details.type}`, 14, 38);
    doc.text(`Title: ${details.title}`, 14, 46);
    doc.text(`Date: ${booking.check_in_date}`, 14, 54);
    doc.text(`Guests: ${booking.guests_count}`, 14, 62);
    doc.text(`Status: ${booking.status}`, 14, 70);
    doc.text(`Total Price: ₹${booking.total_price}`, 14, 78);
    if (booking.payment_ref || booking.razorpay_payment_id) {
      doc.text(`Payment Ref: ${booking.payment_ref || booking.razorpay_payment_id}`, 14, 86);
    }
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 102);
    doc.save(`receipt_${booking.id}.pdf`);
  };

  const canCancel = (booking: any) => {
    const isPaid = booking.status === 'paid';
    const isFuture = new Date(booking.check_in_date) > new Date();
    const notCancelled = booking.status !== 'cancelled';
    return isPaid && isFuture && notCancelled;
  };

  const handleCancel = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'cancelled');
    toast.success('Booking cancelled successfully.');
    // Refresh bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('guest_id', profile!.id)
      .order('created_at', { ascending: false });
    setBookings(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="font-semibold text-gray-700 mr-2">Filter by status:</span>
          {['all', 'paid', 'pending', 'failed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${statusFilter === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        {!user ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-700 mb-4">Please sign in to view your bookings.</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-700">No bookings found for this status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => {
              const details = getBookingDetails(booking);
              return (
                <Card key={booking.id} className="flex flex-col md:flex-row items-center gap-6 bg-white/90 rounded-2xl shadow-lg p-4">
                  <img
                    src={details.image}
                    alt={details.title}
                    className="w-32 h-32 object-cover rounded-xl border shadow"
                  />
                  <CardContent className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2 md:mb-0">
                        {details.type}
                        {statusBadge(booking.status)}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-xl font-bold text-blue-800 mb-1">{details.title}</h2>
                    <div className="text-gray-700 mb-2">
                      <span className="font-semibold">Guests:</span> {booking.guests_count}
                    </div>
                    <div className="text-gray-700 mb-2">
                      <span className="font-semibold">Date:</span> {booking.check_in_date}
                    </div>
                    <div className="text-gray-700 mb-2">
                      <span className="font-semibold">Status:</span> {statusBadge(booking.status)}
                    </div>
                    <div className="text-gray-900 font-bold text-lg mt-2">₹{booking.total_price}</div>
                    {booking.status === 'paid' && (
                      <button
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors text-sm font-semibold"
                        onClick={() => generateReceipt(booking, details)}
                      >
                        Download Receipt
                      </button>
                    )}
                    {booking.status === 'paid' && canCancel(booking) && (
                      <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm font-semibold"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Request Cancellation
                      </button>
                    )}
                    {booking.status === 'paid' && booking.trip_id && (
                      <button
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors text-sm font-semibold"
                        onClick={() => {
                          const trip = trips.find(t => t.id === booking.trip_id);
                          if (trip) {
                            router.push(`/retreats/${trip.id}`);
                          }
                        }}
                      >
                        View Retreat
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 