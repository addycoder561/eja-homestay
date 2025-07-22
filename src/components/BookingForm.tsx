'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PropertyWithReviews } from '@/lib/types';
import { createBooking, checkAvailability } from '@/lib/database';
import { GuestSelector } from '@/components/GuestSelector';
import toast from 'react-hot-toast';
import { sendBookingConfirmationEmail, sendBookingConfirmationSMS } from '@/lib/notifications';
import Script from 'next/script';
import { useRef } from 'react';
import { sendPaymentReceiptEmail } from '@/lib/notifications';

interface BookingFormProps {
  property: PropertyWithReviews;
}

export function BookingForm({ property }: BookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const paymentRef = useRef<any>(null);

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    return nights * property.price_per_night;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a property');
      router.push('/auth/signin');
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (formData.adults > property.max_guests) {
      toast.error(`Maximum ${property.max_guests} guests allowed`);
      return;
    }
    setLoading(true);
    setPaymentInProgress(true);
    try {
      const totalPrice = calculateTotalPrice();
      const options = {
        key: 'rzp_test_C7d9Vbcc9JM8dp',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: property.title,
        description: 'Booking Payment',
        handler: async function (response: any) {
          // On payment success, create booking
          const booking = await createBooking({
            property_id: property.id,
            guest_id: user.id,
            check_in_date: formData.checkIn,
            check_out_date: formData.checkOut,
            guests_count: formData.adults,
            total_price: totalPrice,
            special_requests: formData.specialRequests || null,
            status: 'paid',
          });
          setPaymentInProgress(false);
          setLoading(false);
          if (booking) {
            await sendPaymentReceiptEmail({
              to: user.email,
              guestName: user.user_metadata?.full_name || user.email,
              bookingType: 'Homestay',
              title: property.title,
              checkIn: formData.checkIn,
              checkOut: formData.checkOut,
              guests: formData.adults,
              totalPrice,
              paymentRef: response.razorpay_payment_id
            });
            toast.success(
              <span>Booking created and payment successful!<br/><span className="text-xs text-gray-500">Payment Ref: {response.razorpay_payment_id}</span></span>
            );
            router.push('/guest/dashboard');
          } else {
            toast.error('Failed to create booking after payment');
          }
        },
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name,
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
      // @ts-expect-error
      paymentRef.current = new window.Razorpay(options);
      paymentRef.current.open();
    } catch (error) {
      setPaymentInProgress(false);
      setLoading(false);
      toast.error('An error occurred while processing payment');
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {paymentInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <div className="text-lg font-semibold text-blue-700">Processing payment…</div>
          </div>
        </div>
      )}
      <Card className="sticky top-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">₹{property.price_per_night}</span>
            <span className="text-gray-600">per night</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{property.average_rating?.toFixed(1) || '0.0'} ({property.review_count || 0} reviews)</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Check-in"
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Check-out"
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Guest Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Guests</label>
              <GuestSelector
                value={{ rooms: formData.rooms, adults: formData.adults }}
                onChange={(val) => setFormData({ ...formData, ...val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special requests (optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any special requests or requirements..."
              />
            </div>
            {nights > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>₹{property.price_per_night} × {nights} nights</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            )}
            <Button
              type="submit"
              loading={loading || paymentInProgress}
              className="w-full"
              disabled={!formData.checkIn || !formData.checkOut || loading || paymentInProgress}
            >
              Book Now & Pay
            </Button>
            {!user && (
              <p className="text-sm text-gray-600 text-center">
                You need to be signed in to book this property
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
} 